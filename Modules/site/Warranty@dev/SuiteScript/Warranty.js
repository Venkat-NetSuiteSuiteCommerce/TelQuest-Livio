define('Warranty', [
    'Configuration',
    'Warranty.LiveOrder.Model',
    'Warranty.LiveOrder.ServiceController'
], function Warranty(
    Configuration
) {
    'use strict';

    if (Configuration.warranty.itemOptionAssociation) {
        Configuration.associatedFields = Configuration.associatedFields || [];
        Configuration.associatedFields.push({
            option: Configuration.warranty.itemOptionAssociation,
            error: {
                code: 'ERR_REMOVE_WARRANTY',
                message: 'Warranty cannot be removed by itself, you need to remove the item it is associated to.',
                status: 400
            }
        });
    }
});
