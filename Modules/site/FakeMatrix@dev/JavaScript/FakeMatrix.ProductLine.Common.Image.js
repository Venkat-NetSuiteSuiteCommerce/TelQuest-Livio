define('FakeMatrix.ProductLine.Common.Image', [
    'ProductLine.Common.Image',
    'ProductList.Item.Model',
    'ProductList.CartSaveForLater.View',
    'ProductLine.Common',
    'Product.Model',
    'Item.Model',
    'ProductLine.Common.Url',
    'underscore'
], function FakeMatrixProductLineCommonImage(
    ProductLineCommonImage,
    ProductListItemModel,
    ProductListCartSaveForLaterView,
    ProductLineCommon,
    ProductModel,
    Item,
    ProductLineCommonUrl,
    _
) {
    var FakeCommonImages = {
        getThumbnail: _.wrap(ProductLineCommonImage.getThumbnail, function getThumbnail(fn) {
            var thumbnail = fn.apply(this, _.toArray(arguments).slice(1));
            var selectedChilds = this.getSelectedMatrixChilds();
            var childImages = [];
            if (selectedChilds && selectedChilds.length > 0) {
                _.each(selectedChilds, function eachChildImage(selectedChild) {
                    if (!_.isEmpty(selectedChild.get('itemimages_detail'))) {
                        childImages = _.union(childImages, [selectedChild.getThumbnail()]);
                    }
                });
            }

            if (childImages.length) {
                return childImages[0];
            }
            return thumbnail;
        })
    };

    _.extend(ProductLineCommonImage, FakeCommonImages);
    _.extend(ProductLineCommon, FakeCommonImages);
    _.extend(ProductLineCommonUrl, FakeCommonImages);
    _.extend(ProductListCartSaveForLaterView.prototype, FakeCommonImages);
    _.extend(ProductModel.prototype, FakeCommonImages);
    _.extend(ProductListItemModel.prototype, FakeCommonImages);
});
