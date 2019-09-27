define('FakeMatrix.ProductViews.Price.View', [
    'ProductViews.Price.View',
    'Profile.Model',
    'Session',
    'SC.Configuration',
    'product_views_price.tpl',
    'Backbone',
    'underscore'
], function FakeMatrixProductViewsPriceView(
    ProductViewsPriceView,
    ProfileModel,
    Session,
    Configuration,
    productViewsPriceTpl,
    Backbone,
    _
) {
    'use strict';

    _.extend(ProductViewsPriceView.prototype, {
        showFakeMatrixPriceOptions: function showFakeMatrixPriceOptions() {
            return this.model.get('item') && this.model.get('item').get('_isParent') && this.options.origin === 'ITEMCELL';
        },
        getFakeMatrixPriceOptions: function getFakeMatrixPriceOptions() {
            var priceOpts = [];
            this.model.get('item').get('_matrixChilds').each(function eachRelatedItem(currentChild) {
                var exists = _.findWhere(priceOpts, { custitem_awa_condition: currentChild.get('custitem_awa_condition') });
                var onlinePrice = currentChild.get('_priceDetails') || {};

                if(currentChild.get('custitem_awa_condition')==="New") {



                    if (exists) {
                        if (onlinePrice.onlinecustomerprice < exists.price) {
                            exists.internalid = currentChild.get('internalid');
                            exists.priceFormatted = onlinePrice.onlinecustomerprice_formatted;
                            exists.price = onlinePrice.onlinecustomerprice;
                            exists.comparePrice = currentChild.get('_comparePriceAgainst'),
                                exists.comparePriceFormatted = currentChild.get('_comparePriceAgainstFormated'),
                                exists.showComparePrice = currentChild.get('_comparePriceAgainst') > onlinePrice.onlinecustomerprice
                        }
                    } else {
                        priceOpts.push({
                            internalid: currentChild.get('internalid'),
                            isNew: currentChild.get('custitem_awa_condition') === 'New',
                            isLikeNew: currentChild.get('custitem_awa_condition') === 'Like New',
                            isRecertified: currentChild.get('custitem_awa_condition') === 'Recertified',
                            OnlinePriceOnly: currentChild.get('custitem_webstore_online_price_only'),
                            custitem_awa_condition: currentChild.get('custitem_awa_condition'),
                            priceFormatted: onlinePrice.onlinecustomerprice_formatted,
                            price: onlinePrice.onlinecustomerprice,
                            comparePrice: currentChild.get('_comparePriceAgainst'),
                            comparePriceFormatted: currentChild.get('_comparePriceAgainstFormated'),
                            showComparePrice: currentChild.get('_comparePriceAgainst') > onlinePrice.onlinecustomerprice
                        });
                    }

                }
            });

            priceOpts = _.sortBy(priceOpts, 'custitem_awa_condition');

            return priceOpts;
        },

        showFakeMatrixPriceOptionsRecertified: function showFakeMatrixPriceOptionsRecertified() {
            return this.model.get('item') && this.model.get('item').get('_isParent') && this.options.origin === 'ITEMCELL';
        },
        getFakeMatrixPriceOptionsRecertified: function getFakeMatrixPriceOptionsRecertified() {
            var priceOptsRecertified = [];
            this.model.get('item').get('_matrixChilds').each(function eachRelatedItem(currentChild) {
                var exists = _.findWhere(priceOptsRecertified, { custitem_awa_condition: currentChild.get('custitem_awa_condition') });
                var onlinePrice = currentChild.get('_priceDetails') || {};

                if(currentChild.get('custitem_awa_condition')==="Recertified") {


                    if (exists) {
                        if (onlinePrice.onlinecustomerprice < exists.price) {
                            exists.internalid = currentChild.get('internalid');
                            exists.priceFormatted = onlinePrice.onlinecustomerprice_formatted;
                            exists.price = onlinePrice.onlinecustomerprice;
                            exists.comparePrice = currentChild.get('_comparePriceAgainst'), exists.comparePriceFormatted = currentChild.get('_comparePriceAgainstFormated'), exists.showComparePrice = currentChild.get('_comparePriceAgainst') > onlinePrice.onlinecustomerprice
                        }
                    } else {
                        priceOptsRecertified.push({
                            internalid: currentChild.get('internalid'),
                            isNew: currentChild.get('custitem_awa_condition') === 'New',
                            isLikeNew: currentChild.get('custitem_awa_condition') === 'Like New',
                            isRecertified: currentChild.get('custitem_awa_condition') === 'Recertified',
                            catalog: currentChild.get('custitem_catalog'),
                            custitem_awa_condition: currentChild.get('custitem_awa_condition'),
                            priceFormatted: onlinePrice.onlinecustomerprice_formatted,
                            price: onlinePrice.onlinecustomerprice,
                            comparePrice: currentChild.get('_comparePriceAgainst'),
                            comparePriceFormatted: currentChild.get('_comparePriceAgainstFormated'),
                            showComparePrice: currentChild.get('_comparePriceAgainst') > onlinePrice.onlinecustomerprice
                        });
                    }

                }
            });

            priceOptsRecertified = _.sortBy(priceOptsRecertified, 'custitem_awa_condition');

            return priceOptsRecertified;
        },




        getContext: _.wrap(ProductViewsPriceView.prototype.getContext, function getContext(fn) {
            return _.extend(fn.apply(this, _.toArray(arguments).slice(1)), {
                fakeMatrixPrices: this.showFakeMatrixPriceOptions() ? this.getFakeMatrixPriceOptions() : false,
                recertifiedMessage: Configuration.get('recertifiedhelpinformation'),
                newMessage: Configuration.get('newhelpinformation'),
                likeNewMessage: Configuration.get('likehelpinformation'),
                fakeMatrixPricesRecertified: this.showFakeMatrixPriceOptionsRecertified() ? this.getFakeMatrixPriceOptionsRecertified() : false
            });
        })

    });
});
