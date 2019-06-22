define('AddonItems.OrderHistory', [
    'Application',
    'Utils',
    'OrderHistory.Model',
    'Configuration',
    'bignumber',
    'underscore'
], function AddonItemsorderHistory(
    Application,
    Utils,
    PlacedOrder,
    Configuration,
    BigNumber,
    _
) {
    'use strict';

    _.extend(PlacedOrder, {
        /*
         We want to move the addOn lines so they are childs of the item lines
         In that way we can then show them everywhere as children instead
         of extra lines that don't make sense without their parents
         */
        rearrangeLinesForAddonItems: function rearrangeLinesForAddonItem() {
            var addOnKeys;
            var offsets;
            var addOnItemIndex;
            var i;
            var j;
            var line;
            var option;
            var key;
            var type;
            var lines = _.values(this.result.lines);
            var record = this.record;
            var itemsQty = record.getLineItemCount('item');
            var addOnItem;
            var parentItem;
            var amount;
            var rate;
            // Find out for every item of the order, the transaction column field value

            _.each(Configuration.associatedFields, function eachAssociatedField(associatedField) {
                var addOnItemsHashMap = {};
                addOnKeys = {};
                for (j = 1; j <= itemsQty; j++) {
                    addOnKeys[record.getLineItemValue('item', 'id', j)] = record.getLineItemValue(
                        'item',
                        associatedField.option,
                        j
                    );
                }
                offsets = 0;

                for (i = 0; i < lines.length; i++) {
                    line = lines[i];
                    if (line.options) {
                        option = addOnKeys[line.internalid];
                        type = option && option.substr(0, 2);
                        if (type) {
                            key = option.replace(type, '');
                            if (type === 'G:') {
                                addOnItemsHashMap[key] = addOnItemsHashMap[key] || {};
                                addOnItemsHashMap[key].addOnItems = addOnItemsHashMap[key].addOnItems || [];
                                addOnItemsHashMap[key].addOnItems.push(i);
                            }
                            if (type === 'P:') {
                                addOnItemsHashMap[key] = addOnItemsHashMap[key] || {};
                                addOnItemsHashMap[key].parent = i;
                            }
                        }
                    }
                }

                _.each(addOnItemsHashMap, function _giftWrapsHashMap(value, k) {
                    if (value && !_.isUndefined(value.addOnItems) && !_.isUndefined(value.parent)) {
                        parentItem = lines[value.parent - offsets];
                        if (parentItem) {
                            parentItem.addOnItems = parentItem.addOnItems || {};

                            for (j = 0; j < value.addOnItems.length; j++) {
                                addOnItemIndex = value.addOnItems[j];

                                parentItem.addOnItems[associatedField.option] = parentItem.addOnItems[associatedField.option] || [];

                                addOnItem = lines[addOnItemIndex - offsets];
                                parentItem.addOnItems[associatedField.option].push(addOnItem);

                                lines.splice(addOnItemIndex - offsets, 1);
                                amount = BigNumber(parseInt(parentItem.amount, 10)).plus(parseInt(addOnItem.amount || 0, 10)).toNumber();
                                rate = BigNumber(parseInt(parentItem.rate, 10)).plus(parseInt(addOnItem.rate || 0, 10)).toNumber();
                                parentItem.amount = amount;
                                parentItem.amount_formatted = Utils.formatCurrency(amount);
                                parentItem.total = amount;
                                parentItem.total_formatted = Utils.formatCurrency(amount);
                                parentItem.rate = rate;
                                parentItem.rate_formatted = Utils.formatCurrency(rate);

                                offsets++;
                            }
                        }
                    } else {
                        console.error(
                            'Error with addon sync',
                            'Key:' + JSON.stringify(k) + ',Value:' + JSON.stringify(value)
                        );
                    }
                });
            });

            this.result.lines = lines;
        }
    });
});
