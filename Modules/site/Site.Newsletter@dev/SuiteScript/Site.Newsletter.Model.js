define('Site.Newsletter.Model', [
    'Newsletter.Model',
    'SC.Models.Init',
    'underscore'
], function SiteNewsletterModel(
    NewsletterModel,
    ModelsInit,
    _
) {
    _.extend(NewsletterModel, {
        createSubscription: function createSubscription(email) {
            var record = nlapiCreateRecord('lead', { recordmode: 'dynamic' });
            record.setFieldValue('customform', -8);
            record.setFieldValue('entityid', email);
            record.setFieldValue('firstname', SC.Configuration.newsletter.genericFirstName);
            record.setFieldValue('lastname', SC.Configuration.newsletter.genericLastName);
            record.setFieldValue('email', email);
            record.setFieldValue('companyname', SC.Configuration.newsletter.companyName);
            record.setFieldValue('globalsubscriptionstatus', 1);
            record.setFieldValue('subsidiary', ModelsInit.session.getShopperSubsidiary());
            nlapiSubmitRecord(record, true, true);
            return this.subscriptionDone;
        }
    });
});
