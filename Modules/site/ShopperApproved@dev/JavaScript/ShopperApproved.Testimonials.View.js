define('ShopperApproved.Testimonials.View', [
    'shopper_approved_testimonials.tpl',
    'SC.Configuration',
    'Backbone'
], function ShopperApprovedTestimonalsView(
    shopperApprovedTestimonialsTpl,
    Configuration,
    Backbone
) {
    return Backbone.View.extend({
        template: shopperApprovedTestimonialsTpl,
        getContext: function getContext() {
            return {
                account: Configuration.get('shoppperapproved.account')
            };
        }
    });
});
