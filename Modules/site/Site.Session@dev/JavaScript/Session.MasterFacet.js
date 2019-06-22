define('Session.MasterFacet', [
    'Session',
    'underscore',
    'SC.Configuration'
], function SessionMasterFacet(
    Session,
    _,
   Configuration
) {
    _.extend(Session, {
        getSearchApiParams: _.wrap(Session.getSearchApiParams, function getSearchApiParams(fn) {
            var searchApiParams = fn.apply(this, _.toArray(arguments).slice(1));
            var masterFacets = Configuration.get('masterFacets.facets');
            _.each(masterFacets, function eachMasterFacet(masterFacet) {
                if (masterFacet.hideFromSearch) {
                    searchApiParams[masterFacet.facetId] = masterFacet.facetValue;
                    _.extend(searchApiParams, {
                        'facet.exclude': searchApiParams['facet.exclude'] ? searchApiParams['facet.exclude'] + ',' + masterFacet.facetId : masterFacet.facetId
                    });
                }
            });
            return searchApiParams;
        })
    });
});

