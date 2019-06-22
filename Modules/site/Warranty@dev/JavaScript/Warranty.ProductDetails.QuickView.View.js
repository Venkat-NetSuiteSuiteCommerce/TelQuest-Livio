define('Warranty.ProductDetails.QuickView.View', [
    'ProductDetails.QuickView.View',
    'underscore'
], function WarrantyProductDetailsQuickViewView(
    ProductDetailsQuickViewView,
    _
) {
    _.extend(ProductDetailsQuickViewView.prototype, {
        initialize: _.wrap(ProductDetailsQuickViewView.prototype.initialize, function initialize(fn) {
            var self = this;
            fn.apply(this, _.toArray(arguments).slice(1));
            this.model.on('change', function onChange() {
                if (!self.model.changed.quantity) {
                    self.generateViewBindings();
                    self.showContent();
                }
            });
        })
    });
});
