define('FakeLogin.Profile.Model', [
    'Profile.Model',
    'FakeLogin.Utils',
    'Application',
    'underscore'
], function FakeLoginProfileModel(
    ProfileModel,
    Utils,
    Application,
    _
) {
    Application.on('after:Profile.get', function afterProfileModelGet(Model, profile) {
        var fakeLoginCookie = Utils.getCookie(request, 'fakeLogin');
        if (fakeLoginCookie) {
            profile.isFakeLogin = 'T';
            profile.fakeLoginCustomer = fakeLoginCookie;
        }
    });
});
