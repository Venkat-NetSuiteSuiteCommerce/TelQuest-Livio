define('FakeMatrix.ItemRelations.Related.Collection', [
    'ItemRelations.Related.Collection',
    'SC.Configuration',
    'underscore'
], function FakeMatrixItemRelationsRelatedCollection(
    ItemRelationsRelatedCollection,
    Configuration,
    _
) {
    _.extend(ItemRelationsRelatedCollection.prototype, {
        initialize: _.wrap(ItemRelationsRelatedCollection.prototype.initialize, function initialize(fn) {
            fn.apply(this, _.toArray(arguments).slice(1));
            this.searchApiMasterOptions = Configuration.searchApiMasterOptions.Facets;
        }),

        parse: function parse(response) {
            var originalItems = _.compact(response.items);

            if (originalItems.length === 0) {
                return []; // No items. Return an empty array, nothing else to do here.
            }

            return originalItems;
        }
    });
});
