define('UpsellItems.ProductDetails.QuickView.View', [
    'ProductDetails.QuickView.View',
    'ProductDetails.Full.View',
    'UpsellItems.View',
    'Backbone.CollectionView',
    'underscore'
], function UpsellItemsProductDetailsQuickViewView(
    ProductDetailsQuickView,
    ProductDetailsFullView,
    UpsellItemsView,
    BackboneCollectionView,
    _
) {
    _.extend(ProductDetailsQuickView.prototype, {

        childViews: _.extend(ProductDetailsQuickView.prototype.childViews, {
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
