/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuoteToSalesOrderWizard
define('QuoteToSalesOrderWizard.Router'
,	[
		'Wizard.Router'
	,	'QuoteToSalesOrderWizard.View'
	,	'QuoteToSalesOrderWizard.Step'
	,	'SC.Configuration'
	,	'Profile.Model'

	,	'AjaxRequestsKiller'
	,	'Session'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		WizardRouter
	,	QuoteToSalesOrderWizardView
	,	QuoteToSalesOrderWizardStep
	,	Configuration
	,	ProfileModel

	,	AjaxRequestsKiller
	,	Session

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class QuoteToSalesOrderWizard.Router @extend Wizard.Router
	return WizardRouter.extend({
		//@property {QuoteToSalesOrderWizard.Step} step
		step: QuoteToSalesOrderWizardStep

		//@property {QuoteToSalesOrderWizard.View} view
	,	view: QuoteToSalesOrderWizardView

		//@method initialize Override default method to update the collection of address in the current transaction model
		//@return {Void}
	,	initialize: function ()
		{
			WizardRouter.prototype.initialize.apply(this, arguments);

			ProfileModel.getInstance().get('addresses').on('add remove change', _.bind(this.reSetModelAddresses, this, this.model));
		}

		//@method runStep override default runstep method to validate that a quote id has been specified in the URL and the corresponding quote is already loaded
		//@param {String} str_options Current Options in the url
		//@return {Void}
	,	runStep: function (str_options)
		{
			// Computes the position of the user in the flow
			var url = str_options ? Backbone.history.fragment.replace('?' + str_options, '') : Backbone.history.fragment
			,	position = this.getStepPosition(url)
			,	content = ''
			,	page_header = ''
			,	layout = this.application.getLayout()
			,	hash_options = _.parseUrlOptions(str_options)
			,	is_external = hash_options.externalPayment === 'DONE' || hash_options.externalPayment === 'FAIL'
			,	self = this
			,	salesorderid = str_options && ~str_options.indexOf('salesorderid=');

			if (salesorderid && !is_external)
			{
				//wizard just finished and user refreshed the page
				page_header = _('Your Order has been placed').translate();
				content += _('If you want to review your last order you can go to <a href="/purchases/view/$(0)">Your Account</a>. ')
					.translate(hash_options.salesorderid) +
					_('Or you can return to <a href="/quotes">quotes</a>.').translate();

				layout.internalError && layout.internalError(content, page_header, _('My Account').translate());
			}
			else if (!hash_options.quoteid && !is_external)
			{
				layout.notFound && layout.notFound();
			}
			if ((this.model.get('quoteid') !== hash_options.quoteid || position.fromBegining === 0) || is_external)
			{

				this.model.clear();
				//This is done because many OrderWizard Modules dont check if the summary is set
				if (is_external)
				{
					this.model.set('salesorderid', hash_options.nltranid);
				}
				this.model.set('summary', {}, {silent: true});
				this.model.set('quoteid', hash_options.quoteid);

				this.model.fetch(
				{
					killerId: AjaxRequestsKiller.getKillerId()
				})
				.then(function ()
				{
					if (!is_external)
					{
						self.reSetModelAddresses(self.model, true);
					}
					WizardRouter.prototype.runStep.apply(self);
				});
			}
			else if (this.model.get('confirmation') && this.model.get('confirmation').get('internalid') && position.toLast !== 0)
			{
				// if you have already placed the order you can not be in any other step than the last
				page_header = _('Your Order has been placed').translate();
				content += _('You cannot place the order for this quote again. If you want to review your last order you can go to  <a href="/ordershistory/view/$(0)">Your Account</a>. ')
					.translate(this.model.get('confirmation').get('internalid')) +
					_('Or you can return to <a href="/quotes">quotes</a>.').translate();

				layout.internalError && layout.internalError(content, page_header, _('My Account').translate());
			}
			else
			{
				WizardRouter.prototype.runStep.apply(self, arguments);
			}
		}

		//@method reSetModelAddresses Internal method used to set the addresses collection of the current sales order model
		// We clone the current profile
		// @param {QuoteToSalesOrder.Model} model
		// @param {Boolean} silent
		// @return {Address.Collection}
	,	reSetModelAddresses: function (model, silent)
		{
			var selected_shipping_address = model.get('addresses').get(model.get('shipaddress'))
			,	selected_billing_address = model.get('addresses').get(model.get('billaddress'))
			,	new_addresses_collection = ProfileModel.getInstance().get('addresses').clone();

			new_addresses_collection.add(selected_billing_address);
			new_addresses_collection.add(selected_shipping_address);

			model.get('addresses').reset(new_addresses_collection.models, {silent:silent});
			return new_addresses_collection;
		}

		//@method addsParamsToFollowingStepURL Add the require params to the next/previous step url
		//@param {Object} url_options Dictionary where each key is a url para and its value if the url parameter value
		//@param {String} next_step_url
		//@return {String}
	,	addsParamsToFollowingStepURL: function (url_options, next_step_url)
		{
			if (url_options.force)
			{
				next_step_url = _.addParamsToUrl(next_step_url, {force: true});
			}
			if (url_options.quoteid)
			{
				next_step_url = _.addParamsToUrl(next_step_url, {quoteid: url_options.quoteid});
			}
			return next_step_url;
		}

		// @method goToNextStep finds the next steps and navigates to it
		// Override default implementation to preserve parameters when  navigating between steps
		// @return {Void}
	,	goToNextStep: function ()
		{
			var next_step_url = this.getNextStepUrl()
			,	url_options = _.parseUrlOptions(Backbone.history.location.hash);

			if (next_step_url)
			{
				this.navigate(this.addsParamsToFollowingStepURL(url_options, next_step_url), {trigger: true});
			}
		}

		// @method goToPreviousStep finds the previous steps and navigates to it
		// Override default implementation to preserve parameters when  navigating between steps
		// @return {Void}
	,	goToPreviousStep: function ()
		{
			var previous_step_url = this.getPreviousStepUrl()
			,	url_options = _.parseUrlOptions(Backbone.history.location.hash);

			if (previous_step_url)
			{
				this.navigate(this.addsParamsToFollowingStepURL(url_options, previous_step_url), {trigger: true});
			}
		}

		//@method hidePayment Indicate when there none elements to pay if the payment method must be asked anyway or not.
		//The case when there is nothing to pay happens when you pay the entire order with promo codes and/or gift certificates
		//@return {Boolean}
	,	hidePayment: function ()
		{
			return this.application.getConfig('siteSettings.checkout.hidepaymentpagewhennobalance') === 'T' && this.model.get('summary').total === 0;
		}

		//@method isMultiShipTo Indicate if the current sales order is multi ship to (MST) or not
		//This method is required by CartSummary
		//@return {Boolean}
	,	isMultiShipTo: function ()
		{
			return !!this.model.get('ismultishipto');
		}
	});
});