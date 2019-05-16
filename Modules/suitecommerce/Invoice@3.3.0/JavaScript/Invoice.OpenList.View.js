/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Invoice
define(
	'Invoice.OpenList.View'
,	[
		'Invoice.Collection'
	,	'ListHeader.View'
	,	'LivePayment.Model'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Invoice.Date.View'
	,	'Handlebars'
	,	'SC.Configuration'

	,	'RecordViews.Selectable.View'

	,	'invoice_open_list.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'

	]
,	function (
		InvoiceCollection
	,	ListHeaderView
	,	LivePaymentModel
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	InvoiceDateView
	,	Handlebars
	,	Configuration

	,	RecordViewsSelectableView

	,	invoice_open_list_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// returns the amount of days based on milliseconds
	function getDays (milliseconds)
	{
		return milliseconds / 1000 / 60 / 60 / 24;
	}

	//@class Invoice.OpenList.View @extends Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: invoice_open_list_tpl

		//@property {String} title
	,	title: _('Invoices').translate()

		//@property {String} page_header
	,	page_header: _('Invoices').translate()

		//@property {Object} attributes
	,	attributes: {
			'class': 'Invoices'
		}

		//@property {Object} events
	,	events: {
			'click [data-action="select-invoice"]': 'toggleInvoiceHandler'
		}

		//@method initialize
	,	initialize: function initialize(options)
		{
			BackboneCompositeView.add(this);

			var self = this
			,	application = options.application;

			this.application = application;
			this.livePaymentModel = LivePaymentModel.getInstance();
			this.disableCheckField = 'disable_payment';

			// manges sorting and filtering of the collection
			this.listHeader = new ListHeaderView({
				view: this
			,	application: application
			,	collection: this.collection
			,	filters: this.filterOptions
			,	sorts: this.sortOptions
			,	selectable: true
			});

			//Initialize invoices list
			this.getInvoicesList();

			this.listHeader.getUnselectedLength = this.getUnselectedLength;
			this.listHeader.getCollectionLength = this.getCollectionLength;

			this.collection.on('sync reset', function ()
			{
				var collection = this;

				self.livePaymentModel.getSelectedInvoices().each(function (invoice)
				{
					collection.get(invoice).set('checked', true);
				});

				self.render();
			});

		}

		//@method getCollectionLength Returns the length of selectable invoices
	,	getCollectionLength: function ()
		{
			var self = this.view;

			return this.collection.filter(function (inv)
			{
				return !inv.get(self.disableCheckField);
			}).length;
		}

		//@method getUnselectedLength Returns the length of unselected invoices
	,	getUnselectedLength: function ()
		{
			var self = this.view;

			return this.collection.filter(function (record)
			{
				return !record.get(self.disableCheckField) && !record.get('checked');
			}).length;
		}

		//@method getSelectedInvoicesLength Returns the count of selected invoices (This method is used by the template)
	,	getSelectedInvoicesLength: function()
		{
			return this.collection.filter(function (invoice)
			{
				return invoice.get('checked');
			}).length;
		}

		//@method toggleInvoiceHandler Handle to used to change the status of an invoice
	,	toggleInvoiceHandler: function (e)
		{
			this.toggleInvoice(this.$(e.currentTarget).data('id'));
		}

		//@method toggleInvoice Change the state (selected/unselected) of the specified invoice Model
	,	toggleInvoice: function (invoice)
		{
			invoice = this.collection.get(invoice);

			if (invoice)
			{
				this[invoice.get('checked') ? 'unselectInvoice' : 'selectInvoice'](invoice);
				this.render();
			}
		}

		//@method getInvoicesList Return the list of invoices to be shown indicating if each invoice can or not be selected to make a payment
	,	getInvoicesList: function ()
		{
			var live_payment_invoices = this.livePaymentModel.get('invoices')
			,	self = this;

			this.collection.each(function (invoice)
			{
				var make_payment_invoice = live_payment_invoices.get(invoice.id);
				invoice.set(self.disableCheckField, !!(make_payment_invoice && make_payment_invoice.get('due') === 0));
			});

			return this.collection;
		}

		//@method selectInvoice select a specified invoice Model
	,	selectInvoice: function (invoice)
		{
			if (invoice)
			{
				invoice.set('checked', true);
			}

			return this.livePaymentModel.selectInvoice(invoice.id);
		}

		//@method unselectInvoice unselect a specified invoice Model
	,	unselectInvoice: function (invoice)
		{
			if (invoice)
			{
				invoice.set('checked', false);
			}

			return this.livePaymentModel.unselectInvoice(invoice.id);
		}

		//@method selectAll selects all invoices
	,	selectAll: function ()
		{
			var self = this
			,	has_changed = false;

			this.collection.each(function (invoice)
			{
				if (!invoice.get('checked') && !invoice.get(self.disableCheckField))
				{
					has_changed = true;
					// select the invoice
					self.selectInvoice(invoice, {
						silent: true
					});
				}
			});

			// The select all might've been called
			// on a collection that was already fully selected
			// so let's not due an painfull useless render, shall we?
			if (has_changed)
			{
				this.render();
			}
		}

		//@method unselectAll unselects all invoices
	,	unselectAll: function ()
		{
			var self = this
			,	has_changed = false;

			this.collection.each(function (invoice)
			{
				if (invoice.get('checked'))
				{
					has_changed = true;
					// unselects the invoice
					self.unselectInvoice(invoice, {
						silent: true
					});
				}
			});

			// The unselect all might've been called
			// on a collection that had none selected
			// so let's not due an painfull useless render, shall we?
			if (has_changed)
			{
				this.render();
			}
		}
		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'invoices';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: this.title
			,	href: '/paid-invoices'
			};
		}
		//@property {Array} filterOptions
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
		//@property {Array} sortOptions
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
				value: 'trandate'
			,	name: _('By Invoice Date').translate()
			,	sort: function ()
				{
					return this.models.sort(function (invoiceOne, invoiceTwo)
					{
						var milli_inv_one = invoiceOne.get('tranDateInMilliseconds') || 0
						,	milli_inv_two = invoiceTwo.get('tranDateInMilliseconds') || 0;

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
						return parseInt(invoice.get('tranid').split(/[^\(\)0-9]*/).join(''), 10);
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
						return invoice.get('amountremaining');
					});
				}
			}
		]
		//@property {Object} childViews
	,	childViews: {
				'ListHeader': function ()
				{
					return this.listHeader;
				}
			,	'Invoice.Results': function ()
				{
					var records_collection = new Backbone.Collection(this.collection.map(function (invoice)
					{
						var model = new Backbone.Model({
							touchpoint: 'customercenter'
						,	title: new Handlebars.SafeString(_('Invoice #<span class="tranid">$(0)</span>').translate(invoice.get('tranid')))
						,	url: 'invoices/' + invoice.get('internalid')
						,	actionType: 'select-invoice'

						,	active: true

						,	id: invoice.get('internalid')
						,	internalid: invoice.get('internalid')

						,	check: invoice.get('checked')
						,	navigable: true

						,	columns: [
								{
									label: _('Date:').translate()
								,	type: 'date'
								,	name: 'date'
								,	value: invoice.get('trandate')
								}
							,	{
									label: _('Due date:').translate()
								,	type: 'date'
								,	name: 'due-date'
								,	compositeKey: 'InvoiceDateView'
								,	composite: new InvoiceDateView({
										model: new Backbone.Model({
											isOverdue: invoice.get('isOverdue')
										,	dueDate: invoice.get('duedate')
										,	isPartiallyPaid: invoice.get('amount') - invoice.get('amountremaining')
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

						return model;
					}));

					return new BackboneCollectionView({
						childView: RecordViewsSelectableView
					,	collection: records_collection
					,	viewsPerRow: 1
					,	childViewOptions: {
							referrer: 'invoices'
						}
					});
				}

		}

		//@method getContext
		//@returns {Invoice.OpenList.View.Context}
	,	getContext: function ()
		{
			var invoices = this.getInvoicesList();
			//@class Invoice.OpenList.View.Context
			return {
					//@property {Invoice.Collection} invoices
					invoices: invoices
					//@property {Boolean} showInvoices
				,	showInvoices: !!invoices.length
					//@property {String} pageHeader
				,	pageHeader: this.page_header
					//@property {Boolean} showMakeAPaymentButton
				,	showMakeAPaymentButton: this.collection.length > 0
					//@property {Boolean} enableMakeAPaymentButton
				,	enableMakeAPaymentButton: this.getSelectedInvoicesLength() > 0
					//@property {Boolean} showBackToAccount
				,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}
	});
});
