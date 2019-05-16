define('ComparePrice.Percent.Product.Model', [
    'Product.Model',
    'bignumber',
    'underscore'
], function ComparePricePercentProductModel(
    ProductModel,
    BigNumber,
    _
) {
    'use strict';

    _.extend(ProductModel.prototype, {
        getPrice: _.wrap(ProductModel.prototype.getPrice, function getPrice(fn) {
            var price = fn.apply(this, _.toArray(arguments).slice(1));
            var comparePrice;
            var compareDiff;
            if (price.price && price.compare_price && price.compare_price > price.price) {
                comparePrice = new BigNumber(price.compare_price);
                compareDiff = comparePrice.minus(price.price);
                price.diff = compareDiff.toNumber();
                price.percent = compareDiff.times(100).dividedBy(price.compare_price).toFixed(2);
            }
            return price;
        })
    });
});
