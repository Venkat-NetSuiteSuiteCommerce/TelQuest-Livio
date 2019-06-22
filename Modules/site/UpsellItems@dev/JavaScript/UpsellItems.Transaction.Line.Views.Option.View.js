define('UpsellItems.Transaction.Line.Views.Option.View', [
    'Transaction.Line.Views.Option.View',
    'Transaction.Line.Model',
    'SC.Configuration',
    'underscore'
], function UpsellItemsTransactionLineViesOptionView(
    TransactionLineViewsOptionView,
    TransactionLineModel,
    Configuration,
    _
) {
    'use strict';

    _.extend(TransactionLineViewsOptionView.prototype, {
        getContext: _.wrap(TransactionLineViewsOptionView.prototype.getContext, function addOnItemContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var modelOption = this.model;
            var selectedValue = modelOption.get('value');
            var addOnItems;
            var upsellItems;
            var upsells = [];
            var upsellItem;
            var selectedUpsells = {};
            var line = this.options.line;
            var availableUpsells;
            switch (modelOption.get('cartOptionId')) {
            case Configuration.get('upsell.selectedOption'):
                if (selectedValue && selectedValue.internalid) {
                    availableUpsells = line.get('item').get(Configuration.get('upsell.itemField')) ||
                        (line.get('item').get('_matrixParent') && line.get('item').get('_matrixParent').get(Configuration.get('upsell.itemField'))) ||
                        (line.get('item').get('matrix_parent') && line.get('item').get('matrix_parent').get(Configuration.get('upsell.itemField')));
                    addOnItems = line.get('addOnItems') || {};
                    upsellItems = addOnItems && addOnItems[Configuration.get('upsell.itemOption')];
                    selectedUpsells = JSON.parse(selectedValue.internalid || '{}');
                    if (availableUpsells && !_.isEmpty(availableUpsells) && selectedUpsells &&
                        !_.isEmpty(selectedUpsells) && upsellItems && upsellItems.length) {
                        availableUpsells = JSON.parse(availableUpsells);

                        _.each(selectedUpsells, function eachSelectedUpsell(itemId, upsellId) {
                            upsellItem = _.find(upsellItems, function findUpsellItem(upsellLine) {
                                return upsellLine.item.internalid === parseInt(itemId, 10);
                            });
                            if (availableUpsells[upsellId] && upsellItem) {
                                upsellItem = new TransactionLineModel(upsellItem);
                                upsells.push({
                                    upsellType: availableUpsells[upsellId].name,
                                    label: upsellItem.get('item').get('_originalName'),
                                    price: upsellItem.get('rate_formatted'),
                                    comparePrice: upsellItem.get('item').getPrice().price_formatted || '',
                                    upsellImage: upsellItem.get('item').get('_upsellImage'),
                                    showComparePrice: upsellItem.get('item').getPrice() && upsellItem.get('item').getPrice().price &&
                                        upsellItem.get('item').getPrice().price > upsellItem.get('rate')
                                });
                            }
                        });
                    }
                    context.upsells = upsells || [];
                }
                break;
            default:
                break;
            }

            return context;
        })
    });
});
