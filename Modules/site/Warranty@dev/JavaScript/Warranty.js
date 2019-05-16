define('Warranty', [
    'underscore',
    'SC.Configuration',
    'item_views_option_warranty_item.tpl',
    'item_views_option_warranty_item_selected.tpl',
    'AddOnItems.Configuration',
    'Warranty.Transaction.Line.Views.Option.View',
    'Warranty.Item.Options.View',
    'Warranty.ProductLine.Url',
    'Warranty.Product.Model',
    'Warranty.ProductDetails.QuickView.View',
    'Warranty.Product.Price',
    'Warranty.ProductDetails.OptionBingings',
    'Warranty.Cart.Detailed.View',
    'Warranty.LiveOrder.Model',
    'Warranty.GlobalViews.Confirmation.View',
    'Warranty.ProductDetails.Base.View',
    'Warranty.ProductDetails.Options.Selector.View',
    'Warranty.Cart.Lines.View'
], function Warranty(
    _,
    Configuration,
    warrantyItemTpl,
    warrantyItemTplSelected
) {
    'use strict';

    if (!Configuration.itemKeyMapping) {
        Configuration.itemKeyMapping = {};
    }

    _(Configuration.itemKeyMapping).extend({
        // For an item to be add onable, it needs to have at least
        // one "warranty" possible
        _isWarrantyAvailable: function _isWarrantyAvailable(item) {
            return _.any(Configuration.get('warranty.fields') || [], function hasWarranty(warrantyField) {
                return item.get(warrantyField.fieldId);
            });
        },

        _getMatrixOptionsSelection: function _getMatrixOptionsSelection(item) {
            var matrixOptions = (item.get('options') && item.get('options').where({ isMatrixDimension: true })) || [];
            var result = {};

            _.each(matrixOptions, function eachMatrixOption(matrixOption) {
                var setValue = matrixOption.get('value');

                if (setValue) {
                    result[matrixOption.get('itemOptionId')] = setValue.label;
                }
            });

            return result;
        },

        _getSelectedMatrixChilds: function _getSelectedMatrixChilds(item) {
            var itemMatrixChildren = item.get('_matrixChilds');
            var matrixOptions;
            var selectionKey;

            if (!itemMatrixChildren) {
                return [];
            }

            matrixOptions = item.get('_getMatrixOptionsSelection');
            selectionKey = JSON.stringify(matrixOptions);

            item.matrixSelectionCache = item.matrixSelectionCache || {};

            // Caches the entry for the item
            if (!item.matrixSelectionCache[selectionKey]) {
                item.matrixSelectionCache[selectionKey] = _.values(matrixOptions).length ? itemMatrixChildren.where(matrixOptions) : itemMatrixChildren.models;
            }

            return item.matrixSelectionCache[selectionKey];
        },

        _warrantyOptions: function _warrantyOptions(item) {
            var warrantyOptions = [];
            var children;

            if (item.get('_isParent')) {
                children = item.get('_getSelectedMatrixChilds');
                if (children && children.length) {
                    return children[0].get('_warrantyOptions');
                }
            }
            _.each(Configuration.get('warranty.fields'), function eachWarrantyField(warrantyField) {
                if (item.get(warrantyField.fieldId)) {
                    warrantyOptions.push({
                        label: warrantyField.displayName,
                        value: parseInt(warrantyField.days, 10),
                        internalid: parseInt(warrantyField.days, 10),
                        isAvailable: true,
                        price: item.get(warrantyField.fieldId),
                        price_formatted: item.get(warrantyField.fieldId + '_formatted')
                    });
                }
            });

            if (warrantyOptions && warrantyOptions.length) {
                warrantyOptions.splice(0, 0, { internalid: 0, label: '' });
            }
            return warrantyOptions;
        }
    });

    Configuration.voidTemplates = [];
    Configuration.addOnOptions = Configuration.addOnOptions || [];
    Configuration.voidTemplates.push({
        cartOptionId: Configuration.get('warranty.itemOptionAssociation'),
        url: 'warrantyid'
    });

    Configuration.addOnOptions.push(Configuration.get('warranty.itemOptionAssociation'));

    _.each(Configuration.get('warranty.fields', []), function eachWarrantyField(warrantyField) {
        Configuration.voidTemplates.push({
            cartOptionId: warrantyField.fieldId.replace('custitem', 'custcol'),
            url: 'warranty' + warrantyField.days
        });

        Configuration.addOnOptions.push(warrantyField.fieldId.replace('custitem', 'custcol'));
    });

    Configuration.addOnItemOptions = [];
    Configuration.addOnItemOptions.push({
        cartOptionId: Configuration.get('warranty.itemOption'),
        label: 'Additional Warranty',
        url: 'warranty',
        urlParameterName: 'warranty',
        templates: {
            selector: warrantyItemTpl,
            selected: warrantyItemTplSelected
        },
        index: 1000
    });

    Configuration.addOnOptions.push(Configuration.get('warranty.itemOption'));

    Configuration.ItemOptions.optionsConfiguration = Configuration.addAddOnOptions(Configuration.get('ItemOptions.optionsConfiguration', []));
});
