define('HidePrice.Facets.ItemCell.View', [
    'Facets.ItemCell.View',
    'Product.Model',
    'Cart.QuickAddToCart.View',
    'underscore'
],
function HidePriceFacetsItemCellView(
    ItemCellView,
    ProductModel,
    CartQuickAddToCartView,
    _
) {
    'use strict';

    _.extend(ItemCellView.prototype, {
        getContext: _.wrap(ItemCellView.prototype.getContext, function(fn) {
            var originalRet = fn.apply(this, _.toArray(arguments).slice(1));
            var features = this.model.get('storedescription') || '';
            features = features.replace(/&nbsp;/g, '');
            features = features || '';
            features = features.split(',');
            if (features[0] === '') {
                features = null;
            }
            originalRet.features = features;
            originalRet.mpn = this.model.get('mpn');
            return originalRet;
        })
    });
    _.extend(ItemCellView.prototype.childViews, {
        'Cart.QuickAddToCart': function CartQuickAddToCart() {
            var product = new ProductModel({
                item: this.model,
                quantity: this.model.get('_minimumQuantity', true)
            });
            return new CartQuickAddToCartView({
                hidePrice: this.options.hidePrice,
                model: product,
                application: this.options.application
            });
        }
    });
});
