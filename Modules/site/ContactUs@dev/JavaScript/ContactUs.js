define('ContactUs', [
    'ContactUs.Router',
    'Backbone',
    'SC.Configuration'
], function ContactUs(
    Router,
    Backbone,
    Configuration
) {
    'use strict';

    return {
        mountToApp: function mountToApp(application) {
            var config = Configuration.get('contactUs', {});
            if (config.enabled) {
                return new Router(application);
            }

            return true;
        }
    };
});
