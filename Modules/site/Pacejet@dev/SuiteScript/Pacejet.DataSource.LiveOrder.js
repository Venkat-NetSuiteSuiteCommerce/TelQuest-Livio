define('Pacejet.DataSource.LiveOrder', [
    'SC.Models.Init',
    'underscore'
], function PacejetDataSourceLiveOrder(
    ModelsInit,
    _
) {
    'use strict';


    return {
        fetch: function fetch() {
            var profile = ModelsInit.customer.getFieldValues(['email']);
            var narrowedOrder = ModelsInit.order.getFieldValues([
                {
                    'shipaddress': {
                        'internalid': null,
                        'zip': null,
                        'country': null,
                        'addr2': null,
                        'addr1': null,
                        'city': null,
                        'addressee': null,
                        'phone': null,
                        'isresidential': null,
                        'attention': null,
                        'state': null
                    },
                    'items': {
                        'internalid': null,
                        'itemid': null,
                        'orderitemid': null,
                        'custitem_awa_freeshipping': null,
                        'custitem_pacejet_item_autopack': null,
                        'custitem_pacejet_commodity_name': null,
                        'custitem_pacejet_upc_code': null,
                        'custitem_pacejet_producer_number': null,
                        'custitem_pacejet_item_height': null,
                        'custitem_pacejet_item_width': null,
                        'custitem_pacejet_item_length': null,
                        'itemtype': null,
                        'subtype': null,
                        'orderline': null,
                        'upccode': null,
                        'description': null,
                        'amount': null,
                        'rate': null,
                        'salesdescription': null,

                        'quantity': null,

                        'weight': null,
                        'weightunit': null,

                        // TODO: if UOM
                        'units': null,
                        'unitsdisplay': null,
                        'unitconversionrate': null,
                        'saleunit': null,
                        'unitdisplay': null,

                        // TODO: IF SERIALIZED
                        'serialnumbers': null,
                        'serialnumbersvalid': null

                    }
                }
            ]);

            narrowedOrder.freeshipping = _.all(narrowedOrder.items, function anItem(f) {
                nlapiLogExecution('DEBUG', 'item', JSON.stringify(f));
                return f.custitem_awa_freeshipping === true;
            });


            return {
                transaction: narrowedOrder,
                entity: profile
            };
        }
    };
});
