define('Pacejet.Hooks.LiveOrder', [
    'Pacejet.Configuration',
    'Pacejet.Model',
    'SC.Models.Init',
    'Application',
    'Utils',
    'underscore'
], function PacejetHooksLiveOrder(
    PJConfig,
    PacejetModel,
    ModelsInit,
    Application,
    Utils,
    _
) {
    'use strict';

    function transformShipmethods(shipmethods, pacejetData) {
        var newShipMethods = [];
        if (pacejetData.status === 'OK' && pacejetData.data && pacejetData.data.shipmethods) {
            _.each(pacejetData.data.shipmethods, function eachPacejetMethod(pjShipMethod) {
                var newMethod;
                var originalMethod = _.find(shipmethods, function findMethod(shipMethod) {
                    return (shipMethod.internalid + '') === (pjShipMethod.xref + '');
                });
                if (originalMethod) {
                    newMethod = _.extend(
                        {},
                        originalMethod,
                        {
                            rate: pjShipMethod.rate,
                            rate_formatted: Utils.formatCurrency(pjShipMethod.rate),
                            original_rate: originalMethod.rate,
                            original_rate_formatted: originalMethod.rate_formatted
                        }
                    );
                    if (PJConfig.debugMode) {
                        newMethod.pjdebug = _.extend({}, pjShipMethod);
                    }
                    if (newMethod.rate === 0) {
                        newMethod.rate_formatted = 'Free!';
                    }

                    newShipMethods.push(newMethod);
                } else {
                    // nlapiLogExecution('DEBUG', 'Not Found');
                }
            });
        }
        newShipMethods = _.sortBy(newShipMethods, 'rate');
        return newShipMethods;
    }

    function enforceShippingRate() {
        var pacejetData;
        var shipMethods;
        var chosenShipMethod;
        var shippingData = ModelsInit.order.getFieldValues({
            'shipaddress': ['country', 'zip', 'state'],
            'shipmethod': ['shipmethod', 'shipcarrier'],
            'shipmethods': ['name', 'shipmethod', 'shipcarrier']
        });

        if (shippingData.shipmethod && shippingData.shipmethod.shipmethod && shippingData.shipaddress && shippingData.shipaddress.zip) {
            // normalize shipmethods
            shippingData.shipmethods = _.map(shippingData.shipmethods, function (a) {
                a.internalid = a.shipmethod;
                return a;
            });

            pacejetData = PacejetModel.getRates({ record: { type: 'salesorder', id: 'cart' } });
            shipMethods = transformShipmethods(shippingData.shipmethods, pacejetData);

            chosenShipMethod = _.find(shipMethods, function predicate(sm) {
                return (sm.shipmethod + '') === (shippingData.shipmethod.shipmethod + '');
            });

            if (chosenShipMethod) {
                /* eslint-disable */
                ModelsInit.order.setCustomFieldValues({ custbody_awa_pj_rate: new String(chosenShipMethod.rate).toString() });
                /* eslint-enable */
            }
        }
    }

    Application.on('after:LiveOrder.update', function afterLiveOrderGet(Model) {
        if (Model.isSecure && ModelsInit.session.isLoggedIn2()) {
            enforceShippingRate();
        }
    });

    Application.on('before:LiveOrder.get', function afterLiveOrderGet(Model) {
        if (Model.isSecure && ModelsInit.session.isLoggedIn2()) {
            enforceShippingRate();
        }
    });

    Application.on('after:LiveOrder.get', function afterLiveOrderGet(Model, responseData) {
        var pacejetData;
        var shippingData;
        if (Model.isSecure && ModelsInit.session.isLoggedIn2()) {
            shippingData = ModelsInit.order.getFieldValues({
                'shipaddress': ['country', 'zip', 'state']
            });
            if (shippingData.shipaddress && shippingData.shipaddress.zip) {
                pacejetData = PacejetModel.getRates({ record: { type: 'salesorder', id: 'cart' } });
                responseData.shipmethods = transformShipmethods(responseData.shipmethods, pacejetData);
            }
        }
    });
});
