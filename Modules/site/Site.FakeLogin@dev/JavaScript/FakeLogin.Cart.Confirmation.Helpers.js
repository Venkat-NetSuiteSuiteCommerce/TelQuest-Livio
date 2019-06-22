define('FakeLogin.Cart.Confirmation.Helpers', [
    'Cart.Confirmation.Helpers',
    'LiveOrder.Model',
    'Cart.Confirmation.View',
    'FakeLogin.Utils',
    'underscore'
], function FakeLoginCartConfirmationHelper(
    CartConfirmationHelpers,
    LiveOrderModel,
    CartConfirmationView,
    Utils,
    _
) {
    _.extend(CartConfirmationHelpers, {
        _showCartConfirmationModal: function _showCartConfirmationModal(cartPromise, line, application) {
            if (line.isNew()) {
                return this._showNonOptimisticCartConfirmation(cartPromise, line, application);
            } else {
                cartPromise.done(function cartPromiseDone() {
                    var view = new CartConfirmationView({
                        application: application,
                        model: LiveOrderModel.getInstance().getLatestAddition()
                    });
                    view.showInModal();
                });
            }
        },

        _showNonOptimisticCartConfirmation: function _showNonOptimisticCartConfirmation(cartPromise, line, application) {
            // search the item in the cart to merge the quantities
            var cartModel = LiveOrderModel.getInstance();
            if (LiveOrderModel.loadCart().state() === 'resolved') {
                var cartLine = cartModel.findLine(line);
                if (cartLine) {
                    if (line.get('source') !== 'cart') {
                        cartLine.set('quantity', cartLine.get('quantity') + parseInt(line.get('quantity'), 10));
                    } else {
                        cartLine.set('quantity', line.get('quantity'));
                    }

                    cartPromise.fail(function cartPromiseFailDone() {
                        cartLine.set('quantity', cartLine.previous('quantity'));
                    });

                    line = cartLine;
                } else {
                    cartModel.get('lines').add(line, { at: 0 });

                    cartPromise.fail(function cartPromiseFailDone() {
                        cartModel.get('lines').remove(line);
                    });
                }
            }

            var view = new CartConfirmationView({
                application: application,
                model: line
            });

            cartPromise.done(function cartPromiseDone() {
                if (!Utils.isLoggedIn()) {
                    Utils.addFakeLogin();
                } else {
                    view.model = cartModel.getLatestAddition();
                    view.showInModal();
                    view.render();
                }

            });

        }
    });
});
