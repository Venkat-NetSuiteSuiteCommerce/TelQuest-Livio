/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Invoice
define('Invoice.Router'
,	[	'Invoice.Collection'
	,	'Invoice.Model'
	,	'Invoice.OpenList.View'
	,	'Invoice.PaidList.View'
	,	'Invoice.Details.View'
	,	'AjaxRequestsKiller'

	,	'Backbone'
	]
,	function (
		Collection
	,	InvoiceModel
	,	OpenListView
	,	PaidListView
	,	DetailsView
	,	AjaxRequestsKiller

	,	Backbone
	)
{
	'use strict';
	//@class Invoice.Router Router for handling Invoices views @extends Backbone.Router
	return Backbone.Router.extend({
		//@property {Object} routes
		routes: {
			'invoices': 'showOpenInvoicesList'
		,	'invoices?*options': 'showOpenInvoicesList'
		,	'paid-invoices': 'showPaidInvoicesList'
		,	'paid-invoices?*options': 'showPaidInvoicesList'
		,	'invoices/:id': 'showInvoice'
		,	'invoices/:id/:referrer': 'showInvoice'
		}
		//@method initialize
	,	initialize: function (application)
		{
			this.application = application;
		}
		//@method showOpenInvoicesList
	,	showOpenInvoicesList: function ()
		{
			var collection = new Collection()
			,	view = new OpenListView({
					application: this.application
				,	collection: collection
				});

			collection
				.on('sync', view.showContent, view)
				.fetch({
					data: {
						status: 'open'
					,	page: 'all'
					}
				,	killerId: AjaxRequestsKiller.getKillerId()
				});
		}
		//@method showPaidInvoicesList
	,	showPaidInvoicesList: function ()
		{
			var collection = new Collection()
			,	view = new PaidListView({
					application: this.application
				,	collection: collection
				});

			collection
				.on('sync', view.showContent, view)
				.fetch({
					data: {
						status: 'paid'
					,	page: 'all'
					}
				,	killerId: AjaxRequestsKiller.getKillerId()
				});
		}
		//@method showInvoice
	,	showInvoice: function (invoice_id, referrer)
		{
			var invoice = new InvoiceModel({internalid: invoice_id})
			,	view = new DetailsView({
					application: this.application
				,	model: invoice
				,	referrer: referrer
				});

			invoice
				.on('change', view.showContent, view)
				.fetch({
					killerId: AjaxRequestsKiller.getKillerId()
				});
		}
	});
});
