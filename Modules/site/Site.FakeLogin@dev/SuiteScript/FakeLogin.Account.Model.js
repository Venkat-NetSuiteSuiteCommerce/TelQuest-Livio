define('FakeLogin.Account.Model', [
    'Account.Model',
    'SiteSettings.Model',
    'SC.Models.Init',
    'Profile.Model',
    'Application',
    'LiveOrder.Model',
    'Address.Model',
    'CreditCard.Model',
    'FakeLogin.Utils',
    'underscore'
], function FakeMatrixAccountModel(
    AccountModel,
    SiteSettings,
    ModelsInit,
    Profile,
    Application,
    LiveOrder,
    Address,
    CreditCard,
    Utils,
    _
) {
    _.extend(AccountModel, {
        registerAsGuest: function registerAsGuest(user) {
            var siteSettings = SiteSettings.get();

            if (siteSettings.registration.companyfieldmandatory === 'T') {
                user.companyname = 'Guest Shopper';
            }

            var oldUser = Profile.get();
            if (oldUser && oldUser.isFakeLogin === 'T') {
                user.custentity_awa_fake_login_id = oldUser.fakeLoginCustomer;
            }
            nlapiLogExecution('ERROR', 'user', JSON.stringify(user));
            ModelsInit.session.registerGuest(user);

            user = Profile.get();
            user.isLoggedIn = ModelsInit.session.isLoggedIn2() ? 'T' : 'F';
            user.isRecognized = ModelsInit.session.isRecognized() ? 'T' : 'F';

            return {
                touchpoints: ModelsInit.session.getSiteSettings(['touchpoints']).touchpoints,
                user: user,
                cart: LiveOrder.get(),
                address: Address.list(),
                creditcard: CreditCard.list()
            };
        }
    });

});
