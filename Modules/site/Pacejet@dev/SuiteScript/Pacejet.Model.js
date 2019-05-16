define('Pacejet.Model', [
    'Configuration',
    'Pacejet.Configuration',
    'Pacejet.DataSource.LiveOrder',
    'Pacejet.RequestBuilder',
    'Pacejet.Utils',
    'Pacejet.Carrier.Model',
    'SC.Models.Init',
    'underscore'
], function PacejetModel(
    Configuration,
    PJCfg,
    LiveOrderDataSource,
    RequestBuilder,
    PJUtils,
    Carrier,
    ModelsInit,
    _
) {
    'use strict';


    return {
        name: 'Pacejet',
        sessionCacheKey: 'PJ_Cache',
        getRates: function getRates(options) {
            var source;
            var requestData;
            var response;
            if (options.record.type === 'salesorder' && options.record.id === 'cart') {
                source = LiveOrderDataSource.fetch(options);
                requestData = RequestBuilder.build(source);
            }

            if (source && requestData) {
                response = this.doRequest(requestData);
                this.markFreeShipping(source, response);
                return response;
            }

            throw methodNotAllowedError;
        },

        getFromCache: function getFromCache(data) {
            var sign = PJUtils.hashCode(JSON.stringify(data));
            var cachedInfo = ModelsInit.context.getSessionObject(this.sessionCacheKey);
            var cachedData;

            if (!PJCfg.cacheRateRequest) {
                return null;
            }

            if (cachedInfo) {
                try {
                    cachedData = JSON.parse(cachedInfo);
                } catch (e) {
                    // do nothing
                    nlapiLogExecution('ERROR', 'Cached info', 'cached info not parseable');
                }
            }

            if (cachedData && cachedData.value && (cachedData.signature + '') === (sign + '')) {
                return cachedData;
            }
            return null;
        },
        writeToCache: function writeToCache(signData,data) {
            var sign = PJUtils.hashCode(JSON.stringify(signData));
            ModelsInit.context.setSessionObject(
                this.sessionCacheKey, JSON.stringify(
                    {
                        signature: sign,
                        value: data
                    }
                ));
            return sign;
        },
        doRequest: function doRequest(data) {
            var responseObj;
            var finalRequestData;
            var recoverableError = true;
            var headers;
            var pacejetResponse;
            var successResponse = false;
            var code;
            var countTries = 0;
            var ratesResponse;
            var signature;
            var errorData = [];

            var cachedResponse = this.getFromCache(data);

            finalRequestData = _.extend({}, data, {
                'Location': PJCfg.pjLocation,
                'LicenseID': PJCfg.pjLicenseID,
                'UpsLicenseID': PJCfg.pjUPSRatesKey
            });

            if (cachedResponse) {
                return {
                    status: 'OK',
                    cached: true,
                    signature: cachedResponse.signature,
                    request: finalRequestData,
                    data: cachedResponse.value
                };
            }

            headers = {
                'PacejetLocation': PJCfg.pjLocation,
                'PacejetLicenseKey': PJCfg.pjLicenseKey,
                'Content-Type': 'application/json'
            };

            while (countTries < PJCfg.maxServiceCallRetries && !successResponse && recoverableError) {
                try {
                    responseObj = nlapiRequestURL(
                        PJCfg.serviceUrl + PJCfg.ratesEndpoint,
                        JSON.stringify(finalRequestData),
                        headers,
                        'POST'
                    );

                    code = parseInt(responseObj.getCode(), 10) || 500;

                    if (code >= 200 && code <= 299) {
                        try {
                            pacejetResponse = JSON.parse(responseObj.getBody());
                            successResponse = true;
                        } catch (e) {
                            recoverableError = false;
                            successResponse = false;

                            errorData.push({
                                code: 'ERR_PJ_PARSING',
                                description: 'Error parsing pacejet response as JSON',
                                nativeError: e,
                                extra: {
                                    responseBody: responseObj.getBody()
                                }
                            });
                        }
                    }

                    if (code >= 400 && code <= 499) {
                        recoverableError = false;
                        errorData.push({
                            code: 'ERR_PJ_USER',
                            description: 'Error blamed on user input',
                            extra: {
                                errorCode: responseObj.getCode(),
                                responseBody: responseObj.getBody()
                            }
                        });
                    }
                } catch (e) {
                    nlapiLogExecution('debug', 'PaceJet exception', e);
                    if (e instanceof nlobjError) {
                        switch (e.getCode()) {
                        case 'SSS_REQUEST_TIME_EXCEEDED':
                        case 'SSS_CONNECTION_TIME_OUT':
                        case 'SSS_CONNECTION_CLOSED':
                            countTries++;
                            recoverableError = true;
                            break;
                        default:
                            recoverableError = false;
                            errorData.push({
                                code: 'ERR_PJ_REQUEST',
                                description: 'Error on pacejet request nlapiRequestUrl',
                                nativeError: e
                            });
                            break;
                        }
                    } else {
                        recoverableError = false;
                        errorData.push({
                            code: 'ERR_PJ_UNKNOWN',
                            description: 'Unexpected error',
                            nativeError: e
                        });
                    }
                }
            }

            if (pacejetResponse && pacejetResponse.messageList && pacejetResponse.messageList.length > 0) {
                nlapiLogExecution('DEBUG', 'Pacejet Warning:', JSON.stringify(pacejetResponse.messageList));
            }

            if (successResponse && (!pacejetResponse.errorDetailsList || pacejetResponse.errorDetailsList.length === 0)) {
                ratesResponse = this.parseResponse(pacejetResponse);
                signature = this.writeToCache(data, pacejetResponse);

                return {
                    status: 'OK',
                    signature: signature,
                    request: finalRequestData,
                    data: ratesResponse
                };
            } else if (pacejetResponse.errorDetailsList && pacejetResponse.errorDetailsList.length > 0) {
                errorData.push({
                    code: 'ERR_PJ_USAGE_ERROR',
                    description: 'Error in request acording to pacejet response',
                    nativeError: pacejetResponse.errorDetailsList
                });
            }

            return {
                status: 'ERROR',
                request: finalRequestData,
                errorDetails: errorData,
                data: {
                    shipmethods: []
                }
            };
        },
        markFreeShipping: function markFreeShipping(requestData, responseData) {
            var sm;
            if (requestData && requestData.transaction && requestData.transaction.freeshipping === true) {
                sm = _.findWhere(responseData.data.shipmethods, { xref: Configuration.thirdparties.freeshipping });
                if (sm) {
                    sm.rate = 0;
                }
            }
        },
        parseResponse: function parseResponse(data) {
            var originalShipmethodsData;
            var filteredMethods;
            var sortedMethods;
            var formattedMethods;
            var carriers;

            if (!data || !data.ratingResultsList || data.ratingResultsList.length === 0) {
                return _.extend(data, {
                    shipmethods: []
                });
            }

            originalShipmethodsData = data.ratingResultsList;

            carriers = Carrier.list();
            _.each(originalShipmethodsData, function eachOriginalMethod(pjMethod) {
                var carrierServiceData = _.findWhere(carriers, {
                    carrierClassOfServiceCarrierName: pjMethod.carrierNumber,
                    carrierClassOfServiceCode: pjMethod.carrierClassOfServiceCode,
                    carrierClassOfServiceDescription: pjMethod.carrierClassOfServiceCodeDescription
                });

                if (carrierServiceData) {
                    pjMethod.carrier = carrierServiceData;
                    pjMethod.xref = carrierServiceData.carrierClassOfServiceShipCodeXRef;
                }
            });

            filteredMethods = _.filter(originalShipmethodsData, function onFilter(method) {
                var hasConsignorFreight = !!method.consignorFreight;
                var hasCarrierReferenceInNS = !!method.xref;

                if (hasConsignorFreight && hasCarrierReferenceInNS) {
                    return true;
                }
                return false;
            });

            sortedMethods = _.sortBy(filteredMethods, 'consigneeFreight');

            formattedMethods = _.map(sortedMethods, function onMapFormat(method) {
                return _.extend({}, method, { rate: method.consigneeFreight });
            });

            return _.extend(data, { shipmethods: formattedMethods });
        }
    };
});
