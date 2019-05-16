define('Site.ProductDetails.SeoImprovements', [
    'ProductViews.Price.View',
    'Item.Model',
    'Facets.FacetsDisplay.View',
    'Product.Model',
    'GlobalViews.StarRating.View',
    'Facets.ItemCell.View',
    'Awa.Util',
    'Utils',
    'underscore',
    'jQuery'
],
    /** @param {AwaUtil} awaUtil @param {_} _ */
    function SeoImprovements(
        PriceView,
        ItemModel,
        FacetsDisplayView,
        ProductModel,
        GlobalViewsStarRatingView,
        FacetsItemCellView,
        awaUtil,
        Utils,
        _,
        jQuery
    ) {
        'use strict';

        var Module = {

            install: function (application) {
                // // IMPORTANT! COMMENT THIS LINE IN PRODUCTION!
                // if (awaUtil.debug.isLocalSsp()) {
                //     awaUtil.debug.installHandlebarsDebugHelper()
                //     awaUtil.debug.simulatePageGenerator();
                // }
                Module.fixImageAlt();
                Module.fixStockInfo();
                Module.fixSearchH1();
                Module.fixSchemaAggregateRating();

                Module.fixSchemaItemListPosition(application);
            },

            fixImageAlt: function () {
                awaUtil.overrideInstanceMethod(ItemModel, 'getThumbnail', function (image) {
                    return _.extend(image, { altimagetext: image.altimagetext || this.get('_name') });
                });
                awaUtil.overrideInstanceMethod(ProductModel, 'getImages', function (images) {
                    return _.map(images, function getImagesMap(image) {
                        return _.extend(image, {
                            altimagetext: image.altimagetext || this.get('item').get('_name')
                        });
                    }, this);
                });
            },

            fixStockInfo: function () {
                awaUtil.overrideInstanceMethod(ItemModel, 'getStockInfo', function (stockInfo) {
                    _.extend(stockInfo, { isBackOrderable: !!this.get('isbackorderable') });
                    return stockInfo;
                });
                awaUtil.extendViewContext(PriceView, function (context) {
                    var info = this.model.getStockInfo();
                    return { isInStockOrBackOrderable: info.isInStock || info.isBackOrderable };
                });
            },

            fixSearchH1: function fixSearchH1() {
                awaUtil.overrideInstanceMethod(FacetsDisplayView, 'getContext', function (context) {
                    var mainHeader = Utils.translate('Searching');
                    var first = false;
                    var category = this.parentView && this.parentView.model &&
                        this.parentView.model.get('category') &&
                        this.parentView.model.get('category').get('name');
                    if (category) {
                        mainHeader += ((first ? ',' : '') + ' ' + Utils.translate('in') + ' ' + category);
                        first = true;
                    }
                    if (context.values && context.values.length) {
                        mainHeader += ((first ? ',' : '') + ' ' + Utils.translate('narrowed by') + ' ' +
                            _.map(context.values, function (facet) { return facet.valueLabel; }).join(', '));
                        first = true;
                    }
                    return _.extend(context, first ? { mainHeader: mainHeader } : {});
                });
            },

            /** We should not declare https://schema.org/AggregateRatin if the item has no reviews, since ratingValue will be 0 and outside bestRating */
            fixSchemaAggregateRating: function fixSchemaAggregateRating() {
                awaUtil.extendViewContext(GlobalViewsStarRatingView, function () {
                    return {
                        renderSchemaAggregateRating: this.options.ratingCount > 0 || Module.showSchemaAggregateRatingEvenIfNoRatingCount
                    };
                });
                awaUtil.extendViewContext(FacetsItemCellView, function () {
                    return {
                        renderSchemaAggregateRating: this.options.ratingCount > 0 || Module.showSchemaAggregateRatingEvenIfNoRatingCount
                    };
                });                
            },

            fixSchemaItemListPosition: function fixSchemaItemListPosition(application) {
                if (!SC.isPageGenerator()) {
                    return;
                }
                application.getLayout().on('afterAppendView', function (view) {
                    var itemListElementNotContainingPosition = awaUtil.dom.getAncestorsContaining({
                        root: view.$el, parent: '[itemprop="itemListElement"]', child: '[itemprop="position"]', notContaining: true
                    })
                    itemListElementNotContainingPosition.each(function (index) {
                        jQuery('<meta itemprop="position" content="' + (index + 1) + '"></meta>').appendTo(jQuery(this));
                    });
                });
            }

        };

        return Module;

    });
