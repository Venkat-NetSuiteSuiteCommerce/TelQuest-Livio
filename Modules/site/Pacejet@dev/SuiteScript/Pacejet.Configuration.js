define('Pacejet.Configuration', [
    'Configuration',
    'underscore'
], function PacejetConfiguration(
    Configuration,
    _
) {
    'use strict';

    /*
    2948bc17-0c59-ad79-a7fd-d4754633cf21 Pacejetapi
    b07d483e-6f2f-af8b-40a8-beec64b898db Ratings service
    a2c18e3a-3ded-370f-68a6-f96a8230c3b2 UPS

     */
    return (function cfg1() {
        var credentials = {
            pjLocation: 'telquest',
            pjLicenseKey: /*'77eac2da-9a75-f63d-c07a-b312c3b8645e',*/ '2948bc17-0c59-ad79-a7fd-d4754633cf21',
            pjLicenseID: /*'955726f5-207e-562f-c19e-85d9093dc6cf' */ 'b07d483e-6f2f-af8b-40a8-beec64b898db',
            pjUPSRatesKey: 'a2c18e3a-3ded-370f-68a6-f96a8230c3b2'
        };
        return _.extend(credentials, {
            debugMode: true,
            cacheLength: 2 * 60 * 60,
            cacheRateRequest: true,
            defaultLocation: 1,
            defaultWeightUOM: 'LB',
            defaultUnitUOM: 'EA',
            defaultLengthUnits: 'IN',
            serviceUrl: 'https://api.pacejet.cc',
            ratesEndpoint: '/Rates',

            maxServiceCallRetries: 3
        });
    }());
});
