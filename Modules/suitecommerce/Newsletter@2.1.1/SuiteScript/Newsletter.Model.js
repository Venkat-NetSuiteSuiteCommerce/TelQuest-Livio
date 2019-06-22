/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Newsletter
// ----------
// Handles newsletter subscription through 'lead' or 'customer' record creation/set up.
define(
	'Newsletter.Model'
,	[
		'SC.Model'
	,	'SC.Models.Init'

	,	'underscore'
	,	'Utils'
	]

,	function (
		SCModel
	,	ModelsInit

	,	_
	)
{
	'use strict';

	// @class Newsletter.Model Defines the model used by the Newsletter subscription service.
	// @extends SCModel
	return SCModel.extend({

		// @property {String} name Mandatory for all ssp-libraries models
		name: 'Newsletter'

		// @property {String} validation Includes the validation criteria
	,	validation: {
			email: {
				required: true
			,	pattern: 'email'
			,	msg: 'Valid email is required'
			}
		}

		// @method subscribe Processes the registration of the incoming mail as a newsletter subscriber
		// Please note that a newsletter subscriber has the following value in the 'customer' or lead' records:
		// globalsubscriptionstatus == 1 : (Soft Opt-In, the value we are setting up for new subscribers)
		// globalsubscriptionstatus == 2 : lead NOT subscribed (Soft Opt-Out)
		// globalsubscriptionstatus == 3 : lead already subscribed (Confirmed Opt-In)
		// globalsubscriptionstatus == 4 : lead NOT subscribed (Confirmed Opt-Out)
		// @param {String} email
		// @returns {Newsletter.Model.SuccessfulAnswer} Customer/lead subscription operation result
	,	subscribe: function subscribe (email)
		{

			this.validate({'email': email});

			var searchFilter = new nlobjSearchFilter('email', null, 'is', email)
			,	searchColumnSubscriptionStatus = new nlobjSearchColumn('globalsubscriptionstatus')
			,	customers = nlapiSearchRecord('customer', null, [searchFilter], [searchColumnSubscriptionStatus])

			//Searching by 'customer' returns 'customer' and 'lead' records alltogether,
			//so we group the records by recordtype: i.e.: 'customer' and 'lead' groups.
			,	records = _.groupBy(customers, function (customer)
				{
					return customer.getRecordType();
				});

			//If there's NOT any customer or lead with this email, we set up a lead with globalsubscriptionstatus = 1
			if (!records.customer && !records.lead)
			{
				return this.createSubscription(email);
			}
			else
			{
				return records.customer ? this.updateSubscription(records.customer) : this.updateSubscription(records.lead);
			}
		}

		// @method createSubscription Create a new 'lead' record with globalsubscriptionstatus = 1 (Soft Opt-In)
		// @parameter {String} email
		// @returns {subscriptionDone} Custom object with confirmation of lead record creation
	,	createSubscription: function createSubscription (email)
		{
			var record = nlapiCreateRecord('lead');
			record.setFieldValue('entityid', email);
			record.setFieldValue('firstname', SC.Configuration.newsletter.genericFirstName);
			record.setFieldValue('lastname', SC.Configuration.newsletter.genericLastName);
			record.setFieldValue('email', email);
			record.setFieldValue('subsidiary', ModelsInit.session.getShopperSubsidiary());
			record.setFieldValue('companyname', SC.Configuration.newsletter.companyName);
			record.setFieldValue('globalsubscriptionstatus', 1);
			nlapiSubmitRecord(record);
			return this.subscriptionDone;
		}

		// @method updateSubscription Update globalsubscriptionstatus of the records received
		// @parameter {Array<nlObjSearchObject>} subscribers Array of customer or leads.
		// @returns {Newsletter.Model.SubscriptionDone} Customer/lead subscription operation result
	,	updateSubscription: function updateSubscription (subscribers)
		{
			var subscribers_data = _.map(subscribers, function (subscriber)
				{
					return {
						'id': subscriber.getId()
					,	'status': subscriber.getValue('globalsubscriptionstatus')
					};
				})

				// We count the subscribers by its statuses
			,	subscribers_count = _.countBy(subscribers_data, function (subscriber)
				{
					return subscriber.status;
				});

			// Set up the quantity of the subscribers statuses. If it is NaN, is converted to number zero.
			subscribers_count['1'] = subscribers_count['1'] || 0;
			subscribers_count['2'] = subscribers_count['2'] || 0;
			subscribers_count['3'] = subscribers_count['3'] || 0;
			subscribers_count['4'] = subscribers_count['4'] || 0;

			// If every customer is in 'Confirmed Opt-Out' status ('4'), we cannot subscribe them.
			if ((subscribers_count['4']) === subscribers.length)
			{
				throw this.buildErrorAnswer('ERR_USER_STATUS_DISABLED');
			}
			// If everyone is among 'Soft Opt-In' ('1'), 'Confirmed Opt-In' ('3') or 'Confirmed Opt-Out' ('4'),
			// we cannot subscribe them, and we answer with an 'already subscribed' message.
			else if (subscribers_count['1'] + subscribers_count['3'] + subscribers_count['4'] === subscribers.length)
			{
				throw this.buildErrorAnswer('ERR_USER_STATUS_ALREADY_SUBSCRIBED');
			}
			// If some subscribers are in 'Soft Opt-Out' change every customer with status 'Soft Opt-Out' (2) to 'Soft Opt-In' (1)
			else if (subscribers_count['2'])
			{

				// Get the customers able to be subscribed
				var customers_to_subscribe = _.filter(subscribers_data, function (subscriber)
				{
					return subscriber.status === '2';
				});

				//Updating all subscribers to 'Soft Opt-In' status.
				//Potentially demanding operation on large amount
				//of subscribers; documentation points using nlapiSubmitField
				//as the cheaper way to update lines.
				_.each(customers_to_subscribe,  function (subscriber)
				{
					nlapiSubmitField('customer', subscriber.id, 'globalsubscriptionstatus', 1, false);
				});

				return this.subscriptionDone;
			}
			else
			{
				throw this.buildErrorAnswer('ERROR');
			}
		}

		//@property {Newsletter.Model.SuccessfulAnswer} subscriptionDone
	,	subscriptionDone: {
			code: 'OK'
		,	message: 'Subscription successful!'
		}

		//@method buildErrorAnswer Build the error answer
		//@param {String} String with error code
		//@return {Newsletter.Model.ErrorAnswer} Subscription fail object.
	,	buildErrorAnswer: function buildErrorAnswer (code)
		{
			return {
				status: 500
			,	code: code
			,	message: 'Error trying to set up subscription.'
			};
		}
	});
});

//@class Newsletter.Model.SuccessfulAnswer Subscription successful object.
//@property {String} code
//@property {String} message

//@class Newsletter.Model.ErrorAnswer Subscription failed object.
//@property {String} status Http error status.
//@property {String} code String with response code.
//@property {String} message
