/* eslint-disable*/
define('SuiteletProxy', [
    'byteLength',
    'underscore'
], function SuiteletProx(
    byteLength,
    _
) {
    'use strict';

    /**
     *
     * @param options
     * @param { string } options.scriptId Suitelet's scriptId
     * @param { string } options.deployId Suitelet's deployId
     * @param { string } options.requestType (POST|GET)
     * @param { boolean } options.isAvailableWithoutLogin is the suitelet avaliable without login.
     * Needed mostly on bootstrapping requests
     * @param { Object } options.parameters request URL parameters
     *
     * @constructor
     */
    var SuiteletProxy = function SuiteletProxy(options) {
        this.options = _.clone(options);
    };

    _.extend(SuiteletProxy.prototype, {
        /**
         * Utility function to append parameters to an url
         * @param url
         * @param parameters
         * @returns {string|*}
         */
        appendParametersToUrl: function appendParametersToUrl(url, parameters) {
            var finalParameters = _.extend({ xml: 'T' }, parameters);
            var newUrl = url;

            newUrl += url.indexOf('?') !== -1 ? '&' : '?';

            _.each(finalParameters, function eachParameters(value, key) {
                newUrl += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
            });

            return newUrl;
        },

        /**
         * parses XML error returned from suitelet call when appending xml=T
         * @param xmlString
         * @returns {*}
         */
        parseXMLError: function parseXMLError(xmlString) {
            var xmlDoc;
            var detail;
            var detailsObject;
            var unknownError = {
                status: 500,
                code: 'ERR_UNKNOWN',
                message: 'Internal error'
            };

            try {
                xmlDoc = nlapiStringToXML(xmlString);
                detail = nlapiSelectNode(xmlDoc, '/onlineError/detail/text()');
                detailsObject = JSON.parse(detail.textContent);

                return {
                    status: 400,
                    code: detailsObject.name,
                    message: detailsObject.message + detailsObject.stack.toString()
                };
            } catch (e) {
                return unknownError;
            }
        },


        paramsToObject: function paramsToObject(parameters) {
            var convertedObject = {};
            var p;
            for (p in parameters) { // eslint-disable-line guard-for-in, no-restricted-syntax
                convertedObject[p] = parameters[p];
            }
            return convertedObject;
        },
        getCacheKey: function getCacheKey() {
            return nlapiEncrypt(JSON.stringify(this.options), 'sha1');
        },
        cacheGet: function cacheRead() {
            var response;
            var cache = this.getCache();
            var responseString = cache.get(this.getCacheKey());
            try {
                response = JSON.parse(responseString);
            } catch (e) {
                console.warn('ERROR ON CACHE', e);
                return false;
            }
            return response || false;
        },
        cachePut: function cachePut(data) {
            var cache = this.getCache();
            var stringData = JSON.stringify(data);

            if (this.options.cache && this.options.cache.enabled && this.options.cache.ttl > 0) {
                try {
                    cache.put(this.getCacheKey(), stringData, this.options.cache && this.options.cache.ttl);
                } catch (e) {
                    console.warn('ERROR WHILE STORING ON CACHE', e);
                }
            } else {
                return false;
            }
            return true;
        },
        getCache: function getCache() {
            return nlapiGetCache('SuiteletCache');
        },

        /**
         * Fetches information from suitelet and returns it parsed
         *
         * @returns {*}
         */
        get: function get() {
            var options = this.options;
            var finalServiceUrl;
            var apiResponse;
            var responseData;
            var unknownError = {
                status: 500,
                code: 'ERR_UNKNONW',
                message: 'Internal error'
            };
            var requestBody;
            var responseCode;
            var hasSessionStablished = (request.getHeader('Cookie') || '').indexOf('JSESSIONID=') !== -1;
            var serviceUrl;
            var requestHeaders = {};
            var currentDomainMatch = request.getURL().match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
            var currentDomain = currentDomainMatch && currentDomainMatch[0];
            var requestParams = this.paramsToObject(request.getAllParameters());
            var cachedResponse;
            var newUrlForSessionRedirect;
            if (currentDomain[currentDomain.length - 1] === '/') {
                currentDomain = currentDomain.slice(0, -1);
            }

            cachedResponse = this.cacheGet();

            if (cachedResponse === false) {
                console.time('SuiteletTime');
                console.log('SUITELET:' + this.options.deployId);
                if (options.isAvailableWithoutLogin) {
                    serviceUrl = nlapiResolveURL(
                        'SUITELET',
                        options.scriptId,
                        options.deployId,
                        true
                    );
                } else {
                    if (!hasSessionStablished) {
                        // throw sessionError;
                        newUrlForSessionRedirect = this.appendParametersToUrl(
                            requestParams.sitepath,
                            _.omit(requestParams, ['sitepath', 'whence'])
                        );

                        nlapiSetRedirectURL('EXTERNAL', newUrlForSessionRedirect);
                        return;
                    }

                    try {
                        serviceUrl = nlapiResolveURL(
                            'SUITELET',
                            options.scriptId,
                            options.deployId,
                            false
                        );
                    } catch (e) {
                        if (e instanceof nlobjError) {
                            if (e.getCode() === 'ILLEGAL_URL_REDIRECT') {
                                newUrlForSessionRedirect = this.appendParametersToUrl(
                                    requestParams.sitepath,
                                    _.omit(requestParams, ['sitepath', 'whence'])
                                );
                                nlapiSetRedirectURL('EXTERNAL', newUrlForSessionRedirect);
                            } else {
                                throw e;
                            }
                        }
                    }

                    serviceUrl = currentDomain + serviceUrl;
                    requestHeaders = request.getAllHeaders();
                }

                finalServiceUrl = this.appendParametersToUrl(serviceUrl, options.parameters);
                requestBody = options.body || null;

                try {
                    apiResponse = nlapiRequestURL(
                        finalServiceUrl,
                        requestBody,
                        requestHeaders,
                        options.requestType || 'GET'
                    );
                } catch (e) {
                    console.timeEnd('SuiteletTime');
                    throw e;
                }

                responseCode = parseInt(apiResponse.getCode(), 10);
                if (responseCode !== 200 && responseCode !== 201) {
                    throw this.parseXMLError(apiResponse.getBody());
                }

                try {
                    responseData = JSON.parse(apiResponse.getBody());
                } catch (e) {
                    console.timeEnd('SuiteletTime');
                    throw unknownError;
                }

                this.cachePut(responseData);

                if (apiResponse.getHeader('Custom-Header-Status') &&
                    parseInt(apiResponse.getHeader('Custom-Header-Status'), 10) !== 200
                ) {
                    console.timeEnd('SuiteletTime');
                    throw _.extend({}, {
                        status: apiResponse.getHeader('Custom-Header-Status'),
                        code: responseData.errorCode,
                        message: responseData.errorMessage
                    });
                }
                console.timeEnd('SuiteletTime');
            } else {
                console.log('SUITELET AVOIDED', this.options.deployId);
                responseData = cachedResponse;
            }
            return responseData; // eslint-disable-line consistent-return
        }
    });

    return SuiteletProxy;
    /* eslint-enable */
});
