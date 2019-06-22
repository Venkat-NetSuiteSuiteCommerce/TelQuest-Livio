define('Application.Events.Once', [
    'Application',
    'underscore'
], function ApplicationEventsOnce(
    Application,
    _
) {
    'use strict';

    _.extend(Application, {
        once: function once(name, callback, context) {
            var self = this;
            var onceFn = _.once(function onceFn() {
                self.off(name, onceFn);
                callback.apply(this, arguments);
            });
            onceFn._callback = callback; // eslint-disable-line no-underscore-dangle
            return this.on(name, onceFn, context);
        }
    });
});
