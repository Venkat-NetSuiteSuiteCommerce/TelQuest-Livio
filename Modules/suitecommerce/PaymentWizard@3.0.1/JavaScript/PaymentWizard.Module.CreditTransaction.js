/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(
	'PaymentWizard.Module.CreditTransaction'
,	[	'Wizard.Module'
	,	'PaymentWizard.EditAmount.View'
	,	'SC.Configuration'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'RecordViews.SelectableActionable.View'
	,	'PaymentWizard.Module.CreditTransaction.Edit.Action.View'

	,	'payment_wizard_credit_transaction_module.tpl'

	,	'jQuery'
	,	'Backbone'
	,	'underscore'
	,	'LivePayment.Model'
	]
,	function (
		WizardModule
	,	EditAmountView
	,	Configuration
	,	BackboneCollectionView
	,	BackboneCompositeView
	,	RecordViewsSelectableActionableView
	,	PaymentWizardModuleCreditTransactionEditActionView

	,	payment_wizard_credit_transaction_module_tpl

	,	jQuery
	,	Backbone
	,	_
	,	LivePaymentModel
	)
{
	'use strict';

	//@class PaymentWizard.Module.CreditTransaction @extend Wizard.Module
	return WizardModule.extend({

		template: payment_wizard_credit_transaction_module_tpl

	,	className: 'PaymentWizard.Module.CreditTransaction'

	,	events: {
			'click [data-action="transaction"]': 'toggleTransactionHandler'
		,	'click [data-action="edit"]': 'editTransaction'
		}

	,	initialize: function (options)
		{
			this.transaction_type = options.transaction_type;
			this.wizard = options.wizard;
			this.livePaymentModel = LivePaymentModel.getInstance();
			this.application = this.wizard.application;
			this.addEventListeners();

			BackboneCompositeView.add(this);
		}

	,	isActive: function()
		{
			var has_elements = !!this.wizard.model.get(this.transaction_type === 'credit' ? 'credits' : 'deposits').length;

			if (this.transaction_type === 'deposit')
			{
				return has_elements && SC.ENVIRONMENT.permissions.transactions.tranDepAppl >= 2;
			}

			return has_elements;
		}

	,	render: function ()
		{
			this.collection = this.wizard.model.get(this.transaction_type === 'credit' ? 'credits' : 'deposits');
			this._render();
		}

	,	addEventListeners: function ()
		{
			var self = this;

			this.wizard.model.on('change:credits_total', function ()
				{
					self.render();
				});
			this.wizard.model.on('change:deposits_total', function ()
				{
					self.render();
				});
		}

	,	toggleTransactionHandler: function (e)
		{
			var $target = jQuery(e.currentTarget);

			if ($target.hasClass('disabled'))
			{
				return;
			}
			this.toggleTransaction($target.closest('[data-action="transaction"]').data('id'));
		}

	,	toggleTransaction: function (transaction_id)
		{
			var transaction = this.collection.get(transaction_id);

			if (transaction)
			{
				this[transaction.get('apply') ? 'unselectTransaction' : 'selectTransaction'](transaction);
				this.render();
			}
		}

	,	selectTransaction: function (transaction)
		{
			if (transaction)
			{
				transaction.set('checked', true);
			}

			if (this.transaction_type === 'credit')
			{
				return this.livePaymentModel.selectCredit(transaction.id);
			}
			else
			{
				return this.livePaymentModel.selectDeposit(transaction.id);
			}

		}

	,	unselectTransaction: function (transaction)
		{
			if (transaction)
			{
				transaction.set('checked', false);
			}

			if (this.transaction_type === 'credit')
			{
				return this.livePaymentModel.unselectCredit(transaction.id);
			}
			else
			{
				return this.livePaymentModel.unselectDeposit(transaction.id);
			}
		}

	,	editTransaction: function (e)
		{
			var transaction_id = jQuery(e.target).parents('[data-action="transaction"]').data('id')
			,	transaction = this.collection.get(transaction_id);

			e.preventDefault();
			e.stopPropagation();

			this.application.getLayout().showInModal(
				new EditAmountView({
					application: this.application
				,	parentView: this
				,	model: transaction
				,	type: this.transaction_type
				,	selectedInvoicesLength: this.wizard.model.getSelectedInvoices().length
				,	invoicesTotal: this.wizard.model.get('invoices_total')
				})
			,	{application: this.application}
			);
		}

	,	childViews: {
			'Transaction.Collection': function ()
			{
				var positive_total = this.wizard.model.calculeTotal(true) > 0;

				var transactions_to_show = this.collection.map(function (transaction)
				{
					var is_checked = transaction.get('apply');

					return new Backbone.Model({
						internalid: transaction.id
					,	check: is_checked
					,	active: is_checked || positive_total
					,	navigable: false

					,	url: ''
					,	title: (transaction.get('type') || '') + '#' + transaction.get('refnum')

					,	actionType: 'transaction'

					,	columns: [
							{
								label: _('Original Amount:').translate()
							,	type: 'currency'
							,	name: 'original-amount'
							,	value: (transaction.get('remaining_formatted') !== transaction.get('total_formatted')) ? transaction.get('total_formatted') : ' '
							}
						,	{
								label: _('Remaining Amount:').translate()
							,	type: 'currency'
							,	name: 'remaining-amount'
							,	value: transaction.get('remaining_formatted')
							}
						,	{
								label: _('Amount').translate()
							,	type: 'currency'
							,	name: 'amount'
							,	value: transaction.get('amount_formatted')
							}
						]
					});

				});

				return new BackboneCollectionView({
					childView: RecordViewsSelectableActionableView
				,	viewsPerRow: 1
				,	collection: transactions_to_show
				,	childViewOptions: {
						actionView: PaymentWizardModuleCreditTransactionEditActionView
					}
				});
			}
		}

		//@method getContext @return {PaymentWizard.Module.CreditTransaction.Context}
	,	getContext: function ()
		{
			//@class PaymentWizard.Module.CreditTransaction.Context
			return {
				//@property {String} accordionId
				accordionId: 'accordion-' + this.cid
				//@property {Boolean} isTransactionTypeCredit
			,	isTransactionTypeCredit: this.transaction_type === 'credit'
				//@property {Number} collectionLength
			,	collectionLength: this.collection.length
				//@property {Boolean} areElementsCollapsed
			,	areElementsCollapsed: !!Configuration.get('sca.collapseElements')
				//@property {String} totalFormatted
			,	totalFormatted: this.wizard.model.get(this.transaction_type === 'credit' ? 'credits_total_formatted' : 'deposits_total_formatted')
			};
		}
	});
});