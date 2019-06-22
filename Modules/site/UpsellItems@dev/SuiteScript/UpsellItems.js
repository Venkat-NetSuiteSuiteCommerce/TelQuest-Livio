define('UpsellItems', [
    'Configuration',
    'UpsellItems.LiveOrder.Model'
], function Warranty(
    Configuration
) {
    'use strict';

    if (Configuration.upsell.itemOption) {
        Configuration.associatedFields = Configuration.associatedFields || [];

        Configuration.associatedFields.push({
            option: Configuration.upsell.itemOption,
            error: {
                code: 'ERR_REMOVE_WARRANTY',
                message: 'Upsell cannot be removed by itself, you need to remove the item it is associated to.',
                status: 400
            }
        });
    }
});
