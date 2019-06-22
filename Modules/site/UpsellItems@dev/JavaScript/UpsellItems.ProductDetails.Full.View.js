define('UpsellItems.ProductDetails.Full.View', [
    'ProductDetails.Full.View',
    'UpsellItems.View',
    'UpsellItems.Collection',
    'Backbone.CollectionView',
    'underscore'
], function FakeMatrixProductDetailsFullView(
    ProductDetailsFullView,
    UpsellItemsView,
    UpsellItemsCollection,
    BackboneCollectionView,
    _
) {
    _.extend(ProductDetailsFullView.prototype, {

        childViews: _.extend(ProductDetailsFullView.prototype.childViews, {
            'UpsellItems.Items': function UpsellItemsItems() {
                var upsellItems = this.model.get('item').get('_upsellItems');
                if (upsellItems) {
                    upsellItems = _.filter(upsellItems, function (upsellItem, key) {
                        upsellItem.upsellId = key;
                        return upsellItem && upsellItem.items && upsellItem.items.length;
                    });
                    return new BackboneCollectionView({
                        collection: _.values(upsellItems),
                        childView: UpsellItemsView,
                        childViewOptions: {
                            application: this.application,
                            item: this.model,
                            parentView: this
                        }
                    });
                }
            }
        })
    });
});
