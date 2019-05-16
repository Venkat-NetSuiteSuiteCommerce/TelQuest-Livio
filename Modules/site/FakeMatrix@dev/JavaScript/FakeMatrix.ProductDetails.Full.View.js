define('FakeMatrix.ProductDetails.Full.View', [
    'ProductDetails.Full.View',
    'ItemRelations.Related.View',
    'ItemRelations.Correlated.View',
    'SC.Configuration',
    'ProductDetails.Base.View',
    'ProductDetails.QuickView.View',
    'underscore'
], function FakeMatrixProductDetailsFullView(
    ProductDetailsFullView,
    ItemRelationsRelatedView,
    ItemRelationsCorrelatedView,
    Configuration,
    ProductDetailsBaseView,
    ProductDetailsQuickViewView,
    _
) {

    _.extend(ProductDetailsBaseView.prototype, {

        selectDefaultCondition: function selectDefaultCondition() {
            var conditionsToSelect = _.filter(Configuration.get('fakematrix.options'), function matrixOptionFilter(matrixOption) {
                return !!matrixOption.defaultValue;
            });
            var self = this;
            var conditionToSelect;
            var selectedMatrixOptions = this.model.getMatrixOptionsSelection();
            var matrixOptions = this.model.get('item').getPosibleOptions().where({ isMatrixDimension: true });
            var conditionOption;
            if (!selectedMatrixOptions || _.isEmpty(selectedMatrixOptions)) {
                if (matrixOptions && matrixOptions.length) {
                    _.each(conditionsToSelect, function eachConditionToSelect(matrixOption) {
                        conditionOption = _.findWhere(matrixOptions, function matrixOptionsWhere(option) {
                            return '' + option.get('cartOptionId') === '' + matrixOption.fieldId;
                        });
                        if (conditionOption) {
                            self.model.setOption(matrixOption.fieldId, matrixOption.defaultValue);
                        }
                    });
                }
            }
        }
    });

    _.extend(ProductDetailsQuickViewView.prototype, {
        initialize: _.wrap(ProductDetailsQuickViewView.prototype.initialize, function initialize(fn) {
            fn.apply(this, _.toArray(arguments).slice(1));
            this.selectDefaultCondition();
        })
    });

    _.extend(ProductDetailsFullView.prototype, {
        initialize: _.wrap(ProductDetailsFullView.prototype.initialize, function initialize(fn) {
            var self = this;
            fn.apply(this, _.toArray(arguments).slice(1));
            this.model.on('change', function onChange() {
                if (!self.model.changed.quantity) {
                    self.generateViewBindings();
                    self.showContent(true);
                }
            });

            this.selectDefaultCondition();
        }),

        childViews: _.extend(ProductDetailsFullView.prototype.childViews, {
            'Related.Items': function RelatedItems() {
                var relatedItems = this.model.get('item').get('custitem_awa_related_items');
                if (relatedItems && relatedItems.length) { // TODO: review if this is always this way or only if its a fake matrix
                    if (relatedItems[relatedItems.length-1] === ',') {
                        relatedItems = relatedItems.substring(0, relatedItems.length-1);
                    }

                    if (relatedItems && relatedItems.length) {
                        return new ItemRelationsRelatedView({
                            itemsIds: relatedItems.split(','),
                            application: this.application
                        });
                    }
                }
            },

            'Correlated.Items': function CorrelatedItems() {
                var itemsIds = this.model.get('item').get('internalid');
                if (this.model.get('item').get('_isParent')) {
                    itemsIds = this.model.get('item').get('_matrixChilds').pluck('internalid');
                }
                if (itemsIds && !_.isEmpty(itemsIds)) {
                    return new ItemRelationsCorrelatedView({
                        itemsIds: itemsIds,
                        application: this.application
                    });
                }
            }
        })
    });
});
