define('FakeMatrix.ProductList.Item.Search', [
    'ProductList.Item.Search',
    'StoreItem.Model',
    'Application',
    'Utils',
    'Configuration',
    'underscore'
], function FakeMatrixProductListItemSearch(
    ProductListItemSearch,
    StoreItem,
    Application,
    Utils,
    Configuration,
    _
) {
    _.extend(ProductListItemSearch, {
        searchHelper: function searchHelper(filters, sortColumn, sortDirection, includeStoreItem) {
            // Selects the columns
            var productListItemColumns = {
                internalid: new nlobjSearchColumn('internalid'),
                name: new nlobjSearchColumn('formulatext', 'custrecord_ns_pl_pli_item')
                    .setFormula('case when LENGTH({custrecord_ns_pl_pli_item.displayname}) > 0' +
                    ' then {custrecord_ns_pl_pli_item.displayname} else {custrecord_ns_pl_pli_item.itemid} end'),
                sku: new nlobjSearchColumn('formulatext', 'custrecord_ns_pl_pli_item').setFormula('{custrecord_ns_pl_pli_item.itemid}'),
                description: new nlobjSearchColumn('custrecord_ns_pl_pli_description'),
                options: new nlobjSearchColumn('custrecord_ns_pl_pli_options'),
                quantity: new nlobjSearchColumn('custrecord_ns_pl_pli_quantity'),
                price: new nlobjSearchColumn('price', 'custrecord_ns_pl_pli_item'),
                created: new nlobjSearchColumn('created'),
                item_id: new nlobjSearchColumn('custrecord_ns_pl_pli_item'),
                item_type: new nlobjSearchColumn('type', 'custrecord_ns_pl_pli_item'),
                item_matrix_parent: new nlobjSearchColumn('custitem_awa_is_custom_parent', 'custrecord_ns_pl_pli_item'),
                priority: new nlobjSearchColumn('custrecord_ns_pl_pli_priority'),
                priority_value: new nlobjSearchColumn('custrecord_ns_pl_plip_value', 'custrecord_ns_pl_pli_priority'),
                lastmodified: new nlobjSearchColumn('lastmodified')
            };
            var self = this;
            var records;
            var productlistItems = [];
            var results = [];
            var storeItemReferences;

            if (productListItemColumns[sortColumn]) productListItemColumns[sortColumn].setSort(sortDirection === 'DESC');

            // Makes the request and format the response
            records = Application.getAllSearchResults('customrecord_ns_pl_productlistitem', filters, _.values(productListItemColumns));

            _(records).each(function eachRecord(productListItemSearchRecord) {
                var itemInternalId = productListItemSearchRecord.getValue('custrecord_ns_pl_pli_item');
                var itemId = productListItemSearchRecord.getText('custrecord_ns_pl_pli_item');
                var itemMatrixParent = productListItemSearchRecord.getValue('custitem_awa_is_custom_parent', 'custrecord_ns_pl_pli_item');
                var createdDate = nlapiStringToDate(productListItemSearchRecord.getValue('created'), window.dateformat);
                var createdDateStr = nlapiDateToString(createdDate, window.dateformat);
                var itemType = productListItemSearchRecord.getValue('type', 'custrecord_ns_pl_pli_item');
                var productListItem = {
                    internalid: productListItemSearchRecord.getId(),
                    description: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_description'),
                    options: self.parseLineOptionsFromProductList(JSON.parse(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_options') || '{}')),
                    quantity: parseInt(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_quantity'), 10),
                    created: productListItemSearchRecord.getValue('created'),
                    createddate: createdDateStr,
                    lastmodified: productListItemSearchRecord.getValue('lastmodified'),
                    // we temporary store the item reference, after this loop we use StoreItem.preloadItems instead doing multiple StoreItem.get()
                    store_item_reference: {
                        id: itemInternalId,
                        internalid: itemInternalId,
                        type: itemType,
                        matrix_parent: itemMatrixParent,
                        itemid: itemId
                    },
                    priority: {
                        id: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_priority'),
                        name: productListItemSearchRecord.getText('custrecord_ns_pl_pli_priority')
                    }
                };
                productlistItems.push(productListItem);
            });

            storeItemReferences = _(productlistItems).pluck('store_item_reference');


            // preload all the store items at once for performance
            if (StoreItem) StoreItem.preloadItems(storeItemReferences);

            _(productlistItems).each(function eachProductListItem(productlistItem) {
                var storeItemReference = productlistItem.store_item_reference;
                    // get the item - fast because it was preloaded before. Can be null!
                var storeItem = StoreItem ? StoreItem.get(storeItemReference.id, storeItemReference.type, 'wishlist') : storeItemReference;

                delete productlistItem.store_item_reference;

                if (!storeItem) {
                    return;
                }

                if (includeStoreItem || !StoreItem) {
                    productlistItem.item = storeItem;
                    // Parse the internalid to number to be SearchAPI complaint
                    productlistItem.item.internalid = parseInt(productlistItem.item.internalid, 10);
                } else {
                    // only include basic store item data - fix the name to support matrix item names.
                    productlistItem.item = {
                        internalid: parseInt(storeItemReference.id, 10),
                        displayname: self.getProductName(storeItem),
                        ispurchasable: storeItem.ispurchasable,
                        itemoptions_detail: storeItem.itemoptions_detail,
                        minimumquantity: storeItem.minimumquantity,
                        itemimages_detail: storeItem.itemimages_detail
                    };
                }

                if (!includeStoreItem && storeItem && storeItem.matrix_parent) {
                    productlistItem.item.matrix_parent = storeItem.matrix_parent;
                }

                results.push(productlistItem);
            });

            return results;
        }
    });
});
