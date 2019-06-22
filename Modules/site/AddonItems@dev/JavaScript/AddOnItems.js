define('AddOnItems', [
    'AddOnItems.Configuration',
    'underscore',
    'SC.Configuration',
    'AddOnItems.ProductList.Item.Model',
    'AddonItems.ProductDetailsToQuote.View',
    'AddOnItems.RequestQuoteWizard.Module.Comments'
], function AddOnItems(
    AddOnItemsConfiguration,
    _,
    Configuration
) {
    'use strict';

    Configuration.ItemOptions.optionsConfiguration = Configuration.addAddOnOptions(Configuration.get('ItemOptions.optionsConfiguration', []));
});
