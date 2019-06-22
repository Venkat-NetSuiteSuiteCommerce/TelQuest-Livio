define('FakeLogin.Profile.Model', [
    'SC.Models.Init',
    'Profile.Model',
    'FakeLogin.Utils',
    'Application',
    'underscore'
], function FakeLoginProfileModel(
    ModelsInit,
    ProfileModel,
    Utils,
    Application,
    _
) {
    'use strict';

    var NULL_SALES_REP_FLAG = '--NONE--';

    ProfileModel.getSalesRep = function getSalesRep() {
        var salesRep = '';
        var salesRepCustomer;
        var url;
        var responseObject;
        var responseData;

        if (ModelsInit.session.isRecognized() || ModelsInit.session.isLoggedIn()) {
            salesRep = nlapiGetContext().getSessionObject('salesRep');
            salesRepCustomer = nlapiGetContext().getSessionObject('salesRepCustomer');
            if (!salesRep || salesRepCustomer !== (nlapiGetUser() + '')) {
                try {
                    url = nlapiResolveURL(
                        'SUITELET',
                        'customscript_ct__get_salesrep_for_profil',
                        'customdeploy_ct_get_salesrep_for_profile',
                        true);

                    url += '&customerId=' + nlapiGetUser();

                    nlapiLogExecution('DEBUG', 'Suitelet URL', url);
                    responseObject = nlapiRequestURL(url, null, request.getAllHeaders(), 'GET');
                    responseData = JSON.parse(responseObject.getBody() || '{}');
                    nlapiLogExecution('DEBUG', 'DATA', JSON.stringify(responseData));
                    salesRep = responseData.salesrep || '--NONE--';
                } catch (e) {
                    nlapiLogExecution('ERROR', 'Error while fetching salesrep', JSON.stringify(e));
                    salesRep = NULL_SALES_REP_FLAG;
                }
            }
            nlapiGetContext().setSessionObject('salesRep', salesRep);
            nlapiGetContext().setSessionObject('salesRepCustomer', nlapiGetUser());
        }
        return salesRep === NULL_SALES_REP_FLAG ? '' : salesRep;
    };

    Application.on('after:Profile.get', function afterProfileModelGet(Model, profile) {
        var fakeLoginCookie = Utils.getCookie(request, 'fakeLogin');
        if (fakeLoginCookie) {
            profile.isFakeLogin = 'T';
            profile.fakeLoginCustomer = fakeLoginCookie;
        }
        profile.salesrep = Model.getSalesRep();
    });
});
