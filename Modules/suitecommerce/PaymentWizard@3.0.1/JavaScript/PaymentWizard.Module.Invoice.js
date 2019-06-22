/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PaymentWizard
define(
	'PaymentWizard.Module.Invoice'
,	[	'Wizard.Module'
	,	'ListHeader.View'
	,	'Invoice.Collection'
	,	'PaymentWizard.EditAmount.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'RecordViews.SelectableActionable.View'
	,	'PaymentWizard.Module.Invoice.Subject.View'
	,	'PaymentWizard.Module.Invoice.Action.View'

	,	'payment_wizard_invoice_module.tpl'

	,	'underscore'
	,	'Backbone'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		WizardModule
	,	ListHeaderView
	,	InvoiceCollection
	,	PaymentWizardEditAmountView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	RecordViewsSelectableActionableView
	,	PaymentWizardModuleInvoiceSubjectView
	,	PaymentWizardModuleInvoiceActionView

	,	payment_wizard_invoice_module_tpl

	,	_
	,	Backbone
	,	jQuery)
{
	'use strict';

	// returns the amount of days based on milliseconds
	function getDays(milliseconds)
	{
		return milliseconds / 1000 / 60 / 60 / 24;
	}

	//@class PaymentWizard.Module.Invoice @extend Wizard.Module
	return WizardModule.extend({

		template: payment_wizard_invoice_module_tpl

	,	className: 'PaymentWizard.Module.Invoice'

	,	events: {
			'click [data-action="invoice"]': 'toggleInvoiceHandler'
		,	'click [data-action="edit"]': 'editInvoice'
		}

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.invoices = new InvoiceCollection();
			this.invoices.reset(this.wizard.model.get('invoices').models);

			// PaymentWizard.Module.Invoice.listHeader:
			// manges sorting and filtering of the collection
			this.listHeader = new ListHeaderView({
				view: this
			,	application: options.wizard.application
			,	collection: this.invoices
			,	filters: this.filterOptions
			,	sorts: this.sortOptions
			,	selectable: true
			});

			this.addEventListeners();

			BackboneCompositeView.add(this);
		}

	,	addEventListeners: function ()
		{
			var self = this;
			// Whenever the invoice collection changes, we re write
			// this.invoices.on('reset', jQuery.proxy(this, 'render'));
			this.invoices.on('reset', function ()
				{
					self.render();
				});

			// this.wizard.model.on('change:invoices_total', jQuery.proxy(this, 'render'));
			this.wizard.model.on('change:invoices_total', function ()
				{
					self.render();
				});

			this.wizard.model.on('change:invoices', function()
			{
				self.invoices.clearFilters();
				self.invoices.reset(self.wizard.model.get('invoices').models);
				self.invoices.original = self.invoices.clone();
			});
		}

		// the render is called whenever the invoice collection is resetd
		// to prevent multiple innecesary renders, we use this boolean flag
		// so the "real" render will only happen if the step is present
	,	present: function ()
		{
			this.renderable = true;
			this.listHeader.updateCollection();
		}

	,	render: function ()
		{
			if (this.renderable)
			{
				this._render();
			}
		}

		// Array of default filter options
		// filters always apply on the original collection
	,	filterOptions: [
			{
				value: 'overdue'
			,	name: _('Show Overdue').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || invoice.get('isOverdue');
					});
				}
			}
		,	{
				value: 'next7days'
			,	name: _('Show Due next 7 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 7;
					});
				}
			}
		,	{
				value: 'next30days'
			,	name: _('Show Due next 30 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 30;
					});
				}
			}
		,	{
				value: 'next60days'
			,	name: _('Show Due next 60 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 60;
					});
				}
			}
		,	{
				value: 'next90days'
			,	name: _('Show Due next 90 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 90;
					});
				}
			}
		,	{
				value: 'all'
			,	name: _('Show All').translate()
			,	selected: true
			,	filter: function ()
				{
					return this.original.models;
				}
			}
		]

		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'duedate'
			,	name: _('By Due Date').translate()
			,	selected: true
			,	sort: function ()
				{
					return this.models.sort(function (invoiceOne, invoiceTwo)
					{
						var milli_inv_one = invoiceOne.get('dueinmilliseconds') || 0
						,	milli_inv_two = invoiceTwo.get('dueinmilliseconds') || 0;

						if (milli_inv_one !== milli_inv_two)
						{
							return milli_inv_one < milli_inv_two ? -1 : 1;
						}

						return invoiceOne.get('tranid') < invoiceTwo.get('tranid') ? -1 : 1;
					});
				}
			}
		,	{
				value: 'invoicenumber'
			,	name: _('By Invoice Number').translate()
			,	sort: function ()
				{
					return this.sortBy(function (invoice)
					{
						return invoice.get('tranid');
					});
				}
			}
		,	{
				value: 'amountdue'
			,	name: _('By Amount Due').translate()
			,	sort: function ()
				{
					return this.sortBy(function (invoice)
					{
						return invoice.get('amount');
					});
				}
			}
		]

		// When an invoice is clicked, call toggleInvoice
	,	toggleInvoiceHandler: function (e)
		{
			var $target = jQuery(e.target);

			if ($target.hasClass('disabled'))
			{
				return;
			}

			if ($target.data('toggle') !== 'show-in-modal')
			{
				this.toggleInvoice($target.closest('[data-action="invoice"]').data('id'));
			}
		}

	,	toggleInvoice: function (invoice)
		{
			invoice = this.invoices.get(invoice);

			if (invoice)
			{
				// toggles the state of the invoice, by selecting or unselecting it
				this[invoice.get('apply') ? 'unselectInvoice' : 'selectInvoice'](invoice);
			}

			this.render();
		}
		// tries to select the invoice
	,	selectInvoice: function (invoice)
		{
			invoice.set('checked', true);
			this.wizard.model.selectInvoice(invoice);
		}

		// tries to unselect the invoice
	,	unselectInvoice: function (invoice)
		{
			invoice.set('checked', false);
			this.wizard.model.unselectInvoice(invoice);
		}

		// selects all invoices
	,	selectAll: function ()
		{
			var self = this
			,	has_changed = false;

			this.invoices.each(function (invoice)
			{
				if (!invoice.get('apply'))
				{
					has_changed = true;
					// select the invoice
					self.selectInvoice(invoice);
				}
			});
		}

		// unselects all invoices
	,	unselectAll: function ()
		{
			var self = this
			,	has_changed = false;

			this.invoices.each(function (invoice)
			{
				if (invoice.get('apply'))
				{
					has_changed = true;
					// unselects the invoice
					self.unselectInvoice(invoice);
				}
			});
		}

	,	editInvoice: function (e)
		{
			var $target = jQuery(e.target)
			,	$invoice = $target.closest('[data-action="invoice"]')
			,	$checkbox = $invoice.find('[data-action="select"]')
			,	invoice = this.invoices.get($checkbox.val());

			e.preventDefault();
			e.stopPropagation();

			this.wizard.application.getLayout().showInModal(
				new PaymentWizardEditAmountView({
					application: this.wizard.applicationx
				,	parentView: this
				,	model: invoice
				,	type: 'invoice'
				})
			,	{
					application: this.wizard.application
				}
			);
		}

		// whenever this module is in the past
	,	past: function ()
		{
			var wizard = this.wizard;
			// if the payment model doesn't has any invoice selected
			if (!wizard.model.getSelectedInvoices().length && !wizard.model.get('confirmation'))
			{
				// that is just wrong, get back to the first step son
				wizard.navigate('/'+ wizard.steps[wizard.stepsOrder[0]].stepGroup.url);
			}
		}

	,	childViews: {
			'ListHeader.View': function ()
			{
				return this.listHeader;
			}
		,	'Invoices.Collection': function ()
			{
				var invoices_to_show = this.invoices.map(function (invoice)
				{
					var invoice_number = invoice.get('tranid') || invoice.get('refnum')
					,	navigable = !!(invoice_number);

					return new Backbone.Model({
						internalid: invoice.id
					,	check: invoice.get('apply')
					,	active: invoice.get('due') !== 0
					,	navigable: navigable

					,	url: 'invoices/' + invoice.id
					,	title: navigable ?  _('Invoice #$(0)').translate(invoice_number) : _('Journal').translate()

					,	actionType: 'invoice'
					,	isPayFull: invoice.isPayFull()

					,	columns: [
							{
								label: _('Due date:').translate()
							,	type: 'date'
							,	name: 'original-amount'
							,	compositeKey: 'PaymentWizardModuleInvoiceSubjectView'
							,	composite: new PaymentWizardModuleInvoiceSubjectView({
									model: new Backbone.Model({
										isoverdue: invoice.get('isOverdue')
									,	duedate: invoice.get('duedate')
									,	discountapplies: invoice.get('discountapplies')
									,	isPayFull: invoice.isPayFull()
									,	discount_formatted: invoice.get('discount_formatted')
									,	discdate: invoice.get('discdate')
									,	ispaid: invoice.get('due') === 0
									})
								})
							}
						,	{
								label: _('Amount:').translate()
							,	type: 'currency'
							,	name: 'amount'
							,	value: invoice.get('amount_formatted')
							}
						]
					});
				});

				return new BackboneCollectionView({
					collection: invoices_to_show
				,	childView: RecordViewsSelectableActionableView
				,	viewsPerRow: 1
				,	childViewOptions: {
						actionView: PaymentWizardModuleInvoiceActionView
					}
				});
			}
		}

		//@method getContext @return {PaymentWizard.Module.Invoice.Context}
	,	getContext: function ()
		{
			//@class PaymentWizard.Module.Invoice.Context
			return {
				//@property {Boolean} isInvoiceLengthGreaterThan0
				isInvoiceLengthGreaterThan0: !!this.invoices.length
			};
		}
	});
});
