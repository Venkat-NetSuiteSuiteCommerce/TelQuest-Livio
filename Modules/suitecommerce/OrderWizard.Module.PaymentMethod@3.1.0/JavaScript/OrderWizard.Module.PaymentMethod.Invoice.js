/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// OrderWizard.Module.PaymentMethod.Invoice.js
// --------------------------------
//
define(
	'OrderWizard.Module.PaymentMethod.Invoice'
,	[	'OrderWizard.Module.PaymentMethod'
	,	'Transaction.Paymentmethod.Model'

	,	'order_wizard_paymentmethod_invoice_module.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		OrderWizardModulePaymentMethod
	,	TransactionPaymentmethodModel

	,	order_wizard_paymentmethod_invoice_module_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({

		template: order_wizard_paymentmethod_invoice_module_tpl

	,	events: {
			'click [data-toggle="show-terms"]': 'showTerms'
		}

	,	errors: ['ERR_WS_INVALID_PAYMENT', 'ERR_CHK_INVOICE_CREDIT_LIMIT']

	,	showTerms: function()
		{
			var self = this
			,	TermsView = Backbone.View.extend({
					title: _('Terms and Conditions').translate()
				,	render: function ()
					{
						this.$el.html(_(self.wizard.application.getConfig('checkoutApp.invoiceTermsAndConditions')).translate());
						return this;
					}
				});

			this.wizard.application.getLayout().showInModal(new TermsView());
		}

	,	isActive: function ()
		{
			var terms = this.terms = this.getProfile().get('paymentterms');
			return terms && terms.internalid;
		}

	,	getProfile: function ()
		{
			return this.wizard.options.profile;
		}

	,	render: function ()
		{
			if (this.isActive())
			{
				return this._render();
			}
		}

	,	submit: function ()
		{
			var self = this;

			return this.isValid().done(function ()
			{
				self.paymentMethod = new TransactionPaymentmethodModel(
				{
						type: 'invoice'
					,	terms: self.wizard.options.profile.get('paymentterms')
				});

				OrderWizardModulePaymentMethod.prototype.submit.apply(self);
			});
		}
	,	getContext: function ()
		{

			return {
					//@property {String} termsName
					termsName: this.terms.name
					//@property {Boolean} showTerms
				,	showTerms: this.wizard.application.getConfig('siteSettings.checkout.requiretermsandconditions') === 'T'
					//@property {String} balanceAvailable
				,	balanceAvailable: this.wizard.options.profile.get('balance_available_formatted') || ''
			};
		}
	});
});