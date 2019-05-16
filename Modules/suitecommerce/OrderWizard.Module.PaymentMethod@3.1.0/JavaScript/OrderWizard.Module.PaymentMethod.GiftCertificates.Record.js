/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Quote
define(
	'OrderWizard.Module.PaymentMethod.GiftCertificates.Record'
,	[
		
		'GlobalViews.FormatPaymentMethod.View'

	,	'order_wizard_paymentmethod_giftcertificates_module_record.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	]
,	function (
		GlobalViewsFormatPaymentMethodView

	,	order_wizard_paymentmethod_giftcertificates_module_record_tpl

	,	Backbone
	,	BackboneCompositeView
	)
{
	'use strict';

	// @class OrderWizard.Module.PaymentMethod.GiftCertificates.Record @extends Backbone.View
	return Backbone.View.extend({

		template: order_wizard_paymentmethod_giftcertificates_module_record_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

		// @property {Object} childViews
	,	childViews: {
			'GiftCertificates': function ()
			{
				return new GlobalViewsFormatPaymentMethodView({ 
					model: this.model 
				});
			}
		}

		// @method getContext @return OrderWizard.Module.PaymentMethod.GiftCertificates.Record.Context
	,	getContext: function()
		{
			// @class OrderWizard.Module.PaymentMethod.GiftCertificates.Record.Context
			return {
				// @property {Quote.Model} collection 
				giftcertificate: this.model.get('giftcertificate')
			};
		}	
	});
});