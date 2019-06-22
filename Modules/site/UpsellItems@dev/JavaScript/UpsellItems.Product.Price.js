define('UpsellItems.Product.Price', [
    'SC.Configuration',
    'Product.Model',
    'bignumber',
    'underscore',
    'Utils'
], function UpsellProductModel(
    Configuration,
    ProductModel,
    BigNumber,
    _,
    Utils
) {
    'use strict';

    _.extend(ProductModel.prototype, {
        getPrice: _.wrap(ProductModel.prototype.getPrice, function getPrice(fn) {
            var self = this;
            var overridePrice = false;
            var newPrice = {};
            var args = _.toArray(arguments).slice(1);
            var getPriceResult = fn.apply(self, args);
            var priceToAdd = new BigNumber(0);
            var priceLevel = Configuration.get('upsell.pricelevel');
            var upsellsModel = this.upsells;
            var upsellItemOption = self.getOption(Configuration.get('upsell.selectedOption'));
            var selectedUpsellOptions = JSON.parse(upsellItemOption && upsellItemOption.get('value') ?
                upsellItemOption.get('value').internalid : '{}');
            var availableUpsellItems = JSON.parse(this.get('item').get(Configuration.get('upsell.itemField')) || '{}');
            var comparePriceFinal;
            var finalPrice;
            var minFinalPrice;
            var minComparePriceFinal;
            var maxFinalPrice;
            var maxComparePriceFinal;
            var selectedUpsellItem;
            var comparePriceToAdd = new BigNumber(0);
            if (availableUpsellItems && upsellsModel && (_.size(availableUpsellItems) === _.size(upsellsModel)) &&
                selectedUpsellOptions) {
                _.each(selectedUpsellOptions, function eachSelectedUpsellOptions(id, index) {
                    if (upsellsModel[index]) {
                        selectedUpsellItem = upsellsModel[index].get(id);
                        if (selectedUpsellItem) {
                            priceToAdd = priceToAdd.plus(selectedUpsellItem.get(priceLevel) || 0);
                            comparePriceToAdd = comparePriceToAdd.plus(selectedUpsellItem.getPrice().price || selectedUpsellItem.get(priceLevel) || 0);
                        }
                    }
                });
                if (priceToAdd.toNumber() > 0) {
                    overridePrice = true;
                    comparePriceFinal = comparePriceToAdd.plus(getPriceResult.compare_price || 0);
                    finalPrice = priceToAdd.plus(getPriceResult.price || 0);
                    newPrice = {
                        compare_price: comparePriceFinal.toNumber(),
                        compare_price_formatted: Utils.formatCurrency(comparePriceFinal.toNumber()),
                        price: finalPrice.toNumber(),
                        price_formatted: Utils.formatCurrency(finalPrice.toNumber())
                    };
                    if (getPriceResult.min) {
                        minComparePriceFinal = comparePriceToAdd.plus(getPriceResult.min.compare_price || 0);
                        minFinalPrice = priceToAdd.plus(getPriceResult.min.price || 0);
                        newPrice.min = {
                            compare_price: minComparePriceFinal.toNumber(),
                            compare_price_formatted: Utils.formatCurrency(minComparePriceFinal.toNumber()),
                            price: minFinalPrice.toNumber(),
                            price_formatted: Utils.formatCurrency(minFinalPrice.toNumber())
                        };
                    }
                    if (getPriceResult.max) {
                        maxComparePriceFinal = comparePriceToAdd.plus(getPriceResult.max.compare_price || 0);
                        maxFinalPrice = priceToAdd.plus(getPriceResult.max.price || 0);
                        newPrice.max = {
                            compare_price: maxComparePriceFinal.toNumber(),
                            compare_price_formatted: Utils.formatCurrency(maxComparePriceFinal.toNumber()),
                            price: maxFinalPrice.toNumber(),
                            price_formatted: Utils.formatCurrency(maxFinalPrice.toNumber())
                        };
                    }
                }
            }
            return overridePrice ? newPrice : getPriceResult;
        })
    });
});
