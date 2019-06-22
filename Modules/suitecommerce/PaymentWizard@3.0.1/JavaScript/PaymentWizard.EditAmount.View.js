/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(
	'PaymentWizard.EditAmount.View'
,	[	'payment_wizard_edit_amount_layout.tpl'

	,	'Backbone'
	,	'Backbone.FormView'
	,	'Utils'
	,	'Handlebars'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		payment_wizard_edit_amount_layout_tpl

	,	Backbone
	,	BackboneFormView
	,	Utils
	,	Handlebars
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class OrderWizard.EditDeposit.View @extend Backbone,View
	return Backbone.View.extend({

		template: payment_wizard_edit_amount_layout_tpl

	,	events: {
			'submit [data-action="edit-amount-form"]':'modifyAmount'
		,	'change [data-action="edit-amount"]':'changedAmount'
		}

	,	bindings: {
			'[name="amount"]': 'amount'
		}

	,	initialize: function (options)
		{
			this.parentView = options.parentView;
			this.model = options.model;
			this.type = options.type;
			this.selectedInvoicesLength = options.selectedInvoicesLength;
			this.invoicesTotal = options.invoicesTotal;

			if (this.type === 'invoice')
			{
				this.original_amount_attribute = 'total';
				this.amount_due_attribute = 'due';
				this.input_label = _('Amount to Pay').translate();
				this.original_amount_label  = _('Original Amount').translate();
				this.amount_due_label  = _('Amount Due').translate();
				this.page_header = _('Invoice #$(0)').translate(this.model.get('tranid'));
				this.title = _('Amount to pay for invoice #$(0)').translate(this.model.get('tranid'));
			}
			else if (this.type === 'deposit')
			{
				this.input_label = _('Amount to apply').translate();
				this.original_amount_label  = _('Remaining amount').translate();
				this.original_amount_attribute = 'remaining';
				this.page_header = _('Deposit #$(0)').translate(this.model.get('refnum'));
				this.title = _('Amount to apply for deposit #$(0)').translate(this.model.get('refnum'));
			}
			else if (this.type === 'credit')
			{
				this.input_label = _('Amount to apply').translate();
				this.original_amount_attribute = 'remaining';
				this.original_amount_label  = _('Remaining amount').translate();
				this.page_header = _('$(0) #$(1)').translate(this.model.get('type'), this.model.get('refnum'));
				this.title = _('Amount to apply for credit #$(0)').translate(this.model.get('refnum'));
			}

			this.page_header = new Handlebars.SafeString('<b>'+ this.page_header.toUpperCase() + '</b>');
			this.clonedModel = BackboneFormView.add(this);
		}

	,	_getOriginalDiscountAmount: function _getOriginalDiscountAmount()
		{
			!this.model.get('original_discamt') && this.model.set('original_discamt', this.model.get('discamt'));

			return this.model.get('original_discamt');
		}

	,	_getOriginalTransactionAmount: function _getOriginalTransactionAmount()
		{
			!this.model.get('original_amount') && this.model.set('original_amount', this.model.get('amount'));

			return this.model.get('original_amount');
		}

	,	changedAmount: function changedAmount (e)
		{
			var amount_to_pay_str = (jQuery(e.target).val() || '').replace(',', '.')
			,	amount_to_pay = parseFloat(amount_to_pay_str);

			if (this.model.get('discountapplies') && !isNaN(amount_to_pay))
			{
				var	original_discount_ammount = this._getOriginalDiscountAmount()
				,	original_amount = this._getOriginalTransactionAmount()
				,	new_discount_amount = (amount_to_pay * original_discount_ammount) / original_amount
				,	new_discount_amount_formatted = Utils.formatCurrency(new_discount_amount);

				this.model.set('discamt', new_discount_amount);
				this.model.set('discamt_formatted', new_discount_amount_formatted);

				this.$('[data-type="applied-discount-ammount"]').text(new_discount_amount_formatted);
				this.$('[data-type="specified-payment-ammount"]').text(Utils.formatCurrency(amount_to_pay));
			}
		}

	,	modifyAmount: function (e)
		{
			var	model = this.model

			,	original_amount = model.get('amount')
			,	new_amount = parseFloat(this.$('[data-action="edit-amount"]').val())

			,	wizard_model = this.parentView.wizard.model
			,	original_total = model.get('orderTotal') || wizard_model.calculeTotal(true);

			e.preventDefault();

			if (model.get('discountapplies') && new_amount === model.get('due'))
			{
				new_amount = model.get('duewithdiscount');
			}

			model
				.set('amount', new_amount)
				.set('orderTotal', wizard_model.calculeTotal(true));

			this.clonedModel.validate();

			if (this.clonedModel.isValid())
			{
				model.set('amount_formatted', _.formatCurrency(new_amount));

				if (this.type === 'invoice')
				{
					wizard_model.distributeCredits();
				}
				else
				{
					wizard_model.calculeTotal();
				}

				this.$containerModal && this.$containerModal.modal('hide');
				this.destroy();
			}
			else
			{
				model.set({
					amount: original_amount
				,	orderTotal: original_total
				});
			}
		}

		//@method getContext @return {OrderWizard.EditDeposit.View.Context}
	,	getContext: function ()
		{
			//@class OrderWizard.EditDeposit.View.Context
			return {
				//@property {String} originalAmountLabel
				originalAmountLabel: this.original_amount_label
				//@property {String} originalAmountFormatted
			,	originalAmountFormatted: this.model.get(this.original_amount_attribute + '_formatted')
				//@property {Boolean} showAmountDue
			,	showAmountDue: !!this.amount_due_label
				//@property {String} amountDueLabel
			,	amountDueLabel: this.amount_due_label
				//@property {String} amountDueFormatted
			,	amountDueFormatted: this.model.get(this.amount_due_attribute + '_formatted')
				//@property {Boolean} showSelectedInvoicesLength
			,	showSelectedInvoicesLength: !!this.selectedInvoicesLength
				//@property {Number} selectedInvoicesLength
			,	selectedInvoicesLength: this.selectedInvoicesLength
				//@property {String} invoiceTotalFormatted
			,	invoiceTotalFormatted: _.formatCurrency(this.invoicesTotal)
				//@property {String} inputLabel
			,	inputLabel: this.input_label
				//@property {Number} inputValue
			,	inputValue: (this.model.get('discountapplies') && this.model.isPayFull()) ? this.model.get('due') : this.model.get('amount')
				//@property {String} currencySymbol
			,	currencySymbol: SC.ENVIRONMENT.currentCurrency && SC.ENVIRONMENT.currentCurrency.symbol || '$'
				//@property {Boolean} showDiscountApplied
			,	showDiscountApplied: !!this.model.get('discountapplies')
				//@property {String} discountFormatted
			,	discountFormatted: this.model.get('discount_formatted')
				//@property {String} discountAmountFormatted
			,	discountAmountFormatted: this.model.get('discamt_formatted')
				//@property {String} dueWithDiscountFormatted
			,	dueWithDiscountFormatted: this.model.get('duewithdiscount_formatted')
			};
		}
	});
});