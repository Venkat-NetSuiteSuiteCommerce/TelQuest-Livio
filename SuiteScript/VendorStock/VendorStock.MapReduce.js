/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define([
    'N/search',
    'N/record',
    'N/log',
    'N/runtime'
], function (
    nSearch,
    nRecord,
    nLog,
    nRuntime
) {

    var itemTypes = {
        InvtPart: 'inventoryitem',
        Assembly: 'assemblyitem',
        GiftCert: 'giftcertificateitem',
        Kit: 'kititem',
        NonInvtPart: 'noninventoryitem',
        Service: 'serviceitem'
    };

    return {

        config: {
            exitOnError: false //default
        },

        /*This function gets the customers created in the day.*/
        getInputData: function getInputData() {
            var filters = [
                ['matrix','is','F'],
                'and',
                ['type', 'anyof', 'InvtPart', 'Kit']
            ];
            var script = nRuntime.getCurrentScript();
            var firstTime = script.getParameter({
                name: 'custscript_is_first_run'
            });
            log.error('firstTime', firstTime);

            if (firstTime) {
                filters.push(
                    'and',
                    ['sum(custrecord_vifi_item.custrecord_vifi_quantity)','greaterthan','0'],
                    'and',
                    ['sum(custrecord_vifi_item.custrecord_vifi_quantity)','isnotempty',""]
                );
            } else {
                filters.push('and', ['max(custrecord_vifi_item.lastmodified)','onorafter','daysago2']);
            }
            return nSearch.create({
                type: 'item',
                filters: filters,
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
        },

        map: function map(context) {
            var data = JSON.parse(context.value).values;
            var itemType = data['GROUP(type)'].value;
            var itemId = data['GROUP(internalid)'].value;
            var vendorStock = data['SUM(custrecord_vifi_quantity.CUSTRECORD_VIFI_ITEM)'] || 0;
            var oldVendorStock = data['GROUP(custitem_vendor_stock)'];
            var isserialitem = data['GROUP(isserialitem)'];'serializedinventoryitem'
            if (vendorStock !== oldVendorStock) {
                log.error('item' + itemId, vendorStock);

                nRecord.submitFields({
                    type: isserialitem ? 'serialized' + itemTypes[itemType] : itemTypes[itemType],
                    id: itemId,
                    values: {
                        custitem_vendor_stock: parseInt(vendorStock, 10)
                    }
                });
            }
        }
    }
});
