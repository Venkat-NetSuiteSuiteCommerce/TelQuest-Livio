define('Warranty.LiveOrder.Model', [
    'LiveOrder.Model',
    'underscore'
], function WarrantyLiveOrderModel(
    LiveOrderModel,
    _
) {
    _.extend(LiveOrderModel.prototype, {
        updateLines: function updateLines(lines) {
            this.set('linesToUpdate', lines);
            return this.save();
        }
    });
});
