define('FakeLogin.Item.KeyMapping', [
    'Item.KeyMapping',
    'FakeLogin.Utils',
    'SC.Configuration',
    'underscore'
], function FakeLoginItemKeyMapping(
    ItemKeyMapping,
    Utils,
    Configuration,
    _
) {
    if (!Configuration.itemKeyMapping) {
        Configuration.itemKeyMapping = {};
    }

    _(Configuration.itemKeyMapping).extend({
        _priceDetails: function priceDetails(item) {
            var onlineCustomerPrice = item.get('onlinecustomerprice_detail') || {};
            var showLoggedInPrice = Utils.isLoggedIn();

            if (!showLoggedInPrice) {
                onlineCustomerPrice = {
                    onlinecustomerprice: item.get('pricelevel' + Configuration.get('mapprice')) || onlineCustomerPrice.onlinecustomerprice || '',
                    onlinecustomerprice_formatted: item.get('pricelevel' + Configuration.get('mapprice') + '_formatted') ||
                        onlineCustomerPrice.onlinecustomerprice_formatted || ''
                };
            }
            return onlineCustomerPrice;
        }
    });
});
