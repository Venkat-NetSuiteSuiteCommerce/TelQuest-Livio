define('AddonItems.LiveOrder', [
    'Application',
    'Models.Init',
    'Utils',
    'LiveOrder.Model',
    'Configuration',
    'bignumber',
    'underscore'
], function LiveOrderAddonItems(
    Application,
    ModelsInit,
    Utils,
    LiveOrder,
    Configuration,
    BigNumber,
    _
) {
    'use strict';

    _.extend(LiveOrder, {
        addToCartFunctions: LiveOrder.addToCartFunctions || {},

        idGenerator: function idGenerator(qty) {
            return (Math.random().toString(36) + '00000000000000000').slice(2, qty + 2);
        },

        tweakLinesGetAddonItems: function tweakLinesGetAddonItems(currentLine) {
            var newLines = [];
            var self = this;
            _.each(this.addToCartFunctions, function eachAddToCartFunctions(fn) {
                newLines = self[fn](currentLine, newLines) || [];
            });

            if (newLines && newLines.length) {
                return newLines;
            }
            return null;
        },

        addAddonItems: function addAddonItems(lines) {
            var addOnLine;
            var self = this;
            var addedParentLine;
            _.each(lines, function eachLine(currentLine, index) {
                addOnLine = self.tweakLinesGetAddonItems(currentLine);
                if (addOnLine && addOnLine.length) {
                    _.each(addOnLine, function eachAddOnLine(line, i) {
                        lines.splice(index + i, 0, line);
                    });
                    Application.once('after:LiveOrder.addLines', function onceAfterLiveOrderAddLine(Model, responseData) {
                        if (responseData && responseData.length) {
                            addedParentLine = responseData[responseData.length - 1];
                            ModelsInit.context.setSessionObject('latest_addition', addedParentLine.orderitemid);
                        }
                    });
                }
            });
        },

        addLine: function addLine(line) {
            this.addLines([line]);
        },

        addAddonItem: function addAddonItem(currentLine) {
            var lines = [];
            var addedParentLine;
            var addOnLine = this.tweakLinesGetAddonItems(currentLine);
            if (addOnLine) {
                lines.push(addOnLine);
                lines.push(currentLine);
                Application.once('after:LiveOrder.addLine', function onceAfterLiveOrderAddLine(Model, responseData) {
                    if (responseData && responseData.length) {
                        addedParentLine = responseData[responseData.length - 1];
                        ModelsInit.context.setSessionObject('latest_addition', addedParentLine.orderitemid);
                    }
                });

                return lines;
            }
            return currentLine;
        },

        removeAddonItem: function removeAddonItem(currentLine) {
            var orderFieldKeys = [
                'orderitemid',
                'quantity',
                'internalid',
                'options'
            ];

            // Removing current line, we have to find the warranty
            var line = ModelsInit.order.getItem(currentLine, orderFieldKeys);
            var associatedFields = Configuration.associatedFields;
            // var warrantyAssociation = Configuration.warranty.itemOptionAssociation;
            var optionAssociation;
            var key;
            var lines = ModelsInit.order.getItems(orderFieldKeys);
            var hasParent = false;
            var addOnId;
            var linesToRemove = [];
            _.each(associatedFields, function eachAssociatedFields(associatedField) {
                optionAssociation = _.findWhere(line.options, { id: associatedField.option.toUpperCase() });
                if (optionAssociation && optionAssociation.value) {
                    if (optionAssociation.value.indexOf('P:') >= 0) {
                        // we have to search for the other line
                        key = optionAssociation.value.replace('P:', 'G:');
                        // Why EVERY instead of each? Every will break on the first FALSE returned;
                        // We need to iterate only until we get the addOn item

                        _.each(lines, function eachLine(l) {
                            addOnId = _.findWhere(l.options, { id: associatedField.option.toUpperCase() });
                            // Found it? so after the removeLine, let's hang to it
                            if (addOnId && addOnId.value === key) {
                                linesToRemove.push(l.orderitemid);
                            }
                        });
                    } else if (optionAssociation.value.indexOf('G:') >= 0) {
                        hasParent = _.any(lines, function every(l) {
                            addOnId = _.findWhere(l.options, { id: associatedField.option.toUpperCase() });
                            // Found it? so after the removeLine, let's hang to it
                            if (addOnId && addOnId.value === key) {
                                return true;
                            }
                            return false;
                        });
                        if (hasParent) {
                            throw associatedField.error;
                        }
                    }
                }
            });

            if (linesToRemove && linesToRemove.length) {
                Application.once(
                    'after:LiveOrder.removeLine',
                    function afterLiveOrderRemoveLine(Model) {
                        Model.removeLines(_.uniq(linesToRemove));
                    }
                );
            }
        },

        removeLines: function removeLines(lines) {
            var self = this;
            _.each(lines, function eachLine(line) {
                self.removeLine(line);
            });
        },

        reformatLines: function reformatLines(lines) {
            var addOnItemsHashMap;
            var offsets;
            var i;
            var line;
            var option;
            var type;
            var key;
            var associatedFields = Configuration.associatedFields;
            var parentItem;
            var addOnItem;
            var amount;
            var j;
            var addOnItemIndex;
            _.each(associatedFields, function eachAssociatedField(associatedField) {
                addOnItemsHashMap = {};
                offsets = 0;
                for (i = 0; i < lines.length; i++) {
                    line = lines[i];
                    if (line.options) {
                        option = _.findWhere(line.options, { cartOptionId: associatedField.option });
                        type = option && option.value && option.value.internalid && option.value.internalid.substr(0, 2);
                        if (type) {
                            key = option.value.internalid.replace(type, '');
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
                                parentItem.amount = amount;
                                parentItem.amount_formatted = Utils.formatCurrency(amount);
                                parentItem.total = amount;
                                parentItem.total_formatted = Utils.formatCurrency(amount);
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

            return lines;
        }
    });
});
