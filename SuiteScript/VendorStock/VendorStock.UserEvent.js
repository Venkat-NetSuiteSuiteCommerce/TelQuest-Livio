/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([
    'N/record',
    'N/log',
    'N/search'
], function RelatedItems(
    nRecord,
    nLog,
    nSearch
) {

    var itemTypes = {
        InvtPart: 'inventoryitem',
        Assembly: 'assemblyitem',
        GiftCert: 'giftcertificateitem',
        Kit: 'kititem',
        NonInvtPart: 'noninventoryitem',
        Service: 'serviceitem'
    };

    function setVendorStockItem(item) {
        var vendorSearch = nSearch.create({
            type: 'item',
            filters: [
                ['internalidnumber', 'equalto', item]
            ],
            columns: [
                nSearch.createColumn({
                    name: 'custrecord_vifi_quantity',
                    join: 'CUSTRECORD_VIFI_ITEM',
                    summary: 'SUM'
                }),
                nSearch.createColumn({
                    name: 'internalid',
                    summary: 'GROUP'
                }),
                nSearch.createColumn({
                    name: 'itemid',
                    summary: 'GROUP'
                }),
                nSearch.createColumn({
                    name: 'custitem_vendor_stock',
                    summary: 'GROUP'
                }),
                nSearch.createColumn({
                    name: 'type',
                    summary: 'GROUP'
                }),
                nSearch.createColumn({
                    name: 'isserialitem',
                    summary: 'GROUP'
                })
            ]
        });

        var vendorStocks = vendorSearch.run().getRange({
            start: 0,
            end: 1
        });
        var vendorStock = vendorStocks && vendorStocks.length && vendorStocks[0];
        var stock;
        var isserialitem;
        var itemType;
        var oldVendorStock;
        if (vendorStock) {
            stock = vendorStock.getValue({
                name: 'custrecord_vifi_quantity',
                join: 'CUSTRECORD_VIFI_ITEM',
                summary: 'SUM'
            });

            isserialitem = vendorStock.getValue({
                name: 'isserialitem',
                summary: 'GROUP'
            });

            itemType = vendorStock.getValue({
                name: 'type',
                summary: 'GROUP'
            });

            oldVendorStock = vendorStock.getValue({
                name: 'custitem_vendor_stock',
                summary: 'GROUP'
            });

            if (oldVendorStock !== stock) {
                nRecord.submitFields({
                    type: isserialitem ? 'serialized' + itemTypes[itemType] : itemTypes[itemType],
                    id: item,
                    values: {
                        custitem_vendor_stock: parseInt(stock, 10)
                    }
                });
            }

        }


    }

    return {

        afterSubmit: function beforeSubmit(context) {
            var newRecord = context.newRecord;
            var oldRecord = context.oldRecord;
            var item = newRecord && newRecord.getValue({
                fieldId: 'custrecord_vifi_item'
            });
            var oldItem = oldRecord && oldRecord.getValue({
                fieldId: 'custrecord_vifi_item'
            });

            if (item) {
                setVendorStockItem(item)
            }
            if (oldItem && oldItem !== item) {
                setVendorStockItem(oldItem);
            }

        }
    }

});
