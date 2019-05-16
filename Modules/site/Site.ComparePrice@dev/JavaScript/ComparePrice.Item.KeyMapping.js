define('ComparePrice.Item.KeyMapping', [
    'Item.KeyMapping',
    'SC.Configuration',
    'underscore'
], function ComparePriceItemKeyMapping(
    ItemKeyMapping,
    Configuration,
    _
) {
    if (!Configuration.itemKeyMapping) {
        Configuration.itemKeyMapping = {};
    }

    _(Configuration.itemKeyMapping).extend({
        _comparePriceAgainst: function _comparePriceAgainst(item) {
            var prices = item.get('_priceDetails');
            var comparePricelevel = Configuration.get('compareAgainst');

            if (prices) {
                // The priceschedule is the array containing the quantity range and the price
                if (prices.priceschedule) {
                    // The index 0 will be the case when the quantity is greater than 0 and lower than prices.priceschedule[0].maximumquantity
                    return prices.priceschedule[0].price;
                }
            }
            // This is the default price, equivalent to onlinecustomerprice but without taking into account the amount of items into the cart
            // This value returns the 'Base Price'
            return comparePricelevel && item.get('pricelevel' + comparePricelevel) ? item.get('pricelevel' + comparePricelevel) : item.get('pricelevel1');
        },

        // @property {String} _comparePriceAgainstFormated This method a formatted version of the method _comparePriceAgainst
        _comparePriceAgainstFormated: function _comparePriceAgainstFormated(item) {
            var prices = item.get('_priceDetails');
            var comparePricelevel = Configuration.get('compareAgainst');

            if (prices) {
                if (prices.priceschedule) {
                    return prices.priceschedule[0].price_formatted;
                }
            }
            return comparePricelevel && item.get('pricelevel' + comparePricelevel + '_formatted') ?
                item.get('pricelevel' + comparePricelevel + '_formatted') : item.get('pricelevel1_formatted');
        }
    });
});
