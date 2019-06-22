/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(
	'PaymentWizard.Module.Confirmation'
,	[	'Wizard.Module'

	,	'payment_wizard_confirmation_module.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		WizardModule

	,	payment_wizard_confirmation_module_tpl

	,	_
	)
{
	'use strict';

	//@class PaymentWizard.Module.Confirmation @extend Wizard.Module
	return WizardModule.extend({

		template: payment_wizard_confirmation_module_tpl

	,	className: 'PaymentWizard.Module.Confirmation'

	,	future: function ()
		{
			var model = this.wizard.model;

			if (model.get('confirmation'))
			{
				model.unset('confirmation', {silent: true});
			}
		}

		//@method getContext @return {PaymentWizard.Module.Confirmation.Context}
	,	getContext: function ()
		{
			var confirmation = this.wizard.model.get('confirmation')
			,	is_confirmation_created = !!(confirmation && confirmation.internalid && confirmation.internalid !== '0');

			//@class PaymentWizard.Module.Confirmation.Context
			return {
				//@property {String} tranId
				tranId: confirmation ? confirmation.tranid : ''
				//@property {Boolean} isConfirmationCreated
			,	isConfirmationCreated: is_confirmation_created
				//@property {Boolean} showLinkConfirmation
			,	showLinkConfirmation: is_confirmation_created
				//@property {String} confirmationId
			,	confirmationId: confirmation ? confirmation.internalid : ''
				//@property {Boolean} isInvoiceLengthGreaterThan0
			,	isInvoiceLengthGreaterThan0: !!this.wizard.model.get('invoices').length
				//@property {String} dwonloadPDFURL
			,	dwonloadPDFURL: is_confirmation_created ? _.getDownloadPdfUrl({asset:'customer-payment-details', 'id': confirmation.internalid}) : ''
			};
		}
	});
});