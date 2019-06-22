/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
define('CreditCard.View'
,	[
		'SC.Configuration'
	,	'CreditCard.Edit.Form.SecurityCode.View'
	,	'creditcard.tpl'
	,	'Backbone.CompositeView'
	,	'Backbone.FormView'
	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration
	,	CreditCardEditFormSecurityCodeView
	,	creditcard_tpl
	,	BackboneCompositeView
	,	BackboneFormView
	,	Backbone
	,	_
	)
{
	'use strict';

	// @class CreditCard.View @extends Backbone.View
	return Backbone.View.extend({

		template: creditcard_tpl

	,	initialize: function (options)
		{
			BackboneCompositeView.add(this);
			this.options = options;

			if (this.options.showSecurityCodeForm)
			{
				this.model.set('hasSecurityCode', true);

				this.bindings = {
					'[name="ccsecuritycode"]': 'ccsecuritycode'
				};

				this.events = {
					'submit form': 'doNothing'
				};

				BackboneFormView.add(this);
			}
		}

	, 	childViews : {
			'CreditCard.Edit.Form.SecurityCode' : function ()
			{
				return new CreditCardEditFormSecurityCodeView(
				{
					error: this.options.securityNumberError
				,	showCreditCardHelp: this.options.showCreditCardHelp
				,	creditCardHelpTitle: this.options.creditCardHelpTitle
				});
			}
		}

	,	doNothing: function (e)
		{
			e.preventDefault();
		}

		//@method getContext @return CreditCard.View
	,	getContext: function ()
		{
			var payment_methods = Configuration.get('siteSettings.paymentmethods')
			,	payment_method = this.model.get('paymentmethod').key ? _.findWhere(payment_methods, {key: this.model.get('paymentmethod').key}) : _.findWhere(payment_methods, {internalid: this.model.get('paymentmethod').internalid})
			,	icon = payment_method && payment_method.imagesrc && payment_method.imagesrc[0]
			,	expiration_month = this.model.get('expmonth');

			//@class CreditCard.View
			return {
				//@property {String} creditCartId
				creditCartId: this.model.get('internalid')
				//@property {Boolean} showSecurityCodeForm
			,	showSecurityCodeForm: !!this.options.showSecurityCodeForm
				// @property {String} showCreditCardImage
			,	showCreditCardImage: !!icon
				// @property {String} creditCardImageUrl
			,	creditCardImageUrl: icon || ''
				//@property {String} paymentName
			,	paymentName: this.model.get('paymentmethod').name
				//@property {String} ccnumber
			,	ccnumber: this.model.get('ccnumber').substring(this.model.get('ccnumber').length - 4)
				//@property {String} ccname
			,	ccname: this.model.get('ccname')
				//@property {String} expirationDate
			,	expirationDate: (expiration_month < 10 ? '0' : '') + expiration_month + '/' + this.model.get('expyear')
				//@property {Boolean} showDefaults
			,	showDefaults: !!this.options.showDefaults
				//@property {Boolean} isDefaultCreditCard
			,	isDefaultCreditCard: this.model.get('ccdefault') === 'T'
				//@property {Boolean} showSelect
			,	showSelect: !!this.options.showSelect
				//@property {String} selectMessage
			,	selectMessage: this.options.selectMessage
				//@property {Boolean} showActions
			,	showActions: !!this.options.showActions
			};
		}
	});
});