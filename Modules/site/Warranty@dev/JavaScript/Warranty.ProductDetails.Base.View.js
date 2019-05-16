define('Warranty.ProductDetails.Base.View', [
    'ProductDetails.Base.View',
    'ProductDetails.Options.Selector.View',
    'ProductDetails.Full.View',
    'ProductDetails.QuickView.View',
    'underscore'
], function WarrantyProductDetailsBaseView(
    ProductDetailsBaseView,
    ProductDetailsOptionsSelectorView,
    ProductDetailsFullView,
    ProductDetailsQuickViewView,
    _
) {
    'use strict';

    var warrantyOptionChildView = {
        'Warranty.Options': function WarrantyOptions() {
            return new ProductDetailsOptionsSelectorView({
                model: this.model,
                isWarranty: true,
                application: this.application,
                show_pusher: this.showOptionsPusher(),
                show_required_label: this.model.get('item').get('itemtype') === 'GiftCert'
            });

        }
    };

    _.extend(ProductDetailsBaseView.prototype.childViews, warrantyOptionChildView);
    _.extend(ProductDetailsFullView.prototype.childViews, warrantyOptionChildView);
    _.extend(ProductDetailsQuickViewView.prototype.childViews, warrantyOptionChildView);
});
