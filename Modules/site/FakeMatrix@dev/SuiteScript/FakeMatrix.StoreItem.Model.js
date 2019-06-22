/* eslint-disable no-new-wrappers */
define('FakeMatrix.StoreItem.Model', [
    'StoreItem.Model',
    'underscore'
], function FakeMatrixStoreItemModel(
    StoreItemModel,
    _
) {
    _.extend(StoreItemModel, {
        preloadItems: function preloadItems(itemsToPreload, fieldsetName) {
            var self = this;
            var itemsById = {};
            var parentsById = {};
            var fieldKeys = SC.Configuration.fieldKeys;
            var itemsFieldsStandardKeys = (fieldKeys && fieldKeys.itemsFieldsStandardKeys) || [];
            var itemsDetails;
            var parentsDetails;
            var items = itemsToPreload || [];

            if (!itemsFieldsStandardKeys.length) {
                return {};
            }

            this.preloadedItems = this.preloadedItems || {};

            items.forEach(function eachItem(item) {
                if (!item.id || !item.type || item.type === 'Discount' || item.type === 'OthCharge' || item.type === 'Markup') {
                    return;
                }

                if (!self.getPreloadedItem(item.id, fieldsetName)) {
                    itemsById[item.id] = {
                        internalid: new String(item.id).toString(),
                        itemtype: item.type,
                        itemfields: itemsFieldsStandardKeys
                    };
                }
            });

            if (!_.size(itemsById)) {
                return this.preloadedItems;
            }

            itemsDetails = this.getItemFieldValues(itemsById, fieldsetName);

            // Generates a map by id for easy access. Notice that for disabled items the array element can be null
            _.each(itemsDetails, function eachItemDetail(item) {
                if (item && typeof item.itemid !== 'undefined') {
                    if (item.custitem_aw_custom_parent_id && item.custitem_awa_is_custom_child) {
                        parentsById[item.custitem_aw_custom_parent_id] = {
                            internalid: new String(item.custitem_aw_custom_parent_id).toString(),
                            itemtype: item.itemtype,
                            itemfields: itemsFieldsStandardKeys
                        };
                    }

                    self.setPreloadedItem(item.internalid, item, fieldsetName);
                }
            });

            if (_.size(parentsById)) {
                parentsDetails = this.getItemFieldValues(parentsById, fieldsetName);

                _.each(parentsDetails, function eachParentDetail(item) {
                    if (item && typeof item.itemid !== 'undefined') {
                        self.setPreloadedItem(item.internalid, item, fieldsetName);
                    }
                });
            }

            // Adds the parent information to the child
            _.each(this.preloadedItems, function eachPreloadedItems(item) {
                if (item.custitem_aw_custom_parent_id && item.custitem_awa_is_custom_child) {
                    item.matrix_parent = self.getPreloadedItem(item.custitem_aw_custom_parent_id, fieldsetName);
                }
            });

            return this.preloadedItems;
        }
    });
});
