/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module TransactionHistory
define('TransactionHistory.Router'
	,	[
			'TransactionHistory.Collection'
		,	'TransactionHistory.List.View'
		,	'Deposit.Model'
		,	'Deposit.Details.View'
		,	'DepositApplication.Model'
		,	'DepositApplication.Details.View'
		,	'CreditMemo.Model'
		,	'CreditMemo.Details.View'
		,	'CustomerPayment.Model'
		,	'CustomerPayment.Details.View'
		,	'Receipt.Model'
		,	'Receipt.Details.View'
		,	'Invoice.Model'
		,	'Invoice.Details.View'
		,	'AjaxRequestsKiller'

		,	'Backbone'
		,	'Utils'
		]
	,	function (
			Collection
		,	TransactionHistoryListView
		,	DepositModel
		,	DepositDetailsView
		,	DepositApplicationModel
		,	DepositApplicationDetailsView
		,	CreditMemoModel
		,	CreditMemoDetailsView
		,	CustomerPaymentModel
		,	CustomerPaymentDetailsView
		,	ReceiptModel
		,	ReceiptDetailsView
		,	InvoiceModel
		,	InvoiceDetailsView
		,	AjaxRequestsKiller

		,	Backbone
		,	Utils
		)
{

	'use strict';

	//@class TransactionHistory.Router @extend Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'transactionhistory': 'transactionHistory'
		,	'transactionhistory?:options': 'transactionHistory'
		,	'transactionhistory/creditmemo/:id': 'creditmemoDetails'
		,	'transactionhistory/depositapplication/:id': 'depositapplicationDetails'
		,	'transactionhistory/customerdeposit/:id': 'despositDetails'
		,	'transactionhistory/customerpayment/:id': 'customerPaymentDetails'
		,	'transactionhistory/cashsale/:id': 'cashSaleDetails'
		,	'transactionhistory/invoices/:id': 'invoiceDetails'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

		// @method transactionHistory list transactions history @param {String} options
	,	transactionHistory: function (options)
		{
			options = (options) ? Utils.parseUrlOptions(options) : {page: 1};

			options.page = options.page || 1;

			var collection = new Collection()
			,	view = new TransactionHistoryListView({
					application: this.application
				,	collection: collection
				,	page: options.page
				});

			collection.on('reset', view.showContent, view);

			view.showContent();
		}

		// @method creditmemoDetails view credit memo detail @param {String} id
	,	creditmemoDetails: function (id)
		{
			var model = new CreditMemoModel({internalid: id})
			,	view = new CreditMemoDetailsView({
					application: this.application
				,	id: id
				,	model: model
				});

			model
				.on('change', view.showContent, view)
				.fetch({
					killerId: AjaxRequestsKiller.getKillerId()
				});
		}

		// @method customerPaymentDetails shows deposit application detail @param {String} id
	,	customerPaymentDetails: function (id)
		{
			var model = new CustomerPaymentModel({ internalid: id })
			,	view = new CustomerPaymentDetailsView({
					application: this.application
				,	id: id
				,	model: model
				});

			model
				.on('change', view.showContent, view)
				.fetch({
					killerId: AjaxRequestsKiller.getKillerId()
				});
		}

		// @method despositDetails view deposit detail @param {String} id
	,	despositDetails: function (id)
		{
			var model = new DepositModel({ internalid: id })
			,	view = new DepositDetailsView({
					application: this.application
				,	id: id
				,	model: model
				});

			model
				.on('change', view.showContent, view)
				.fetch({
					killerId: AjaxRequestsKiller.getKillerId()
				});
		}

		// @method depositapplicationDetails view deposit application detail @param {String} id
	,	depositapplicationDetails: function (id)
		{
			var model = new DepositApplicationModel({ internalid: id })
			,	view = new DepositApplicationDetailsView({
					application: this.application
				,	id: id
				,	model: model
				});

			model
				.on('change', view.showContent, view)
				.fetch({
					killerId: AjaxRequestsKiller.getKillerId()
				});
		}

	,	cashSaleDetails: function(id)
		{
			var model = new ReceiptModel({ internalid: id })
			,	view = new ReceiptDetailsView({
					application: this.application
				,	id: id
				,	model: model
				,	referrer: 'transactionhistory'
				});

			model
				.on('change', view.showContent, view)
				.fetch({
					data: {internalid: id, recordtype: 'cashsale' }
				,	killerId: AjaxRequestsKiller.getKillerId()
				});
		}

		//@method invoiceDetails
	,	invoiceDetails: function (id)
		{
			var invoice = new InvoiceModel({ internalid: id })
			,	view = new InvoiceDetailsView({
					application: this.application
				,	model: invoice
				,	referrer: 'transactionhistory'
				});

			invoice
				.on('change', view.showContent, view)
				.fetch({
					killerId: AjaxRequestsKiller.getKillerId()
				});
		}
	});
});
