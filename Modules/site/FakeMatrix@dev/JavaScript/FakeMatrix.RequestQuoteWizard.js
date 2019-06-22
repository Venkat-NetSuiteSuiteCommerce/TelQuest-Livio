define('FakeMatrix.RequestQuoteWizard', [
    'RequestQuoteWizard',
    'ProductList.Item.Model',
    'underscore'
], function FakeMatrixRequestQuoteWizard(
    RequestQuoteWizard,
    ProductListItemModel,
    _
) {
    _.extend(RequestQuoteWizard, {
        doAddItemToList: function doAddItemToList(product) {
            var productListLine = ProductListItemModel.createFromProduct(product);

            if (product.get('item').get('_matrixParent').id) {
                // As the quote is a line, it will only save the child item, but product list saves the parent item
                // so we override the item with the parent one
                if (!product.get('item').get('_isChild')) {
                    productListLine.set('item', product.get('item').get('_matrixParent'), { silent: true });
                }
            }

            productListLine.set('productList', {
                id: this.pl_internalid
            });

            productListLine.save(null, {
                // Note this is lack of validation is require to not validate the JSON returned from the services
                // as it will lack the Model/Collection structure required to run the validation.
                // for example the list of options will be an array and not a collection as the event handle that parse them didn't run yet
                validate: false
            }).done(function saveProductLitLineDone(obj) {
                product.set('pl_item_internalid', obj.internalid, { silent: true });
            });
        }
    });
});
