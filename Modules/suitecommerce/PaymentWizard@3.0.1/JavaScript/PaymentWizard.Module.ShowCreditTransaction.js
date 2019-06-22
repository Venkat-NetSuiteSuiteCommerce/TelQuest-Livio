/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(
	'PaymentWizard.Module.ShowCreditTransaction'
,	[	'Wizard.Module'
	,	'PaymentWizard.CreditTransaction.Collection'

	,	'payment_wizard_show_credit_transaction_module.tpl'

	,	'underscore'
	,	'jQuery'
	]
,	function (
		WizardModule
	,	CreditTransactionCollection

	,	payment_wizard_show_credit_transaction_module_tpl

	,	_
	,	jQuery
	)
{
	'use strict';

	//@class PaymentWizard.Module.ShowCreditTransaction @extend Wizard.Module
	return WizardModule.extend({

		template: payment_wizard_show_credit_transaction_module_tpl

	,	className: 'PaymentWizard.Module.ShowCreditTransaction'

	,	initialize: function (options)
		{
			this.transaction_type = options.transaction_type;
			this.wizard = options.wizard;
			this.wizard.model.on('change:confirmation', jQuery.proxy(this, 'render'));
		}

	,	render: function()
		{
			var confirmation = this.wizard.model.get('confirmation');

			if (confirmation)
			{
				this.collection = new CreditTransactionCollection(
					_.where(confirmation[this.transaction_type === 'credit' ? 'credits' : 'deposits'], {
						apply: true
					})
				);
			}
			else
			{
				this.collection = this.wizard.model.getAppliedTransactions(this.transaction_type === 'credit' ? 'credits' : 'deposits');
			}

			if (this.collection.length)
			{
				this._render();
			}
		}

		//@method getContext @return {PaymentWizard.Module.ShowCreditTransaction.Context}
	,	getContext: function ()
		{
			var total_field = this.transaction_type === 'credit' ? 'credits_total_formatted' : 'deposits_total_formatted'
			,	total_formatted =this.wizard.model.get('confirmation') ? this.wizard.model.get('confirmation')[total_field] : this.wizard.model.get(total_field)
			,	transactions_to_show = this.collection.map(function (transaction)
				{
					//@class PaymentWizard.Module.ShowCreditTransaction.TransactionObject
					return {
						//@property {String} type
						type: transaction.get('type')
						//@property {String} number
					,	number: transaction.get('tranid') || transaction.get('refnum')
						//@property {String} amountFormatted
					,	amountFormatted: transaction.get('amount_formatted')
						//@property {String} id
					,	id: transaction.get('internalid')
					};
				});

			//@class PaymentWizard.Module.ShowCreditTransaction.Context
			return {
				//@property {Boolean} isTransactionTypeCredit
				isTransactionTypeCredit: this.transaction_type === 'credit'
				//@property {String} totalFormatted
			,	totalFormatted: total_formatted
				//@property {Array<PaymentWizard.Module.ShowCreditTransaction.TransactionObject>} transactions
			,	transactions: transactions_to_show
				//@property {Boolean} showOpenedAccordion
			,	showOpenedAccordion:  _.isTabletDevice() || _.isDesktopDevice()
			};
		}
	});
});