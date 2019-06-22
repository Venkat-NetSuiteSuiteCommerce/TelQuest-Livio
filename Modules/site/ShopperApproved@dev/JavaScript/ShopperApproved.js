define('ShopperApproved', [
    'ShopperApproved.Banner.View',
    'ShopperApproved.Testimonials.View',
    'SC.Configuration',
    'Home.View',
    'Footer.View',
    'jQuery'
], function ShopperApproved(
    ShopperApprovedBannerView,
    ShopperApprovedTestimonialView,
    Configuration,
    HomeView,
    FooterView,
    jQuery
) {
    'use strict';

    var ShopperApprovedBanner = function ShopperApprovedBanner() {
        return new ShopperApprovedBannerView();
    };
    var ShopperApprovedTestimonials = function ShopperApprovedTestimonials() {
        return new ShopperApprovedTestimonialView();
    };
    FooterView.prototype.childViews.ShopperApprovedBanner = ShopperApprovedBanner;
    HomeView.prototype.childViews = {
        'ShopperApprovedTestimonials': ShopperApprovedTestimonials
    };
    return {
        testimonialWidgetLoaded: false,
        mountToApp: function mount(application) {
            var self = this;
            var config = Configuration.shoppperapproved;
            if (!SC.isPageGenerator() && config && config.account) {
                application.getLayout().on('afterAppendView', function AfterAppendView() {
                    if (self.testimonialWidgetLoaded) {
                        window.initsaJQWidget(true);
                    } else {
                        jQuery.getScript('//www.shopperapproved.com/widgets/testimonial/' + config.account + '.js', function getScript() {
                            self.testimonialWidgetLoaded = true;
                        });
                    }
                });
            }
        }
    };
});
