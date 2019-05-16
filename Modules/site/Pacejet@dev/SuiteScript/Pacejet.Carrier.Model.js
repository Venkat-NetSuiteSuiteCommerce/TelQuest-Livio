define('Pacejet.Carrier.Model', [
    'Pacejet.Configuration',
    'SC.Model',
    'underscore'
], function PacejetCarrierModel(
    PJCfg,
    SCModel,
    _
) {
    return SCModel.extend({
        name: 'Pacejet',
        cacheObjKey: 'Pacejet',
        cacheKey: 'carriers',

        list: function list() {
            var responseData;
            var responseDataObj;
            var pacejetResponse;
            var pacejetUrl;
            var headers;


            /* Try to get from cache */
            var carrierCache = nlapiGetCache(this.cacheObjKey);
            responseData = carrierCache.get(this.cacheKey);


            if (responseData && responseData) {
                try {
                    responseDataObj = JSON.parse(responseData);
                    if (responseDataObj.length) {
                        return responseDataObj;
                    }
                } catch (e) {
                    nlapiLogExecution('ERROR', 'Pacejet.Carrier', 'Error getting from cache');
                }
            }

            try {
                pacejetUrl = 'https://api.pacejet.cc/CarrierClassOfServices';
                headers = {
                    'PacejetLocation': PJCfg.pjLocation,
                    'PacejetLicenseKey': PJCfg.pjLicenseKey,
                    'Content-Type': 'application/json'
                };

                pacejetResponse = nlapiRequestURL(pacejetUrl, null, headers);
                responseDataObj = JSON.parse(pacejetResponse.getBody());
            } catch (e) {
                nlapiLogExecution('ERROR', '_getCarriers: exception', e);
            }

            if (responseDataObj && responseDataObj.length) {
                carrierCache.put(this.cacheKey, JSON.stringify(responseDataObj), PJCfg.cacheLength);
                return responseDataObj;
            }

            /* eslint-disable */
            throw {
                errorName: 'PacejetIssue'
            };
            /* eslint-enable */
        }
    });
});
