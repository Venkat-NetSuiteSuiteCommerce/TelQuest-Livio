define('Site.BxSlider', [
    'SC.Configuration',
    'underscore'
], function SiteBxSlider(
    Configuration,
    _
) {
    return {
        mountToApp: function mountToApp() {
            _.extend(Configuration.get('bxSliderDefaults'), {
                slideMargin: 10,
                shrinkItems: true
            });
        }
    };
});
