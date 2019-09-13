define('VendorStock.ProductViews.Price.View', [
    'ProductViews.Price.View',
    'SC.Configuration',
    'underscore'
], function VendorStockProductViewsPriceView(
    ProductViewsPriceView,
    Configuration,
    _
) {
    'use strict';
    var outOfStockBehavior = 'Allow back orders with no out-of-stock message';
    var types = [
        'InvtPart'
    ];

    _.extend(ProductViewsPriceView.prototype, {
        shouldShowMessages: function shouldShowMessage(item) {
            return types.indexOf(item.get('itemtype')) >= 0;
        },

        showInStockMessage: function showInStockMessage(item) {
           // return item.get('_isInStock') || (item.get('outofstockbehavior') === outOfStockBehavior) || (item.get('custitem_vendor_stock') > 0);
            console.log(item.get('custitem_hide_add_to_cart'));
            return  (item.get('custitem_hide_add_to_cart')=== false) && (item.get('custitem_vendor_stock') > 0 || item.get('custitem_show_add_to_cart'));

        },



        getContext: _.wrap(ProductViewsPriceView.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var items = this.model.getSelectedMatrixChilds && this.model.getSelectedMatrixChilds();
            var stockItems = [];
            var self = this;
            var showMessages = this.shouldShowMessages(this.model);
            var isInStock = context.isInStock || self.shouldShowMessages(this.model);
            if (items && items.length) {
                stockItems = _.filter(items, function filterItem(item) {
                    showMessages = self.shouldShowMessages(item);
                    return self.showInStockMessage(item);
                });
                isInStock = stockItems && stockItems.length;
            } else if (items && !items.length) {
                stockItems = this.model.getItem();
                showMessages = self.shouldShowMessages(stockItems);
                isInStock = self.showInStockMessage(stockItems);

            } else if (this.model.get('_matrixChilds') && this.model.get('_matrixChilds').length) {
                stockItems = this.model.get('_matrixChilds').filter(function filterItem(item) {
                    showMessages = showMessages || self.shouldShowMessages(item);
                    return self.showInStockMessage(item);
                });

                isInStock = stockItems && stockItems.length;
            }

            _.extend(context, {
                inStockMessage: Configuration.get('vendorstock.inStockMessage') || 'In Stock',
                outOfStockMessage: Configuration.get('vendorstock.outOfStockMessage') || 'Backorder Item - Call for availability',
                isInStock: isInStock,
                showMessages: showMessages
            });
            return context;
        })
    });
});
