/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Receipt.Router.js
// -----------------------
// Router for handling receipts
define('Receipt.Router'
,	[	'Receipt.Details.View'
	,	'AjaxRequestsKiller'
	,	'Receipt.Model'

	,	'Backbone'
	]
,	function (
		ReceiptDetailsView
	,	AjaxRequestsKiller
	,	Model

	,	Backbone
	)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'receiptshistory/view/:id': 'receiptDetails'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

		// view receipt's detail
	,	receiptDetails: function (id)
		{
			var model = new Model({ internalid: id })
			,	view = new ReceiptDetailsView({
					application: this.application
				,	id: id
				,	model: model
				});

			model
				.on('change', view.showContent, view)
				.fetch({
					data: {internalid: id, recordtype: 'cashsale' }
				,	killerId: AjaxRequestsKiller.getKillerId()
				});
		}
	});
});