define('LiveChat', [
    'SC.Configuration',
    'jQuery',
    'underscore'
], function LiveChat(
    Configuration,
    jQuery,
    _
) {
    'use strict';

    var setupLiveChat = function setupLiveChat(application) {
        var s;
        var lc;
        // eslint-disable-next-line no-underscore-dangle
        window.__lc = window.__lc || {};
        // eslint-disable-next-line no-underscore-dangle
        window.__lc.ga_version = "ga";
        // eslint-disable-next-line no-underscore-dangle
        window.__lc.license = Configuration.get('thirdparties.livechat.id');
        /* eslint-enable: no-underscore-dangle */

        (function loadLiveChatClosure() {
            lc = document.createElement('script');
            lc.type = 'text/javascript';
            lc.async = true;
            lc.src = (document.location.protocol === 'https:' ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js';
            s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(lc, s);
            application.liveChatPromise.resolve();
        }());
    };

    return {
        mountToApp: function mountToApp(application) {
            application.liveChatPromise = jQuery.Deferred();
            // Do not call zendesk on SEO Engine
            if (SC.ENVIRONMENT.jsEnvironment === 'browser') {
                application.getLayout().once('afterAppendView', function onAfterAppendView() {
                    _.defer(function onDeferedAppendView() {
                        setupLiveChat(application);
                    });
                });
            }
        }
    };
});

