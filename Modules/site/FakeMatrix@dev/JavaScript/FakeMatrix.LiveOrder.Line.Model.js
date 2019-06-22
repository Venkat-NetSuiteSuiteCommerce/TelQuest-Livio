define('FakeMatrix.LiveOrder.Line.Model', [
    'LiveOrder.Line.Model',
    'underscore'
], function FakeMatrixLiveOrderLineModel(
    LiveOrderLineModel,
    _
) {
    _.extend(LiveOrderLineModel, {
        createFromProduct: function createFromProduct(product) {
            var line = new LiveOrderLineModel(product.toJSON());
            var item = product.get('item');
            var itemImagesDetail = product.getImages();
            var isMatrixItem = !!item.get('_matrixChilds').length;
            var lineOption;

            if (_.isEqual(itemImagesDetail, {}) && item.get('_matrixParent').get('internalid') && item.get('_matrixParent').get('itemimages_detail')) {
                itemImagesDetail = item.get('_matrixParent').get('itemimages_detail');
            }

            line.set('item', product.getItem().clone(), { silent: true });
            line.get('item').set('itemimages_detail', itemImagesDetail, { silent: true });
            line.get('item').set('itemid', item.get('itemid'), { silent: true });
            line.set('rate_formatted', product.getPrice().price_formatted, { silent: true });

            product.get('options').each(function eachProductOption(productOption) {
                lineOption = line.get('options').findWhere({ cartOptionId: '' + productOption.get('cartOptionId') });
                lineOption.attributes = _.extend({}, productOption.attributes, lineOption.attributes);
            });

            if (isMatrixItem) {
                line.get('item').set('matrix_parent', product.get('item'));
            }

            return line;
        }
    });
});
