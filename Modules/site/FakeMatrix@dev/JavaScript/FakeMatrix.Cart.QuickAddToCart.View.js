define('FakeMatrix.Cart.QuickAddToCart.View', [
    'Cart.QuickAddToCart.View',
    'underscore'
], function FakeMatrixCartQuickAddToCartView(
    CartQuickAddToCartView,
    _
) {
    _.extend(CartQuickAddToCartView.prototype, {
        getContext: _.wrap(CartQuickAddToCartView.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var itemModel = this.model.get('item');
            return _.extend(context, {
                isParent: itemModel.get('_isParent'),
                url: itemModel.get('urlcomponent')
            });
        })
    });
});
