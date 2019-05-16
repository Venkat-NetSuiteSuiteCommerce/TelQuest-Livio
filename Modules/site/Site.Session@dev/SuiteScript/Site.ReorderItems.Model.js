define('Site.ReorderItems.Model', [
    'ReorderItems.Model',
    'Configuration',
    'underscore',
    'SC.Models.Init',
    'Application',
    'StoreItem.Model',
    'SiteSettings.Model',
    'Utils',
    'Transaction.Model'
], function SiteReorderItemsModel(
    ReorderItemsModel,
    Configuration,
    _,
    ModelsInit,
    Application,
    StoreItem,
    SiteSettings,
    Utils,
    Transaction
) {
    _.extend(ReorderItemsModel, {
        search: function search(orderId, queryFilters) {
            var filters = {
                'entity': ['entity', 'is', nlapiGetUser()],
                'entity_operator': 'and',
                'quantity': ['quantity', 'greaterthan', 0],
                'quantity_operator': 'and',
                'mainline': ['mainline', 'is', 'F'],
                'mainline_operator': 'and',
                'cogs': ['cogs', 'is', 'F'],
                'cogs_operator': 'and',
                'taxline': ['taxline', 'is', 'F'],
                'taxline_operator': 'and',
                'shipping': ['shipping', 'is', 'F'],
                'shipping_operator': 'and',
                'transactiondiscount': ['transactiondiscount', 'is', 'F'],
                'transactiondiscount_operator': 'and',
                'item_is_active': ['item.isinactive', 'is', 'F'],
                'item_is_active_operator': 'and',
                'item_type': ['item.type', 'noneof', 'GiftCert']
            };
            var columns = [
                new nlobjSearchColumn('internalid', 'item', 'group'),
                new nlobjSearchColumn('type', 'item', 'group'),
                new nlobjSearchColumn('parent', 'item', 'group'),
                new nlobjSearchColumn('options', null, 'group'),
                // to sort by price we fetch the max onlinecustomerprice
                new nlobjSearchColumn('onlinecustomerprice', 'item', 'max'),
                // to sort by recently purchased we grab the last date the item was purchased
                new nlobjSearchColumn('trandate', null, 'max'),
                // to sort by frequently purchased we count the number of orders which contains an item
                new nlobjSearchColumn('internalid', null, 'count')
            ];
            var siteId = ModelsInit.session.getSiteSettings(['siteid']).siteid;
            var itemName = new nlobjSearchColumn('formulatext', 'item', 'group');
            var siteSettings = SiteSettings.get();

            var filterSiteOption = SC.Configuration.filterSite.option;
            var filterSiteIds = SC.Configuration.filterSite.ids;
            var searchFilterArray = null;
            var itemsInfo;
            var result;
            var finalFilters;
            var masterFacets = Configuration.get('masterFacets.facets');
            // when sorting by name, if the item has displayname we sort by that field, if not we sort by itemid
            itemName.setFormula('case when LENGTH({item.storedisplayname}) > 0 then {item.storedisplayname} else (case when LENGTH({item.displayname}) > 0' +
                ' then {item.displayname} else {item.itemid} end) end');

            columns.push(itemName);

            if (siteSettings.isSCISIntegrationEnabled) {
                filters.scisrecords_operator = 'and';
                filters.scisrecords = [
                    [
                        ['type', 'anyof', ['CashSale', 'CustInvc']],
                        'and',
                        ['createdfrom', 'is', '@NONE@'],
                        'and',
                        ['location.locationtype', 'is', SC.Configuration.locationTypeMapping.store.internalid],
                        'and',
                        ['source', 'is', '@NONE@']
                    ],
                    'or',
                    [
                        ['type', 'anyof', ['SalesOrd']]
                    ]
                ];
            } else {
                filters.type_operator = 'and';
                filters.type = ['type', 'anyof', ['SalesOrd']];
            }

            if (this.isMultiSite) {
                if (filterSiteOption === 'current') {
                    searchFilterArray = [siteId, '@NONE@'];
                } else if (filterSiteOption === 'siteIds') {
                    searchFilterArray = filterSiteIds;
                    searchFilterArray.push('@NONE@');
                }

                if (searchFilterArray && searchFilterArray.length) {
                    filters.site_operator = 'and';
                    filters.site = ['website', 'anyof', _.uniq(searchFilterArray)];

                    filters.item_website_operator = 'and';
                    filters.item_website = ['item.website', 'anyof', _.uniq(searchFilterArray)];
                }
            }

            // show only items from one order
            if (orderId) {
                filters.order_operator = 'and';
                filters.order_id = ['internalid', 'is', orderId];

                columns.push(new nlobjSearchColumn('tranid', null, 'group'));
            }

            if (queryFilters.date.from && queryFilters.date.to) {
                filters.date_operator = 'and';

                queryFilters.date.from = queryFilters.date.from.split('-');
                queryFilters.date.to = queryFilters.date.to.split('-');

                filters.date = [
                    'trandate',
                    'within',
                    new Date(
                        queryFilters.date.from[0],
                        queryFilters.date.from[1] - 1,
                        queryFilters.date.from[2]
                    ),
                    new Date(
                        queryFilters.date.to[0],
                        queryFilters.date.to[1] - 1,
                        queryFilters.date.to[2]
                    )
                ];
            }

            // select field to sort by
            switch (queryFilters.sort) {
            // sort by name
            case 'name':
                itemName.setSort(queryFilters.order > 0);
                break;

            // sort by price
            case 'price':
                columns[4].setSort(queryFilters.order > 0);
                break;

            // sort by recently purchased
            case 'date':
                columns[5].setSort(queryFilters.order > 0);
                break;

            // sort by frequenlty purchased
            case 'quantity':
                columns[6].setSort(queryFilters.order > 0);
                break;

            default:
                columns[6].setSort(true);
                break;
            }
            finalFilters = _.values(filters);
            _.each(masterFacets, function eachMasterFacet(facet) {
                if (facet.hideFromReorder) {
                    finalFilters.push('and');
                    // eslint-disable-next-line no-new-wrappers
                    finalFilters.push([new String('item.' + facet.facetId).toString(), 'is', facet.facetValue === 'true' ? 'T' : 'F']);
                }
            });

            // fetch items
            result = Application.getPaginatedSearchResults({
                record_type: 'transaction',
                filters: finalFilters,
                columns: columns,
                page: queryFilters.page,
                column_count: new nlobjSearchColumn('formulatext', null, 'count').setFormula('CONCAT({item}, {options})')
            });
                // prepare an item collection, this will be used to preload item's details
            itemsInfo = _.map(result.records, function mapRecords(line) {
                return {
                    id: line.getValue('internalid', 'item', 'group'),
                    type: line.getValue('type', 'item', 'group')
                };
            });

            if (itemsInfo.length) {
                // preload order's items information
                StoreItem.preloadItems(itemsInfo);

                result.records = _.map(result.records, function mapLines(line) {
                    // prepare the collection for the frontend
                    // @class ReorderItems.Model.Attributes
                    return {
                        // @property {StoreItem} item
                        item: StoreItem.get(line.getValue('internalid', 'item', 'group'), line.getValue('type', 'item', 'group')),
                        // @property {String} tranid
                        tranid: line.getValue('tranid', null, 'group') || null,
                        // @property {Array<Utils.ItemOptionsObject>} options
                        options: Transaction.parseLineOptions(line.getValue('options', null, 'group')),
                        // @property {String} trandate
                        trandate: line.getValue('trandate', null, 'max')
                    };
                    // @class ReorderItems.Model
                });
            }

            return result;
        }
    });
});
