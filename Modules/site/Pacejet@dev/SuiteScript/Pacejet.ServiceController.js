define('Pacejet.ServiceController', [
    'ServiceController',
    'Application',
    'Pacejet.Model',
    'Pacejet.Carrier.Model',
    'LiveOrder.Model'
], function PacejetServiceController(
    ServiceController,
    Application,
    PacejetModel,
    Carrier,
    LiveOrderModel
) {
    'use strict';

    /* eslint-disable */
    return ServiceController.extend({
        name: 'Pacejet.ServiceController',
        get: function get() {
            if ((this.request.getParameter('setMethod') + '') === 'T') {
                return {};
            }
            return {
                getRates: PacejetModel.getRates({record: {type: 'salesorder', id: 'cart'}}),
                liveOrder: order.getFieldValues(),
                scaLiveorder: LiveOrderModel.get(),
                carriers: Carrier.list()
            };
        },
        post: function post() {

        }
    });
    /* eslint-enable */
});
