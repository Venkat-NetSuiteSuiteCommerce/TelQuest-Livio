define('ContactUs.Model', [
    'Backbone',
    'underscore',
    'SC.Configuration',
    'Utils'
], function ContactUsModel(
    Backbone,
    _,
    Configuration,
    Utils
) {
    'use strict';

    return Backbone.Model.extend({
        urlRoot: Utils.getAbsoluteUrl('services/ContactUs.Service.ss'),
        validation: {
            email: {
                required: true,
                pattern: 'email',
                msg: _('Please provide a valid email').translate()
            },
            title: {
                required: true,
                msg: _('Title name is required').translate()
            },
            incomingmessage: {
                required: true,
                msg: _('A message is required').translate()
            }
        },
        initialize: function initialize() {
            var self = this;
            var objKey;
            var fields = Configuration.get('contactUs.fields');

            _.each(fields, function eachFields(fieldId) {
                objKey = fieldId.fieldId;
                self.validation[objKey] = {
                    required: fieldId.mandatory,
                    msg: _(fieldId.requiredmsg).translate()
                };
            });
        }
    });
});
