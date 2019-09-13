define('ProductDetails.Base.View.Tags', [
    'ProductDetails.Base.View',
    'SC.Configuration',
    'FakeLogin.Utils',
    'jQuery',
    'Utils',
    'underscore'
], function ProductDetailsBaseViewTags(
    ProductDetailsBaseView,
    Configuration,
    FakeLoginUtils,
    jQuery,
    Utils,
    _
) {
    'use strict';

    /* function to cut only full words */
    function textCutter(text, n) {
        var short = text.substr(0, n);
        if (/^\S/.test(text.substr(n))) {
            return short.replace(/\s+\S*$/, '');
        }
        return short;
    }


    _.extend(ProductDetailsBaseView.prototype, {
        events: _.extend(ProductDetailsBaseView.prototype.events || {}, {
            'click [data-target="fakeLogin"]': 'fakeLogin'
        }),

        fakeLogin: function fakeLogin(e) {
            e.preventDefault();
            e.stopPropagation();
            FakeLoginUtils.addFakeLogin();
        },

        getMetaDescription: function getMetaDescription() {
            var metaDescription = this.getMetaTags().filter('[name="description"]').attr('content') || this.model.get('metataghtml') || '';
            if (metaDescription === '') {
                metaDescription = this.model.get('item').get('storedetaileddescription').replace(/<(?:.|\n)*?>/gm, '')
                    || this.model.get('item').get('featureddescription').replace(/<(?:.|\n)*?>/gm, '');
            }
            return textCutter(metaDescription, 156);
        },
        getTitle: _.wrap(ProductDetailsBaseView.prototype.getTitle, function wrapProductDetailsBaseView(fn) {
            var originalResult = (fn.apply(this, _.toArray(arguments).slice(1)));
            // add site name to SEO tag
            if (originalResult.indexOf(Configuration.get('defaultSiteSearchName')) < 0) {
                originalResult = Configuration.get('defaultSiteSearchName') ?
                    Configuration.get('defaultSiteSearchName') + ' ' + originalResult : originalResult;
            }
            return textCutter(originalResult, 156);
        }),

        getContext: _.wrap(ProductDetailsBaseView.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var item = this.model.getItem();
            var show_add_to_cart_checkbox = this.model.getItem().get('custitem_show_add_to_cart');
            var vendorStock = item.get('custitem_vendor_stock');
            var webstore_free_shipping = item.get('custitem_awa_freeshipping');
            var vendor_stock_message = item.get('custitem_vendor_stock_message');
            var hide_add_to_cart_checkbox = this.model.getItem().get('custitem_hide_add_to_cart');
            _.extend(context, {
                isLoggedIn: FakeLoginUtils.isLoggedIn(),
                showCart: (vendorStock > 0 || show_add_to_cart_checkbox) && (hide_add_to_cart_checkbox === false),
                vendor_stock_message: vendor_stock_message,
                webstore_free_shipping: webstore_free_shipping

            });
            return context;
        })
    });
});
