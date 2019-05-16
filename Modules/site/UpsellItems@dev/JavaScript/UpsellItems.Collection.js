define('UpsellItems.Collection', [
    'SC.Configuration',
    'Item.Collection',

    'underscore',
    'Utils'
], function UpsellItemsCollection(
    Configuration,
    ItemCollection,
    _
) {
    'use strict';

    return ItemCollection.extend({

        initialize: function initialize(options) {
            this.searchApiMasterOptions = Configuration.searchApiMasterOptions.Upsell;
            this.itemsIds = _.isArray(options.itemsIds) ? _.sortBy(options.itemsIds, function sortItems(id) {
                return id;
            }) : [options.itemsIds];
        },

        fetchItems: function fetchItems() {
            return this.fetch({ data: { id: this.itemsIds.join(',') } });
        }
    });
});
