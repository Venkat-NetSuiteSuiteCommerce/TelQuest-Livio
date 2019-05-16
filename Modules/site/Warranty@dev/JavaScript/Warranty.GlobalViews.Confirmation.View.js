define('Warranty.GlobalViews.Confirmation.View', [
    'GlobalViews.Confirmation.View',
    'underscore'
], function WarrantyGlobalViewsConfirmationView(
    GlobalViewsConfirmationView,
    _
) {
   _.extend(GlobalViewsConfirmationView.prototype, {
       initialize: _.wrap(GlobalViewsConfirmationView.prototype.initialize, function initialize(fn, options) {
           fn.apply(this, _.toArray(arguments).slice(1));

           this.destroyCallBack = options.destroyCallBack;
           this.destroyCallBackParameters = options.destroyCallBackParameters;
           this.modalClass = options.modalClass || this.modalClass;
       }),

       destroy: _.wrap(GlobalViewsConfirmationView.prototype.destroy, function destroy(fn) {
           fn.apply(this, _.toArray(arguments).slice(1));

           _.isFunction(this.destroyCallBack) && this.destroyCallBack.call(this, this.destroyCallBackParameters);
       })
   });
});
