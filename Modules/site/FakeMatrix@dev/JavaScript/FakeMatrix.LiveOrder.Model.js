define('FakeMatrix.LiveOrder.Model', [
    'LiveOrder.Model',
    'underscore'
], function FakeMatrixLiveOrderModel(
    LiveOrderModel,
    _
) {
    _.extend(LiveOrderModel.prototype, {
        getItemsRelated: function getItemsRelated() {
            var relatedItems = [];
            var item;
            var itemsRelated;
            this.get('lines').each(function eachLine(line) {
                item = line.get('item');
                itemsRelated = item.get('custitem_awa_related_items') || item.get('_matrixParent').get('custitem_awa_related_items') || '';
                itemsRelated = itemsRelated && itemsRelated[itemsRelated.length-1] === ',' ? itemsRelated.substring(0, itemsRelated.length-1) : itemsRelated;
                itemsRelated = (itemsRelated && itemsRelated.split(',')) || [];
                if (itemsRelated && itemsRelated.length) {
                    relatedItems = _.union(relatedItems, itemsRelated);
                }
            });
            return relatedItems;
        }
    });
});
