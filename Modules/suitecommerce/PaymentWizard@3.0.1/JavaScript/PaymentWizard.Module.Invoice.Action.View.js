/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define('PaymentWizard.Module.Invoice.Action.View'
,	[	'payment_wizard_invoice_action.tpl'

	,	'Backbone'
	]
,	function (
		payment_wizard_invoice_action_tpl

	,	Backbone
	)
{
	'use strict';

	//@class PaymentWizard.Module.Invoice.Action.View @extend Backbone.View
	return Backbone.View.extend({

		template: payment_wizard_invoice_action_tpl

		//@method getContext @return {PaymentWizard.Module.Invoice.Action.View.Context}
	,	getContext: function ()
		{
			//@class PaymentWizard.Module.Invoice.Action.View.Context
			return {
				//@property {Boolean} isPayfull
				isPayfull: !!this.model.get('isPayFull')
				//@property {Boolean} showAction
			,	showAction: !!this.model.get('check')
			};
		}

	});
});