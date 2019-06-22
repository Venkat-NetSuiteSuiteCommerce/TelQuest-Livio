define('AddonItems.ProductDetailsToQuote.View', [
    'ProductDetailToQuote.View',
    'ProductList.Model',
    'ProductList.Item.Model',
    'SC.Configuration',
    'underscore'
], function AddonItemsProductDetailsToQuoteView(
    ProductDetailsToQuoteView,
    ProductListModel,
    ProductListItemModel,
    Configuration,
    _
) {
    _.extend(ProductDetailsToQuoteView.prototype, {
        itemToQuote: function itemToQuote(e) {
            var self = this;
            var phone = Configuration.get('quote.defaultPhone', '');
            var email = Configuration.get('quote.defaultEmail', '');
            var productListModel;
            var productListLine;
            var productListLineJson;
            var itemPresentInList;
            e.preventDefault();
            this.state.feedbackMessage = '';

            // if user is logged in but isn't allowed to quote, we warn him.
            if (this.profile_model.get('isLoggedIn') === 'T' && !this.state.quote_permissions) {
                this.state.feedbackMessageType = 'warning';
                this.state.feedbackMessage = _('Sorry, you don\'t have sufficient permissions to request a quote online.' +
                    ' <br/> For immediate assistance <strong>call us at $(0)</strong> or email us to <strong>$(1)</strong>')
                    .translate(phone, email);
                this.render();
            } else if (this.model.isSelectionComplete() && this.isQuotable() && this.validateLogin()) {
                this.application.ProductListModule.Utils.getRequestAQuoteProductList().done(function doneRequestQuoteProductList(productListJson) {
                    productListLine = ProductListItemModel.createFromProductToQuote(self.model);

                    if (!productListJson.internalid) {
                        productListModel = new ProductListModel(productListJson);

                        productListModel.save().done(function doneProductListSave(productListJsonSave) {
                            self.addItemToQuote(productListJsonSave, productListLine, self.model);
                        });
                    } else {
                        productListLineJson = productListLine.toJSON();
                        itemPresentInList = _.find(productListJson.items, function findProductListItem(productListLineAux) {
                            return parseInt(productListLineAux.item.internalid, 10) === productListLineJson.item.internalid &&
                                _.isEqual(productListLineJson.options, productListLineAux.options);
                        });

                        if (itemPresentInList) {
                            self.updateItemInQuote(itemPresentInList);
                        } else {
                            self.addItemToQuote(productListJson, productListLine, self.model);
                        }
                    }
                });
            }
        }
    });
});
