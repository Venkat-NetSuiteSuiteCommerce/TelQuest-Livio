define('UpsellItems.LiveOrder.Line.Model', [
    'LiveOrder.Line.Model',
    'SC.Configuration',
    'underscore'
], function UpsellItemsLiveOrderLineModel(
    LiveOrderLineModel,
    Configuration,
    _
) {
    _.extend(LiveOrderLineModel, {
        createFromProduct: _.wrap(LiveOrderLineModel.createFromProduct, function createFromProduct(fn, product) {
            var line = fn.apply(this, _.toArray(arguments).slice(1));
            var selectedUpsellId = Configuration.get('upsell.selectedOption');
            var upsellOption = Configuration.get('upsell.itemOption');
            var selectedUpsells = line.getOption(selectedUpsellId);
            var addOnItems = line.get('addOnItems') || {};
            var addOnItem;
            product.upsells = product.upsells || {};
            addOnItems[upsellOption] = addOnItems[upsellOption] || [];
            if (selectedUpsells && selectedUpsells.get('value') && selectedUpsells.get('value').internalid) {
                selectedUpsells = JSON.parse(selectedUpsells.get('value').internalid);
                _.each(selectedUpsells, function eachSelectedUpsell(upsellItem, upsellId) {
                    if (product.upsells[upsellId]) {
                        addOnItem = product.upsells[upsellId].get(upsellItem);
                        if (addOnItem) {
                            addOnItems[upsellOption].push({
                                item: addOnItem.attributes,
                                rate: addOnItem.get(Configuration.get('upsell.pricelevel')),
                                rate_formatted: addOnItem.get(Configuration.get('upsell.pricelevel') + '_formatted')
                            });
                        }
                    }
                });
            }
            line.set('addOnItems', addOnItems);
            return line;
        })
    });
});
