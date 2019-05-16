define('Warranty.Transaction.Line.Views.Option.View', [
    'Transaction.Line.Views.Option.View',
    'SC.Configuration',
    'LiveOrder.Model',
    'underscore',
    'Utils',
    'AddOnItems.Configuration'
], function WarrantyTransactionLineViesOptionView(
    TransactionLineViewsOptionView,
    Configuration,
    LiveOrderModel,
    _,
    Utils
) {
    'use strict';

    _.extend(TransactionLineViewsOptionView.prototype, {
        events: _.extend(TransactionLineViewsOptionView.prototype.events || {}, {
            'click [class="warranty-remove"]': 'removeWarranty'
        }),

        removeWarranty: function removeWarranty(e) {
            var self = this;
            var options = this.line_model.get('options');
            var cart = LiveOrderModel.getInstance();
            var warranty = -1;

            e.preventDefault();
            e.stopPropagation();

            options.any(function indexOfWarranty(option, index) {
                if (option.get('cartOptionId') === Configuration.get('warranty.itemOption')) {
                    warranty = index;
                    return true;
                }
                return false;
            });

            if (warranty >= 0) {
                options.models.splice(warranty, 1);
                this.line_model.set('options', options);
                cart.updateLines([this.line_model]).done(function doneUpdate() {
                    self.render();
                });
            }
        },

        getContext: _.wrap(TransactionLineViewsOptionView.prototype.getContext, function addOnItemContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var modelOption = this.model;
            var warrantyFields = Configuration.get('warranty.fields');
            var warrantySelected;
            var selectedValue = modelOption.get('value');
            var addOnItems;
            var addOnItem;
            var line = this.options.line;
            var children;
            switch (modelOption.get('cartOptionId')) {
            case Configuration.get('warranty.itemOption'):
                if (selectedValue && selectedValue.internalid) {
                    addOnItems = line.get('addOnItems') || {};
                    warrantySelected = _.findWhere(warrantyFields, { fieldId: 'custitem_awa_warranty_' + selectedValue.internalid });
                    if (warrantySelected) {
                        selectedValue.label = warrantySelected.displayName || '';
                        selectedValue.label = selectedValue.label.replace('Warranty', '');
                        addOnItem = addOnItems && addOnItems[Configuration.get('warranty.itemOptionAssociation')];
                        if (addOnItem && addOnItem.length) {
                            addOnItem = addOnItem[0];
                            selectedValue.label += ' ' + addOnItem.rate_formatted;
                        } else if (line.get('item').get(warrantySelected.fieldId)) {
                            selectedValue.label += ' ' + Utils.formatCurrency(line.get('item').get(warrantySelected.fieldId));
                        } else {
                            children = line.getSelectedMatrixChilds();
                            if (children && children.length) {
                                selectedValue.label += ' ' + Utils.formatCurrency(children[0].get(warrantySelected.fieldId));
                            }
                        }
                        context.selectedValue.label = selectedValue.label || context.selectedValue.label;
                    }
                }
                break;
            default:
                break;
            }

            return context;
        })
    });
});
