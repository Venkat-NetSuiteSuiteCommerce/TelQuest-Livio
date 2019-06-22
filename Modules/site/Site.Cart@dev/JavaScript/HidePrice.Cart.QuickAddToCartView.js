define('HidePrice.Cart.QuickAddToCartView', [
    'Cart.QuickAddToCart.View',
    'ProductViews.Price.View',
    'underscore'
], function HidePriceCartQuickView(
    QuickAddToCartView,
    ProductViewsPriceView,
    _
) {
    'use strict';

    _.extend(QuickAddToCartView.prototype.childViews, {
        'ProductViewsPrice.Price': function ProductViewsPricePrice() {
            if (!this.options.hidePrice) {
                return new ProductViewsPriceView({
                    model: this.model,
                    origin: 'ITEMCELL'
                });
            }
        }
    });
});
