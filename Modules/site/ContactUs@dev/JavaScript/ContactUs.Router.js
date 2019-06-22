define('ContactUs.Router', [
    'ContactUs.Model',
    'ContactUs.View',
    'Backbone',
    'SC.Configuration',
    'underscore',
    'Utils'
], function ContactUsRouter(
    Model,
    View,
    Backbone,
    Configuration,
    _
) {
    'use strict';

    return Backbone.Router.extend({
        routes: {},
        initialize: function initialize(application) {
            this.route(Configuration.get('contactUs.urlcomponent'), 'contactUs');
            this.application = application;
        },

        contactUs: function contactUs(options) {
            var view = new View({
                application: this.application,
                params: _.parseUrlOptions(options),
                model: new Model()
            });

            view.showContent();
        }
    });
});
