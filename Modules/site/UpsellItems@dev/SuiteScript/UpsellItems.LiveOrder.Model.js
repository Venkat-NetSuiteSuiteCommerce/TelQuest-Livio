define('UpsellItems.LiveOrder.Model', [
    'LiveOrder.Model',
    'Configuration',
    'Application',
    'underscore'
], function UpsellItemsLiveOrderHooks(
    LiveOrderModel,
    Configuration,
    Application,
    _
) {
    'use strict';

    if (Configuration.upsell.selectedOption) {
        LiveOrderModel.addToCartFunctions = LiveOrderModel.addToCartFunctions || {};
        LiveOrderModel.addToCartFunctions[Configuration.upsell.selectedOption] = 'addToCartUpsells';
    }

    Application.on('before:LiveOrder.updateLine',
        function beforeLiveOrderUpdateLine(Model, lineid, line) {
            var upsellsSelected = Configuration.upsell.selectedOption;
            var upsellsAssociation = Configuration.upsell.itemOption;
            var upsellsSelectedOption = line.options && _.findWhere(line.options, { cartOptionId: upsellsSelected });
            var upsellsAssociationOption = line.options && _.findWhere(line.options, { cartOptionId: upsellsAssociation });

            if (line.options && (!upsellsSelectedOption || !upsellsSelectedOption.value || !upsellsSelectedOption.value.internalid)
                && upsellsAssociationOption) {
                line.options = _.without(line.options, upsellsAssociationOption);
            }
        });

    _.extend(LiveOrderModel, {
        addToCartUpsells: function addToCartUpsells(currentLine, newLines) {
            var generatedId;
            var generatedIdNL;
            var generatedIdOld;
            var upsellSelected = Configuration.upsell.selectedOption;
            var upsellAssociation = Configuration.upsell.itemOption;
            var upsellSelectedOption = currentLine.options && _.findWhere(currentLine.options, { cartOptionId: upsellSelected });
            var upsells;
            var upsellOptions = [];
            var upsellAssociationOption;

            if (currentLine && upsellSelectedOption && upsellSelectedOption.value && upsellSelectedOption.value.internalid) {
                upsells = JSON.parse(upsellSelectedOption.value.internalid || '{}');
                generatedId = this.idGenerator(8);
                // eslint-disable-next-line no-new-wrappers
                generatedIdNL = new String('G:' + generatedId).toString(); // HACKS for weird platform bugs with strings
                // eslint-disable-next-line no-new-wrappers
                generatedIdOld = new String('P:' + generatedId).toString(); // HACKS for weird platform bugs

                upsellOptions.push({
                    cartOptionId: upsellAssociation,
                    value: {
                        internalid: generatedIdNL
                    }
                });

                _.each(upsells, function eachUpsell(upsellId) {
                    newLines.push({
                        item: {
                            internalid: parseInt(upsellId, 10)
                        },
                        quantity: currentLine.quantity,
                        options: upsellOptions
                    });
                });

                upsellAssociationOption = _.findWhere(currentLine.options, { cartOptionId: upsellAssociation });
                if (upsellAssociationOption) {
                    upsellAssociationOption.value = {
                        internalid: generatedIdOld
                    };
                } else {
                    currentLine.options.push({
                        cartOptionId: upsellAssociation,
                        value: {
                            internalid: generatedIdOld
                        }
                    });
                }
            }
            return newLines;
        }
    });
});
