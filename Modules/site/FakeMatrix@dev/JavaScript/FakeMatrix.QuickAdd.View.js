define('FakeMatrix.QuickAdd.View', [
    'QuickAdd.View',
    'underscore'
], function FakeMatrixQuickAddView(
    QuickAddView,
    _
) {
    _.extend(QuickAddView.prototype, {
        onItemSelected: function onItemSelected(result) {
            // As the item searcher has been thought to work with items the property is called selectedItem, but we changed in the installed
            // plugin to use Products
            var product = result.selectedItem;
            var item;
            var minimumQuantity;

            if (product) {
                item = product.getItem();
                item.set('_matrixParent', product.get('item'));

                this.model.set('quickaddSearch', item.get('_name'));
                this.model.set('selectedProduct', product);

                this.setDefaultQuantity(item.get('_minimumQuantity', true), item.get('internalid'));
                this.$('[name="quantity"]').focus();
                this.selectAll();

                minimumQuantity = item.get('_minimumQuantity', true);

                if (minimumQuantity > 1) {
                    this.$('[data-type="minimum-quantity"]').html(_('Minimum of $(0) required').translate(minimumQuantity));
                }

                this.$('[data-validation-error="block"]').remove();
            } else {
                this.model.unset('selectedProduct');
                this.$('[data-type="minimum-quantity"]').empty();
            }
        }
    });
});
