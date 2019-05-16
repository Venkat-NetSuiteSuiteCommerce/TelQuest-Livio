define('FakeLoginBanner.View', [
    'fake_login_banner.tpl',
    'jQuery',
    'Backbone',
    'SC.Configuration',
    'underscore',
    'FakeLogin.Utils'
], function ContactUsView(
    fakeLoginBannerTpl,
    jQuery,
    Backbone,
    Configuration,
    _,
    Utils
) {
    'use strict';

    return Backbone.View.extend({
        template: fakeLoginBannerTpl,
        events: {
          'click .instant-member-banner-close':'closeBanner',
          'click .instant-member-banner-background':'closeBanner'
        },
        closeBanner: function closeBanner(){
            this.$('.instant-member-banner-container').remove();
            this.$('.instant-member-banner-background').remove();
            jQuery.cookie('showFakeLoginBanner', false, { path: '/' });
        },
        getContext: function getContext() {
            var fakeLogin = Utils.getFakeCustomer();
            return {
                showFakeLoginBanner: jQuery.cookie('showFakeLoginBanner'),
                bannerMessage: _.translate(Configuration.get('bannerMessage'), fakeLogin)
            };
        }
    });
});
