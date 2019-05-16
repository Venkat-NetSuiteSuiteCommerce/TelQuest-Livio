/*
 © 2015 NetSuite Inc.
 User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
 provided, however, if you are an authorized user with a NetSuite account or log-in, you
 may use this code subject to the terms that govern your access and use.
 */

// ContactUs.Model.js
// ----------------
// Handles creating, fetching and updating ContactUs

define('ContactUs.Model', [
    'SC.Model',
    'Application',
    'Models.Init',
    'Utils'
], function ContactUs(
    SCModel,
    Application,
    CommerceAPI
) {
    'use strict';

    return SCModel.extend({
        name: 'ContactUs',

        configuration: SC.Configuration && SC.Configuration.contactUs,

        create: function create(data) {
            var response;
            var responseCode;
            var currentDomainMatch = CommerceAPI.session.getSiteSettings(['touchpoints'])
                .touchpoints.login
                .match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i); // eslint-disable-line no-useless-escape
            var currentDomain = currentDomainMatch && currentDomainMatch[0];
            currentDomain = currentDomain.replace('checkout', 'forms');
            var url = currentDomain + 'app/site/crm/externalcasepage.nl?compid=' +
                nlapiGetContext().getCompany() + '&formid=' + this.configuration.formId + '&h=' +
                this.configuration.hash + '&globalsubscriptionstatus=1';

            nlapiLogExecution('ERROR', 'url', url);
            if (CommerceAPI.context.getFeature('SUBSIDIARIES')) {
                data.subsidiary = CommerceAPI.session.getShopperSubsidiary();
            }
            nlapiLogExecution('ERROR', 'data', data);
            try {
                response = nlapiRequestURL(url, data);
                responseCode = parseInt(response.getCode(), 10);
                // Just in case someday it accepts the redirect. 206 is netsuite error ('partial content')
                if (responseCode === 200 || responseCode === 302 || responseCode === 201) {
                    return {
                        successMessage: 'Thanks for contacting us'
                    };
                }
            } catch (e) {
                // If the form submit SUCCEEDS!!! it will throw an exception
                // Because of the url redirect
                if (e instanceof nlobjError && e.getCode().toString() === 'ILLEGAL_URL_REDIRECT') {
                    return {
                        successMessage: 'Thanks for contacting us!'
                    };
                }
            }

            return {
                status: 500,
                code: 'ERR_FORM',
                message: 'Something went wrong processing your form, please try again later.'
            };
        }
    });
});
