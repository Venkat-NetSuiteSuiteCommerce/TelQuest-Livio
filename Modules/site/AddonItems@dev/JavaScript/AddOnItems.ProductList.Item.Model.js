define('AddOnItems.ProductList.Item.Model', [
    'ProductList.Item.Model',
    'SC.Configuration',
    'underscore'
], function AddOnItemsProductListItemModel(
    ProductListItemModel,
    Configuration,
    _
) {
    _.extend(ProductListItemModel, {
        createFromProductToQuote: function createFromProductToQuote(product) {
            var attributes = product.toJSON();
            delete attributes.internalid;

            Configuration.addOnOptions = Configuration.addOnOptions || [];

            _.each(attributes.options, function eachOptions(option) {
                option.values = product.get('options').findWhere({ cartOptionId: option.cartOptionId }).get('values');
                if (Configuration.addOnOptions.indexOf(option.cartOptionId) >= 0) {
                    option.value = null;
                }
            });

            attributes.item = product.get('item').toJSON();

            return new ProductListItemModel(attributes);
        }
    });
});
