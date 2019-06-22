define('NProgress', [
    'NProgress.Library',
    'jQuery'
], function NProgress(
    nprogress,
    jQuery
) {
    'use strict';

    if (SC.ENVIRONMENT.jsEnvironment === 'browser') {
        SC.loadingIndicatorShow = function loadingIndicatorShow() {
            SC.$loadingIndicator = null;
            nprogress.configure({
                showSpinner: false
            });
            nprogress.start();
        };

        SC.loadingIndicatorHide = function loadingIndicatorHide() {
            SC.$loadingIndicator = null;
            nprogress.done();
        };

        jQuery(document)
            .ajaxStart(SC.loadingIndicatorShow)
            .ajaxStop(SC.loadingIndicatorHide);

        SC.$loadingIndicator = null;
    }
});
