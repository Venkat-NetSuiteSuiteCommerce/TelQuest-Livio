/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.Other.Payments.View'
,	[	'order_history_other_payments.tpl'
	,	'Transaction.Collection'

	,	'Backbone'
	,	'underscore'

	]
,	function (
		order_history_other_payments_tpl

	,	TransactionCollection
	,	Backbone
	,	_

	)
{
	'use strict';

	//@class OrderHistory.Other.Payments.View @extend Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: order_history_other_payments_tpl

	,	initialize: function(options)
		{
			this.creditMemos = options.credit_memos;
			this.depositApplications = options.deposit_applications;
			this.show_links = options.show_links;
		}

		//@method getContext @return OrderHistory.Other.Payments.Context
	,	getContext: function ()
		{
			return {
				
				creditMemos: this.creditMemos

			,	depositApplications: this.depositApplications

			,	showCreditMemos: this.creditMemos && this.creditMemos.length > 0

			,	showDepositApplications: this.depositApplications && this.depositApplications.length > 0

			,	showLinks : !this.show_links

			,	showPayments: _.some(this.creditMemos) || _.some(this.depositApplications)

			};
		}
	});

});