define('Warranty.LiveOrder.ServiceController', [
    'LiveOrder.ServiceController',
    'LiveOrder.Model',
    'underscore'
], function WarrantyLiveOrderServiceController(
    LiveOrderServiceController,
    LiveOrderModel,
    _
) {

    _.extend(LiveOrderServiceController, {
        put: function put() {
            if (this.data.linesToUpdate) {
                LiveOrderModel.updateLines(this.data.linesToUpdate);
            } else {
                LiveOrderModel.update(this.data);
            }
            return LiveOrderModel.get();
        }
    });

});
