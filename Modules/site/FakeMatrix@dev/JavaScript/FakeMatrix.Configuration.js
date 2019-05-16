define('FakeMatrix.Configuration', [
    'SC.Configuration',
    'underscore'
], function FakeMatrixConfiguration(
    Configuration,
    _
) {
    var FakeMatrixConfig = {
        searchApiMasterOptions: _.extend(Configuration.searchApiMasterOptions, {
            Facets: _.extend(Configuration.searchApiMasterOptions.Facets, {
                relateditems_fieldset: 'searchmatrix'
            }),
            merchandisingZone: _.extend(Configuration.searchApiMasterOptions.merchandisingZone, {
                relateditems_fieldset: 'searchmatrix'
            }),
            typeAhead: _.extend(Configuration.searchApiMasterOptions.typeAhead, {
                relateditems_fieldset: 'searchmatrix'
            })
        })
    };

    return {
        mountToApp: function mountToApp(application) {
            _.extend(application.Configuration, FakeMatrixConfig);
        }
    };
});
