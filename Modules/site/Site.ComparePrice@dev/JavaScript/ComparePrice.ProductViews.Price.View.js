define('ComparePrice.ProductViews.Price.View', [
    'ProductViews.Price.View',
    'underscore'
], function ComparePriceProductViewsPriceView(
    ProductViewsPriceView,
    _
) {
    'use strict';

    _.extend(ProductViewsPriceView.prototype, {
        getContext: _.wrap(ProductViewsPriceView.prototype.getContext, function getContext(fn) {
            var priceContainerObject = this.model.getPrice();
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            return _.extend(context, {
                percentDiff: priceContainerObject.percent || ''
            });
        })
    });
});
