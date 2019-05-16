define('FakeLogin.CookieGateway.Configuration', [
    'underscore',
    'Configuration'
], function FakeLoginCookieGatewayConfiguration(
    _,
    Configuration
) {
    'use strict';

    _.extend(Configuration, {

        crossDomainValidCookieKeys: [{
            key: 'fakeLogin',
            validation: function validateCookie() {
                return true;
            }
        }]
    });
});
