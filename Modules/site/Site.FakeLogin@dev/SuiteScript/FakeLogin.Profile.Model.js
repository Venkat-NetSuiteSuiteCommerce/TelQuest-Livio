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

        var url = nlapiResolveURL('SUITELET', 'customscript_ct__get_salesrep_for_profil', 'customdeploy_ct_get_salesrep_for_profile', true);

        url += '&customerId=' + profile.internalid;

        nlapiLogExecution('ERROR', 'Suitelet URL', url);

        var response = nlapiRequestURL(url, null, request.getAllHeaders(), 'GET');

        var data = JSON.parse(response.getBody() || '{}');

        nlapiLogExecution('ERROR', 'DATA', JSON.stringify(data));

        profile.salesrep = data.salesrep;
    });
});
