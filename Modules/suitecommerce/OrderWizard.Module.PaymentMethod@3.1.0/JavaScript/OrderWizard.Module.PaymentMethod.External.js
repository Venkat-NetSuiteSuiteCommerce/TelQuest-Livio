/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module OrderWizard
define(
	'OrderWizard.Module.PaymentMethod.External'
,	[
		'OrderWizard.Module.PaymentMethod'
	,	'Transaction.Paymentmethod.Model'

	,	'order_wizard_paymentmethod_external_module.tpl'

	,	'Backbone'
	,	'underscore'
	,	'SC.Configuration'
	,	'Utils'
	]
,	function (
		OrderWizardModulePaymentMethod
	,	TransactionPaymentmethodModel

	,	order_wizard_paymentmethod_external_module_tpl

	,	Backbone
	,	_
	,	Configuration
	,	Utils
	)
{
	'use strict';

	// @class OrderWizard.Module.PaymentMethod.External @extends OrderWizard.Module.PaymentMethod
	return OrderWizardModulePaymentMethod.extend({

		template: order_wizard_paymentmethod_external_module_tpl

	,	render: function render()
		{
			var n = Configuration.get('siteSettings.id')
			,	status_accept_value = Configuration.get('siteSettings.externalCheckout.' + this.options.record_type.toUpperCase() + '.statusAcceptValue' , 'ACCEPT')
			,	status_reject_value = Configuration.get('siteSettings.externalCheckout.' + this.options.record_type.toUpperCase() + '.statusRejectValue' , 'REJECT')
			,	status_parameter_name = Configuration.get('siteSettings.externalCheckout.' + this.options.record_type.toUpperCase() + '.statusParameterName' , 'status')
			,	origin = window.location.origin ? window.location.origin : (window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : ''))
			,	url = origin + Utils.getAbsoluteUrl('external_payment.ssp')
			,	current_touchpoint = Configuration.get('currentTouchpoint')
			,	thankyouurl_parameters = {n: n, externalPaymentDone: 'T', touchpoint: current_touchpoint, recordType: this.options.record_type  || 'salesorder' }
			,	errorurl_parameters =  {n: n, externalPaymentDone: 'T', touchpoint: current_touchpoint, recordType: this.options.record_type || 'salesorder' }
			,	returnurl_parameters = {n: n, externalPaymentDone: 'T', touchpoint: current_touchpoint, recordType: this.options.record_type || 'salesorder'};


			thankyouurl_parameters[status_parameter_name] = status_accept_value;
			errorurl_parameters[status_parameter_name] = status_reject_value;

			if (this.options.prevent_default)
			{
				var	prevent_default_parameter_name = Configuration.get('siteSettings.externalCheckout.' + this.options.record_type.toUpperCase() + '.preventDefaultParameterName', 'preventDefault')
				,	prevent_default_value = Configuration.get('siteSettings.externalCheckout.' + this.options.record_type.toUpperCase() + '.preventDefaultValue', 'T');

				thankyouurl_parameters[prevent_default_parameter_name] = prevent_default_value;
				errorurl_parameters[prevent_default_parameter_name] = prevent_default_value;
				returnurl_parameters[prevent_default_parameter_name] = prevent_default_value;
			}

			this.paymentMethod = new TransactionPaymentmethodModel({
					type: 'external_checkout_' + this.options.paymentmethod.key
				,	isexternal: 'T'
				,	internalid: this.options.paymentmethod.internalid
				,	merchantid: this.options.paymentmethod.merchantid
				,	key: this.options.paymentmethod.key
				,	thankyouurl: Utils.addParamsToUrl(url, thankyouurl_parameters) // Commerce API
				,	errorurl: Utils.addParamsToUrl(url, errorurl_parameters) 	// Commerce API
				,	returnurl: Utils.addParamsToUrl(url, returnurl_parameters) // SuiteScript
			});

			this._render();
		}

	,	getContext: function getContext()
		{
			return {
					//@property {String} imageUrl
					imageUrl: this.options.paymentmethod.imagesrc[0]
					//@property {String} name
				,	name: this.options.paymentmethod.name
					//@property {String} description
				,	description: this.options.description || _('You will be redirected to your external payment site after reviewing your order on next step. Once your order is placed, you will return to our site to see the confirmation of your purchase.').translate()
			};
		}

	});
});