define('FakeMatrix.ItemRelations.Correlated.Collection', [
    'ItemRelations.Correlated.Collection',
    'SC.Configuration',
    'underscore'
], function FakeMatrixItemRelationsCorrelatedCollection(
    ItemRelationsCorrelatedCollection,
    Configuration,
    _
) {
    _.extend(ItemRelationsCorrelatedCollection.prototype, {
        parse: _.wrap(ItemRelationsCorrelatedCollection.prototype.parse, function parse(fn) {
            var originalItems = fn.apply(this, _.toArray(arguments).slice(1));
            var masterFacets = Configuration.get('masterFacets.facets');

            originalItems = _.filter(originalItems, function filterOriginalItems(originalItem) {
                return _.all(masterFacets, function allFacets(facet) {
                    return !facet.hideFromCorrelated || originalItem[facet.facetId].toString() === facet.facetValue;
                });
            });

            return originalItems;
        })
    });
});
