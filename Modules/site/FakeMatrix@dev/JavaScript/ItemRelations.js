define('ItemRelations', [
    'ItemRelations.Related.View',
    'ItemRelations.Correlated.View',
    'Cart.Detailed.View'
], function ItemRelations(
    ItemRelationsRelatedView,
    ItemRelationsCorrelatedView,
    CartDetailedView
) {
    'use strict';

    return {
        // @method mountToApp
        // @param {ApplicationSkeleton} application
        // @return {Void}
        mountToApp: function mountToApp(application) {
            CartDetailedView.addChildViews({
                'Correlated.Items': function wrapperFunction(options) { // eslint-disable-line consistent-return
                    var itemsIds = options.model.getItemsIds();
                    if (itemsIds && itemsIds.length) {
                        return function CorrelatedItems() {
                            return new ItemRelationsCorrelatedView({
                                itemsIds: itemsIds,
                                application: application
                            });
                        };
                    }
                },
                'Related.Items': function wrapperFunction(options) {
                    return function relatedView() { // eslint-disable-line consistent-return
                        var itemsIds = options.model.getItemsRelated();
                        if (itemsIds && itemsIds.length) {
                            return new ItemRelationsRelatedView({
                                itemsIds: itemsIds,
                                application: application
                            });
                        }
                    };
                }
            });
        }
    };
});
