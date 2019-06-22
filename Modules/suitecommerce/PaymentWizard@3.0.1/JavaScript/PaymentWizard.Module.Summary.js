/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(
	'PaymentWizard.Module.Summary'
,	[	'Wizard.Module'
	,	'SC.Configuration'

	,	'payment_wizard_summary_module.tpl'

	,	'underscore'
	,	'jQuery'
	]
,	function (
		WizardModule
	,	Configuration

	,	payment_wizard_summary_module_tpl

	,	_
	,	jQuery
	)
{
	'use strict';

	//@class PaymentWizard.Module.Summary @extend Wizard.Module
	return WizardModule.extend({

		template: payment_wizard_summary_module_tpl

	,	className: 'PaymentWizard.Module.Summary'

	,	initialize: function (options)
		{
			this.is_active = false;
			this.options = options;
			this.wizard = options.wizard;

			this.wizard.model.on('change', jQuery.proxy(this, 'render'));
		}

	,	isActive: function()
		{
			return this.is_active;
		}

	,	future: function ()
		{
			this.is_active = false;
		}

	,	present: function ()
		{
			this.is_active = true;
		}

	,	past: function ()
		{
			this.is_active = false;
		}

	,	render: function ()
		{
			this.continueButtonDisabled = '';
			if (this.options.submit)
			{
				this.continueButtonLabel = _('Submit').translate();
			}
			else
			{
				var selected_invoices = this.wizard.model.getSelectedInvoices();
				this.continueButtonLabel = _('Continue').translate();

				if (!selected_invoices.length)
				{
					this.continueButtonLabel = _('0 Invoices Selected').translate();
					this.continueButtonDisabled = 'disabled="disabled"';
				}
			}

			this._render();

			if (this.isActive())
			{
				this.trigger('change_enable_continue', !this.continueButtonDisabled);
				this.trigger('change_label_continue', this.continueButtonLabel);
			}
		}

		//@method getContext @return {PaymentWizard.Module.Summary.Context}
	,	getContext: function ()
		{
			var model = this.wizard.model;

			//@class PaymentWizard.Module.Summary.Context
			return {
				//@property {Number} selectedInvoicesLength
				selectedInvoicesLength: model.getSelectedInvoices().length
				//@property {String} invoiceTotalFormatted
			,	invoiceTotalFormatted: _.formatCurrency(model.get('invoices_total'))
				//@property {String} paymentFormatted
			,	paymentFormatted: model.get('payment_formatted')
				//@property {String} depositTotalFormatted
			,	depositTotalFormatted: model.get('deposits_total_formatted')
				//@property {String} creditTotalFormatted
			,	creditTotalFormatted: model.get('credits_total_formatted')
				//@property {Boolean} showTotalLabel
			,	showTotalLabel: !!this.options.total_label
				//@property {String} totalLabel
			,	totalLabel: this.options.total_label ? this.options.total_label : _('Estimated payment').translate()
				//@property {Boolean} showEstimatedAsInvoiceTotal
			,	showEstimatedAsInvoiceTotal: this.options.show_estimated_as_invoices_total
				//@property {Boolean} showCreditCardInformatioRequrieLabel
			,	showCreditCardInformatioRequrieLabel: !!(this.options.total_label && model.get('payment') && Configuration.get('siteSettings.checkout.requireccsecuritycode') === 'T')
				//@property {Boolean} showPaymentMethodRequireLabel
			,	showPaymentMethodRequireLabel: !!(this.options.total_label && !model.get('payment'))
				//@property {String} continueButtonDisabled
			,	continueButtonDisabled: this.continueButtonDisabled
				//@property {String} continueButtonLabel
			,	continueButtonLabel: this.continueButtonLabel
			};
		}

	});
});