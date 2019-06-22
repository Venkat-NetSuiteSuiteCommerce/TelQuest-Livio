/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.FormatPaymentMethod.View'
,	[
		'SC.Configuration'
	,	'Utils'

	,	'global_views_format_payment_method.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		Configuration
	,	Utils

	,	global_views_format_payment_method_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class GlobalViews.FormatPaymentMethod.View @extends Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: global_views_format_payment_method_tpl

		// @method initialize
	,	initialize: function (options)
		{
			this.showBillingInfo = options.showBillingInfo;
			this.model = options.model || new Backbone.Model();
		}
		
		// @method getContext @return GlobalViews.FormatPaymentMethod.View.Context
	,	getContext: function()
		{
			var payment_methods = Configuration.get('siteSettings.paymentmethods')
			,	credit_card = this.model.get('creditcard')
			,	is_paypal = this.model.get('type') === 'paypal'
			,	is_credit_card = this.model.get('type') === 'creditcard' && credit_card && credit_card.ccnumber
			,	is_invoice = this.model.get('type') === 'invoice'
			,	is_gift_certificate = this.model.get('type') === 'giftcertificate'
			,	credit_card_payment_method_name = credit_card && credit_card.paymentmethod ? credit_card.paymentmethod.name : ''
			, 	credit_card_payment_method_internalid = credit_card && credit_card.paymentmethod ? credit_card.paymentmethod.internalid : ''
			, 	credit_card_payment_method_key = credit_card && credit_card.paymentmethod ? credit_card.paymentmethod.key : ''
			,	gift_certificate_ending = ''
			,	payment_method = credit_card_payment_method_key ? _.findWhere(payment_methods, {key: credit_card_payment_method_key}) : _.findWhere(payment_methods, {internalid: credit_card_payment_method_internalid})
			,	icon = payment_method && payment_method.imagesrc && payment_method.imagesrc[0];

			if (is_gift_certificate)
			{
				var code_length = this.model.get('giftcertificate').code.length;
				gift_certificate_ending = this.model.get('giftcertificate').code.substring(code_length - 4, code_length);
			}

			// @class GlobalViews.FormatPaymentMethod.View.Context
			return {
					// @property {Object} model
					model: this.model
					// @property {Boolean} showStreet
				,	showStreet: this.model.get('ccstreet') && this.showBillingInfo
					// @property {Boolean} showZipCode
				,	showZipCode: this.model.get('cczipcode') && this.showBillingInfo
					// @property {Boolean} isCreditcard
				,	isCreditcard: is_credit_card
					// @property {Boolean} isGiftCertificate
				,	isGiftCertificate: is_gift_certificate
					// @property {Boolean} isPaypal
				,	isPaypal: is_paypal
					// @property {Boolean} isInvoice
				,	isInvoice: is_invoice
					// @property {Boolean} isOther
				,	isOther: !is_invoice && !is_paypal && !is_credit_card && !is_gift_certificate
					// @property {String} type
				,	type: this.model.get('type') || _('Not specified').translate()
					// @property {String} name
				,	name: this.model.get('name') || _('Not specified').translate()
					// @property {String} creditCardNumberEnding
				,	creditCardNumberEnding: credit_card && credit_card.ccnumber && credit_card.ccnumber.replace(/\*/g, '') || ''
					// @property {String} showCreditCardImage
				,	showCreditCardImage: !!icon
					// @property {String} creditCardImageUrl
				,	creditCardImageUrl: icon || ''
					// @property {String} creditCardPaymentMethodName
				,	creditCardPaymentMethodName: credit_card_payment_method_name
					// @property {Object} creditCard: credit_card
				,	creditCard: credit_card
					// @property {String} giftCertificateEnding
				,	giftCertificateEnding: gift_certificate_ending
					// @property {String} showPurchaseNumber
				,	showPurchaseNumber: !!this.model.get('purchasenumber')

			};
		}
	});
});