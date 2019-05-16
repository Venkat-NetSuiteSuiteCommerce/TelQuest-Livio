define('Warranty.LiveOrder.Model', [
    'LiveOrder.Model',
    'Configuration',
    'Application',
    'underscore'
], function AddonItemsLiveOrderHooks(
    LiveOrderModel,
    Configuration,
    Application,
    _
) {
    'use strict';

    if (Configuration.warranty.itemOption) {
        LiveOrderModel.addToCartFunctions = LiveOrderModel.addToCartFunctions || {};
        LiveOrderModel.addToCartFunctions[Configuration.warranty.itemOption] = 'addToCartWarranty';
    }

    Application.on('before:LiveOrder.updateLine',
        function beforeLiveOrderUpdateLine(Model, lineid, line) {
            var warrantySelected = Configuration.warranty.itemOption;
            var warrantyAssociation = Configuration.warranty.itemOptionAssociation;
            var warrantySelectedOption = line.options && _.findWhere(line.options, { cartOptionId: warrantySelected });
            var warrantyAssociationOption = line.options && _.findWhere(line.options, { cartOptionId: warrantyAssociation });
            if (line.options && (!warrantySelectedOption || !warrantySelectedOption.value || !warrantySelectedOption.value.internalid)
                && warrantyAssociationOption) {
                line.options = _.without(line.options, warrantyAssociation);
            }
        });

    _.extend(LiveOrderModel, {
        addToCartWarranty: function addToCartWarranty(currentLine, newLines) {
            var generatedId;
            var generatedIdNL;
            var generatedIdOld;
            var addOnItemId = Configuration.warranty.itemId;
            var warrantySelected = Configuration.warranty.itemOption;
            var warrantyAssociation = Configuration.warranty.itemOptionAssociation;
            var options = [];
            var warrantySelectedOption = currentLine.options && _.findWhere(currentLine.options, { cartOptionId: warrantySelected });
            var newLine;
            var associationOption;

            if (currentLine && warrantySelectedOption && warrantySelectedOption.value && warrantySelectedOption.value.internalid) {
                generatedId = this.idGenerator(8);
                // eslint-disable-next-line no-new-wrappers
                generatedIdNL = new String('G:' + generatedId).toString(); // HACKS for weird platform bugs with strings
                // eslint-disable-next-line no-new-wrappers
                generatedIdOld = new String('P:' + generatedId).toString(); // HACKS for weird platform bugs

                options.push({
                    cartOptionId: warrantyAssociation,
                    value: {
                        internalid: generatedIdNL
                    }
                });

                options.push({
                    cartOptionId: warrantySelected,
                    value: {
                        internalid: warrantySelectedOption.value.internalid
                    }
                });

                newLine = {
                    item: {
                        internalid: parseInt(addOnItemId, 10)
                    },
                    quantity: currentLine.quantity,
                    options: options
                };
                associationOption = _.findWhere(currentLine.options, { cartOptionId: warrantyAssociation });
                if (associationOption) {
                    associationOption.value = {
                        internalid: generatedIdOld
                    };
                } else {
                    currentLine.options.push({
                        cartOptionId: warrantyAssociation,
                        value: {
                            internalid: generatedIdOld
                        }
                    });
                }
                newLines.unshift(newLine);
            }

            return newLines;
        },

        updateLines: function updateLines(linesToUpdate) {
            var self = this;
            _.each(linesToUpdate, function eachLineToUpdate(line) {
                self.updateLine(line.internalid, line);
            });
        }
    });
});
