define('ContactUs.ServiceController', [
    'ServiceController',
    'Application',
    'ContactUs.Model'
], function ItemBadgesServiceController(
    ServiceController,
    Application,
    ContactUsModel
) {
    'use strict';

    return ServiceController.extend({
        name: 'ContactUs.ServiceController',

        post: function post() {
            this.sendContent(ContactUsModel.create(this.data), { 'status': 201 });
        }
    });
});
