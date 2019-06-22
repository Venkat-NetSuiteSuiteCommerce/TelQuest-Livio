define('FakeMatrix.LiveOrder.Model', [
    'Application',
    'underscore'
], function FakeMatrixLiveOrderModel(
    Application,
    _
) {
    Application.on('after:LiveOrder.get', function afterLiveOrderUpdate(Model, order) {
        var orderInfo = order;
        var invalidParent = {
            status: 500,
            code: 'ERR_INVALID_PARENT_ITEM',
            message: 'There is an invalid item.'
        };
        Application.on('before:LiveOrder.submit', function beforeLiveOrderSubmit() {
            var hasParentItems = _.any(orderInfo.lines, function eachLine(line) {
                return line.item.custitem_awa_is_custom_parent;
            });

            if (hasParentItems) {
                throw invalidParent;
            }
        });
    });
});
