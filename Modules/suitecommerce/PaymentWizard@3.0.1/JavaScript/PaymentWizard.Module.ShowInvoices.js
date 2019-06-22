/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(
	'PaymentWizard.Module.ShowInvoices'
,	[	'Wizard.Module'
	,	'Invoice.Collection'

	,	'payment_wizard_showinvoices_module.tpl'

	,	'underscore'
	,	'jQuery'
	]
,	function (
		WizardModule
	,	InvoiceCollection

	,	payment_wizard_showinvoices_module_tpl

	,	_
	,	jQuery
	)
{
	'use strict';

	//@class PaymentWizard.Module.ShowInvoices @extend Wizard.Module
	return WizardModule.extend({

		template: payment_wizard_showinvoices_module_tpl

	,	className: 'PaymentWizard.Module.ShowInvoices'

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.wizard.model.on('change:confirmation', jQuery.proxy(this, 'render'));
		}

	,	render: function()
		{
			if (this.wizard.model.get('confirmation'))
			{
				this.invoices = new InvoiceCollection(_.where(this.wizard.model.get('confirmation').invoices, {apply: true}));
			}
			else
			{
				this.invoices = this.wizard.model.getSelectedInvoices();
				this.wizard.model.calculeTotal();
			}
			this._render();
		}

		//@method getContext @return {PaymentWizard.Module.ShowInvoices.Context}
	,	getContext: function ()
		{
			var invoices_to_show = this.invoices.map(function (invoice)
			{
				var invoice_number = invoice.get('tranid') || invoice.get('refnum');
				//@class PaymentWizard.Module.ShowInvoices.Invoice.Record
				return {
					//@property {String} title
					title: invoice_number ?  _('Invoice #$(0)').translate(invoice_number) : _('Invoice').translate()
					//@property {String} id
				,	id: invoice.get('internalid')
					//@property {String} amountFormatted
				,	amountFormatted: invoice.get('amount_formatted')
				};
			});

			//@class PaymentWizard.Module.ShowInvoices.Context
			return {
				//@property {Number} invoicesLength
				invoicesLength: this.invoices.length
				//@property {String} invoicesTotalFormatted
			,	invoicesTotalFormatted: this.wizard.model.get('confirmation') ? this.wizard.model.get('confirmation').invoices_total_formatted  : this.wizard.model.get('invoices_total_formatted')
				//@property {Array<PaymentWizard.Module.ShowInvoices.Invoice.Record>} invoices
			,	invoices: invoices_to_show
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
			};
		}
	});
});