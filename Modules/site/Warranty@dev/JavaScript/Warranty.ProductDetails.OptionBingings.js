define('UpsellItems.ProductDetails.OptionBingings', [
    'ProductDetails.Base.View',
    'SC.Configuration',
    'underscore'
], function WarrantyProductDetailsOptionBingings(
    ProductDetailsBaseView,
    Configuration,
    _
) {
    _.extend(ProductDetailsBaseView.prototype, {
        getBindingEventForOption: _.wrap(ProductDetailsBaseView.prototype.getBindingEventForOption, function getBindingEventForOption(fn, option) {
            if (option.get('cartOptionId') === Configuration.get('warranty.itemOption')) {
                return 'change';
            }

            return fn.apply(this, _.toArray(arguments).slice(1));
        })
    });
});
