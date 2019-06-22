define('ShopperApproved.Banner.View', [
    'shopper_approved_banner.tpl',
    'SC.Configuration',
    'underscore',
    'Backbone',
    'jQuery'
], function ShopperApprovedBannerView(
    shopperApprovedBannerTpl,
    Configuration,
    _,
    Backbone,
    jQuery
) {
    'use strict';

    return Backbone.View.extend({
        template: shopperApprovedBannerTpl,
        events: {
            'click .shopperlink': 'openReviews'
        },
        openReviews: function openReviews(e) {
            var nonwin = (navigator.appName !== 'Microsoft Internet Explorer') ? 'yes' : 'no';
            var h = screen.availHeight - 90;
            var w = 940;
            if (window.innerWidth < 1400) {
                w = 620;
            }
            window.open(jQuery(e.currentTarget).attr('href'), 'shopperapproved',
                'location=' + nonwin + ',scrollbars=yes,width=' + w + ',height=' + h + ',menubar=no,toolbar=no');
            e.stopPropagation();
            e.preventDefault();
        },
        getContext: function getContext() {
            return {
                account: Configuration.get('shoppperapproved.account'),
                domain: 'athq.com' || location.host
            };
        }
    });
});
