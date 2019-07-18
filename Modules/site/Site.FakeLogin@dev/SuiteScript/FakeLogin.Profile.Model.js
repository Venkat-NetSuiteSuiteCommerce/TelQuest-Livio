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

    // var NULL_SALES_REP_FLAG = '--NONE--';

    // ProfileModel.getSalesRep = function getSalesRep() {
    //     var salesRep = '';
    //     var salesRepCustomer;
    //     var url;
    //     var responseObject;
    //     var responseData;
    //
    //     if (ModelsInit.session.isRecognized() || ModelsInit.session.isLoggedIn()) {
    //         salesRep = nlapiGetContext().getSessionObject('salesRep');
    //         nlapiLogExecution('DEBUG', 'salesRep1', JSON.stringify(salesRep));
    //         salesRepCustomer = nlapiGetContext().getSessionObject('salesRepCustomer');
    //         if (!salesRep || salesRepCustomer !== (nlapiGetUser() + '')) {
    //             try {
    //                 url = nlapiResolveURL(
    //                     'SUITELET',
    //                     'customscript_ct__get_salesrep_for_profil',
    //                     'customdeploy_ct_get_salesrep_for_profile',
    //                     true);
    //
    //                 url += '&customerId=' + nlapiGetUser();
    //
    //                 nlapiLogExecution('DEBUG', 'Suitelet URL', url);
    //                 responseObject = nlapiRequestURL(url, null, request.getAllHeaders(), 'GET');
    //                 responseData = JSON.parse(responseObject.getBody() || '{}');
    //                 nlapiLogExecution('DEBUG', 'DATA', JSON.stringify(responseData));
    //                 nlapiLogExecution('DEBUG', 'DATA', JSON.stringify(responseData.salesrep));
    //                 salesRep = responseData.salesrep || '--NONE--';
    //                 nlapiLogExecution('DEBUG', 'salesRep2', JSON.stringify(salesRep));
    //             } catch (e) {
    //                 nlapiLogExecution('ERROR', 'Error while fetching salesrep', JSON.stringify(e));
    //                 salesRep = NULL_SALES_REP_FLAG;
    //             }
    //         }
    //         nlapiGetContext().setSessionObject('salesRep', salesRep);
    //         nlapiGetContext().setSessionObject('salesRepCustomer', nlapiGetUser());
    //     }
    //     nlapiLogExecution('DEBUG', 'salesRep3', JSON.stringify(salesRep));
    //     var ret = salesRep === NULL_SALES_REP_FLAG ? '' : salesRep;
    //     nlapiLogExecution('DEBUG', 'ret', JSON.stringify(ret));
    //
    //     return JSON.stringify(ret);
    // };

    ProfileModel.getSalesRep = function getSalesRep() {
        var loggedIn2 = ModelsInit.session.isLoggedIn2();
        if (loggedIn2) {
            try {
                var url = nlapiResolveURL(
                    'SUITELET',
                    'customscript_ct__get_salesrep_for_profil',
                    'customdeploy_ct_get_salesrep_for_profile',
                    true);

                url += '&customerId=' + nlapiGetUser();
                url = url.replace('https://forms.', 'https://checkout.');

                nlapiLogExecution('DEBUG', 'Suitelet URL', url);
                // @ts-ignore
                var responseObject = nlapiRequestURL(url, null, request.getAllHeaders());
                // nlapiLogExecution('DEBUG', 'responseObject', JSON.stringify(responseObject));

                var responseData = JSON.parse(responseObject.getBody() || '{}');
                nlapiLogExecution('DEBUG', 'responseData', JSON.stringify(responseData));

                var salesRep = responseData.salesrep;
                nlapiLogExecution('DEBUG', 'salesRep', JSON.stringify(salesRep));

                return salesRep;
            } catch (e) {
                nlapiLogExecution('ERROR', 'Error while fetching salesrep', JSON.stringify(e));
                nlapiLogExecution('DEBUG', 'Error while fetching salesrep', JSON.stringify(e));
                return {
                    status: 'Error',
                    message: JSON.stringify(e)
                };
            }
        }
    };

    Application.on('after:Profile.get', function afterProfileModelGet(Model, profile) {
        var fakeLoginCookie = Utils.getCookie(request, 'fakeLogin');
        if (fakeLoginCookie) {
            profile.isFakeLogin = 'T';
            profile.fakeLoginCustomer = fakeLoginCookie;
        }
        var salesRep = Model.getSalesRep();
        nlapiLogExecution('DEBUG', 'salesRep', JSON.stringify(salesRep));

        profile.salesrep = salesRep;
    });
});
