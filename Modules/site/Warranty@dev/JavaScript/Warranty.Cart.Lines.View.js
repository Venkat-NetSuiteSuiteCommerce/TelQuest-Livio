define('Warranty.Cart.Lines.View', [
    'Cart.Lines.View',
    'Product.Option.Model',
    'SC.Configuration',
    'LiveOrder.Model',
    'underscore'
], function WarrantyCartLinesView(
    CartLinesView,
    ProduceOptionModel,
    Configuration,
    LiveOrderModel,
    _
) {
    _.extend(CartLinesView.prototype, {
        events: _.extend(CartLinesView.prototype.events || {}, {
            'click [data-toggle="select-warranty"]': 'selectWarranty'
        }),

        selectWarranty: function selectWarranty(e) {
            var warranty = jQuery(e.currentTarget).val();
            var options = this.model.get('options');
            var cart = LiveOrderModel.getInstance();
            var self = this;
            if (warranty) {
                options.push(new ProduceOptionModel({
                    cartOptionId: Configuration.get('warranty.itemOption'),
                    value: { internalid: warranty }
                }));
                this.model.set('options', options);
                cart.updateLines([this.model]).done(function doneUpdate() {
                    self.render();
                });
            }
        },

        getContext: _.wrap(CartLinesView.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var warrantyOption = this.model.getOption(Configuration.get('warranty.itemOption'));
            return _.extend(context, {
                warranties: this.model.get('item').get('_warrantyOptions'),
                hasWarrantiesAvailable: this.model.get('item').get('_isWarrantyAvailable') && (!warrantyOption || !warrantyOption.get('value'))
            });
        })
    });
});
