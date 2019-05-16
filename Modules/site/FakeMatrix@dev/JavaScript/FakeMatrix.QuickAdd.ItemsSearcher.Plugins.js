// @module QuickAdd
define('FakeMatrix.QuickAdd.ItemsSearcher.Plugins', [
    'QuickAdd.ItemsSearcher.Plugins',
    'Item.Model',
    'Product.Model',
    'Product.Collection',
    'underscore'
], function FakeMatrixQuickAddItemsSearhcerPlugins(
    QuickAddItemsSearcherPlugins,
    ItemModel,
    ProductModel,
    ProductCollection,
    _
) {
    'use strict';

    _.extend(QuickAddItemsSearcherPlugins.flatItemsMatrixResult, {
        execute: function execute(collection, configuration) {
            // Current item that is begin processed
            var products = [];
                // Variable that contains the new product created from all parent matrix items to generated one items per child
                // We do this to flat the list of items in the collection
            var newProduct;
                // List of option for the current child item
            var itemOptions;
                // Counter used to emulate the ids of the new products. This is required so the ItemSearcher can identify selected products in the result list
            var internalidCounter = 1;

            collection.each(function eachCollection(item) {
                if (item.get('isinstock') || (item.get('isbackorderable') || configuration.showBackorderables)) {
                    if (item.get('_matrixChilds') && item.get('_matrixChilds').length) {
                        itemOptions = item.get('options').where({ isMatrixDimension: true });

                        item.get('_matrixChilds').each(function eachcMatrixChild(childItem) {
                            var itemimagesDetail;
                            newProduct = new ProductModel({
                                item: new ItemModel(_.extend({}, item.attributes))
                            });

                            _.each(itemOptions, function eachItemOption(option) {
                                var selectedChildItemOptionLabel = childItem.get(option.get('itemOptionId'));
                                var selectedOptionValueObject = _.findWhere(option.get('values'), { label: selectedChildItemOptionLabel });

                                newProduct.setOption(option.get('cartOptionId'), selectedOptionValueObject.internalid);
                            });

                            // Give than the behavior to extract thumbnail images is based on the current selected item (thought for lines)
                            // we provide all children with the image object
                            itemimagesDetail = newProduct.getItem().get('itemimages_detail');
                            if (!itemimagesDetail || _.isEmpty(itemimagesDetail)) {
                                itemimagesDetail = item.get('itemimages_detail');
                            }
                            newProduct.getItem().set('itemimages_detail', itemimagesDetail);

                            newProduct.set('isfulfillable', item.get('isfulfillable'));
                            newProduct.set('internalid', internalidCounter++);
                            // newProduct.set('matrix_parent', item);
                            // newProduct.set('_matrixParent', item);
                            products.push(newProduct);
                        });
                    } else {
                        products.push(new ProductModel({
                            item: item,
                            internalid: internalidCounter++
                        })
                        );
                    }
                }
            });

            products = _.filter(products, function filterProduct(product) {
                var queryOnSku = (product.getSku() ? product.getSku().toUpperCase() : '').indexOf(configuration.query.toUpperCase()) >= 0;
                var queryOnName = (product.get('item').get('_name') ? product.get('item').get('_name').toUpperCase() : '')
                    .indexOf(configuration.query.toUpperCase()) >= 0;
                var itemNotGiftCertificate = product.get('item').get('itemtype') !== 'GiftCert';

                return itemNotGiftCertificate && (queryOnName || queryOnSku);
            });

            return new ProductCollection(_.first(products, configuration.limit));
        }
    });
});
