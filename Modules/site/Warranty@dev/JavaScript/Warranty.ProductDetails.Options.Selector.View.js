define('Warranty.ProductDetails.Options.Selector.View', [
    'ProductDetails.Options.Selector.View',
    'ProductViews.Option.View',
    'SC.Configuration',
    'Backbone.CollectionView',
    'underscore'
], function WarrantyProductDetailsOptionsSelectorView(
    ProductDetailsOptionsSelectorView,
    ProductViewsOptionView,
    Configuration,
    BackboneCollectionView,
    _
) {
    'use strict';

    _.extend(ProductDetailsOptionsSelectorView.prototype, {
        childViews: _.extend(ProductDetailsOptionsSelectorView.prototype.childViews || {}, {
            'Options.Collection': function OptionsCollection() {
                var availableOptions = this.model.getVisibleOptions();
                if (this.options.isWarranty) {
                    availableOptions = availableOptions.filter(function (option) {
                        return option.get('cartOptionId') === Configuration.get('warranty.itemOption');
                    });
                } else {
                    availableOptions = availableOptions.filter(function (option) {
                        return option.get('cartOptionId') !== Configuration.get('warranty.itemOption');
                    });
                }
                return new BackboneCollectionView({
                    collection: availableOptions,
                    childView: ProductViewsOptionView,
                    viewsPerRow: 1,
                    childViewOptions: {
                        line: this.model,
                        item: this.model.get('item'),
                        templateName: 'selector',
                        show_required_label: this.options.show_required_label
                    }
                });
            }
        }),

        getContext: _.wrap(ProductDetailsOptionsSelectorView.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            return _.extend(context, {
                isWarrantyOption: this.options.isWarranty
            });
        })
    })
});
