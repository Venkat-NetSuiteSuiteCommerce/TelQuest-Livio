define('FakeMatrix.Transaction.Line.Model', [
    'Transaction.Line.Model',
    'underscore'
], function FakeMatrixProductLineCommonImage(
    TransactionLineModel,
    _
) {
    _.extend(TransactionLineModel, {
        createFromProduct: function createFromProduct(product) {
            var line = new TransactionLineModel(product.toJSON());
            var item = product.get('item');
            var itemImagesDetail = item.get('itemimages_detail');
            var isMatrixItem = !!item.get('_matrixChilds').length;
            var children = product.getSelectedMatrixChilds();
            var price = product.getPrice();
            if (children && children.length) {
                itemImagesDetail = children[0].get('itemimages_detail');
            }

            if (_.isEqual(itemImagesDetail, {}) && item.get('_matrixParent').get('internalid') && item.get('_matrixParent').get('itemimages_detail')) {
                itemImagesDetail = item.get('_matrixParent').get('itemimages_detail');
            }

            line.set('item', product.getItem().clone(), { silent: true });
            line.get('item').set('itemimages_detail', itemImagesDetail, { silent: true });
            line.get('item').set('_name', item.get('_name'), { silent: true });

            line.set('minimumquantity', product.get('item').minimumquantity);

            if (isMatrixItem) {
                line.get('item').set('matrix_parent', product.get('item'));
            }

            line.set('rate', price.price, { silent: true });
            line.set('rate_formatted', price.price_formatted, { silent: true });

            product.get('options').each(function eachOption(productOption) {
                var lineOption = line.get('options').findWhere({ cartOptionId: '' + productOption.get('cartOptionId') });
                lineOption.attributes = _.extend({}, productOption.attributes, lineOption.attributes);
            });

            return line;
        }
    });
});
