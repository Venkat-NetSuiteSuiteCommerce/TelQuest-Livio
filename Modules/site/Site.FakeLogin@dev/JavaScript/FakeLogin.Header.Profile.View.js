define('FakeLogin.Header.Profile.View', [
    'Header.Profile.View',
    'FakeLogin.Utils',
    'underscore',
    'Profile.Model'
], function FakeLoginHeaderProfileView(
    HeaderProfileView,
    Utils,
    _,
    Profile
) {
    _.extend(HeaderProfileView.prototype, {
        getContext: _.wrap(HeaderProfileView.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var fakeLogin = Utils.getFakeCustomer();
            var profile = Profile.getInstance();
            _.extend(context, {
                displayName: context.displayName || fakeLogin,
                showExtendedMenu: context.showExtendedMenu || Utils.isLoggedIn(),
                showMyAccountMenu: context.showMyAccountMenu && !fakeLogin
            });
            return context;
        })
    });
});
