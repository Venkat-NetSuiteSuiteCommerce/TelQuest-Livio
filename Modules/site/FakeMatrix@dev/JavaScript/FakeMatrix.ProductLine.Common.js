define('FakeMatrix.ProductLine.Common', [
    'ProductLine.Common',
    'Product.Model',
    'Transaction.Line.Model',
    'underscore'
], function FakeMatrixProductLineCommon(
    ProductLineCommon,
    ProductModel,
    TransactionLineModel,
    _
) {
    var ProductLineCommonFakeMatrix = {
        extendOptionsFromItem: function extendOptionsFromItem(item, productline) {
            var options = productline.get('options');
            // Here we make sure that the options collection of the line always
            // (event when the line is loaded from an already created transaction via SuiteScript) have all the properties
            item.get('options').each(function eachOption(itemOption) {
                // IMPORTANT: The comparison here is done in lowercase because both the LiveOrder.Model and the Transaction.Model in
                // the back-end send their option in lower case. However the search API returns some option (Gift certificate ones) in
                // Uppercase and this case is require to be preserved so the Commerce API actually add the item into the cart.
                var itemOptionCartId = itemOption.get('cartOptionId').toLowerCase();
                var productlineOption = productline.get('options').find(function findOption(productOption) {
                    return productOption.get('cartOptionId').toLowerCase() === itemOptionCartId;
                });
                var selectedOption;

                if (!productlineOption && productline.get('item').get('_isChild') && productline.get('item').get(itemOptionCartId)) {
                    selectedOption = _.findWhere(itemOption.get('values'), { label: '' + productline.get('item').get(itemOptionCartId) });

                    if (selectedOption) {
                        itemOption.set('value', selectedOption);
                        productlineOption = itemOption;
                        options.push(itemOption);
                    }
                }

                if (productlineOption) {
                    productlineOption.attributes = _.extend({}, productlineOption.attributes, itemOption.attributes);
                }
            });

            productline.set('options', options);
        }
    };


    _.extend(ProductLineCommon, ProductLineCommonFakeMatrix);
    _.extend(ProductModel.prototype, ProductLineCommonFakeMatrix);
    _.extend(TransactionLineModel.prototype, ProductLineCommonFakeMatrix);
});
