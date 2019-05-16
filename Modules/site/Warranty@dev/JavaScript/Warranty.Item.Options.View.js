define('Warranty.Item.Options.View', [
    'ProductViews.Option.View',
    'SC.Configuration',
    'underscore',
    'AddOnItems.Configuration'
], function WarrantyItemsOptionView(
    ItemViewsOptionView,
    Configuration,
    _
) {
    'use strict';

    _.extend(ItemViewsOptionView.prototype, {
        getContext: _.wrap(ItemViewsOptionView.prototype.getContext, function addOnItemContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var modelOption = this.model;
            var addOnItems = this.options.line.getWarrantyOptions() || [];
            var isCheckboxMode;
            var firstOption;
            var selectedAddOnItem;
            var itemForCheckboxMode;
            if (this.options.line.isWarrantyAvailable() && addOnItems.length > 0) {
                switch (modelOption.get('cartOptionId')) {
                case Configuration.get('warranty.itemOption'):

                    if (addOnItems.length) {
                        modelOption.set('values', addOnItems);
                        context.values = addOnItems;
                        isCheckboxMode = modelOption &&
                            modelOption.get('values') &&
                            modelOption.get('values').length === 2 &&
                            modelOption.get('values')[0].label === '';

                        firstOption = modelOption.get('values') && modelOption.get('values').length > 1 ?
                            modelOption.get('values')[1] :
                            {};

                        selectedAddOnItem = context.selectedOption && context.selectedOption.internalId ?
                            modelOption.get(context.selectedOption.internalId) :
                            null;
                        _.extend(context, {
                            isAddOnable: this.options.line.isWarrantyAvailable(),
                            isCheckboxMode: isCheckboxMode,
                            isActive: selectedAddOnItem !== null,
                            addOnItems: addOnItems,
                            firstOption: firstOption
                        });

                        if (isCheckboxMode) {
                            itemForCheckboxMode = addOnItems[1];
                            _.extend(context, {
                                addOnModel: {
                                    internalid: itemForCheckboxMode.internalid,
                                    price: itemForCheckboxMode.price,
                                    isValid: itemForCheckboxMode.price !== 0,
                                    price_formatted: itemForCheckboxMode.price_formatted
                                }
                            });
                        } else {
                            _.each(context.values, function eachOptions(option) {
                                var addOnItem = _.findWhere(addOnItems, { internalid: option.internalid });

                                if (addOnItem) {
                                    _.extend(option, {
                                        addOnModel: {
                                            internalid: addOnItem.internalid,
                                            price: addOnItem.price,
                                            price_formatted: addOnItem.price_formatted
                                        }
                                    });
                                }
                            });
                        }
                    }
                    break;
                default:
                    break;
                }
            }

            return context;
        })
    });
});
