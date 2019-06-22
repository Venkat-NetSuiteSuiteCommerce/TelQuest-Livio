define('FakeLogin.ProductViews.Price.View', [
    'ProductViews.Price.View',
    'FakeLogin.Utils',
    'underscore'
], function FakeLoginProductViewsPriceView(
    ProductViewsPriceView,
    Utils,
    _
) {
    'use strict';

    _.extend(ProductViewsPriceView.prototype, {

        events: _.extend(ProductViewsPriceView.prototype.events || {}, {
            'click [data-target="fakeLogin"]': 'fakeLogin'
        }),

        fakeLogin: function fakeLogin(e) {
            e.preventDefault();
            e.stopPropagation();
            Utils.addFakeLogin();
        },

        getContext: _.wrap(ProductViewsPriceView.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            _.extend(context, {
                isLoggedIn: Utils.isLoggedIn()
            });
            return context;
        })

    });
});
