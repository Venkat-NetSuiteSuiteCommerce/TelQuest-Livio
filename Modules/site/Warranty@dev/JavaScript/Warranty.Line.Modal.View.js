define('Warranty.Line.Modal.View', [
    'Backbone',
    'warranty_modal_view.tpl',
    'Transaction.Line.Views.Option.View',
    'Product.Option.Model',
    'SC.Configuration',
    'Backbone.CollectionView',
    'jQuery',
    'underscore'
], function WarrantyLineModelView(
    Backbone,
    warrantyModalViewTpl,
    TransactionLineViewsOptionView,
    ProduceOptionModel,
    Configuration,
    BackboneCollectionView,
    jQuery,
    _
) {
    return Backbone.View.extend({
        template: warrantyModalViewTpl,

        events: {
            'click [data-toggle="select-warranty"]': 'selectWarranty'
        },
        initialize: _.wrap(Backbone.View.initialize, function initialize(fn) {
            var self = this;
        }),

        childViews: {
            'Options.Collection': function OptionsCollection() {
                var options = this.model.getVisibleOptions();
                options = options.filter(function filterUpsells(option) {
                    return option.get('cartOptionId') !== Configuration.get('upsell.selectedOption');
                });
                return new BackboneCollectionView({
                    collection: options,
                    childView: TransactionLineViewsOptionView,
                    viewsPerRow: 1,
                    childViewOptions: {
                        line: this.model,
                        templateName: 'selected'
                    }
                });
            }
        },

        selectWarranty: function selectWarranty(e) {
            var warranty = jQuery(e.currentTarget).val();
            var options = this.model.get('options');
            if (warranty) {
                options.push(new ProduceOptionModel({
                    cartOptionId: Configuration.get('warranty.itemOption'),
                    value: { internalid: warranty }
                }));
                this.model.set('options', options);
            }
        },

        getContext: function getContext() {
            return {
                name: this.model.get('item').get('_originalName'),
                warranty: this.model.get('item').get('_warrantyOptions'),
                cartOptionId: Configuration.get('warranty.itemOption'),
                thumbnail: this.model.getThumbnail(),
                sku: this.model.getSku()
            };
        }
    });
});
