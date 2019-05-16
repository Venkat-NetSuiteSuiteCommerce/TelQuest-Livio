/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditMemo
define(
	'CreditMemo.Model'
,	[
		'underscore'
	,	'Transaction.Model'
	,	'Utils'
	]
,	function (
		_
	,	TransactionModel
	)
{
	'use strict';

	//@class CreditMemo.Model stores the data of a credit memo and validates it @extends Backbone.Model
	return TransactionModel.extend({

		//@property {String} internalid
		//@property {String} tranid
		//@property {Number} subtotal
		//@property {String} subtotal_formatted
		//@property {Number} discount
		//@property {String} discount_formatted
		//@property {Number} taxtotal
		//@property {String} taxtotal_formatted
		//@property {Number} shippingcost
		//@property {String} shippingcost_formatted
		//@property {Number} total
		//@property {String} total_formatted
		//@property {Number} amountpaid
		//@property {String} amountpaid_formatted
		//@property {Number} amountremaining
		//@property {String} amountremaining_formatted
		//@property {String} trandate
		//@property {String} status		
		//@property {String} memo
		//@property {Array<CreditMemo.Model.Invoice>} invoices
			//@class CreditMemo.Model.Invoice
				//@property {String} internalid
				//@property {String} type
				//@property {Number} total
				//@property {String} total_formatted
				//@property {Boolean} apply
				//@property {String} applydate
				//@property {Number} currency					
				//@property {Number} amount
				//@property {String} amount_formatted
				//@property {Boolean} due
				//@property {String} due_formatted
				//@property {String} refnum
			//@class CreditMemo.Model
		//@property {Array<CreditMemo.Model.Line>} lines
			//@class CreditMemo.Model.Line
				//@property {Number} quantity
				//@property {Array<CreditMemo.Model.Line.Option>} options
					//@class CreditMemo.Model.Line.Option
						//@property {String} id
						//@property {String} name
						//@property {String} value
						//@property {String} displayvalue
						//@property {String} mandatory
					//@class CreditMemo.Model
				//@property {String} item
				//@property {String} type
				//@property {Number} amount
				//@property {Number} amount_formatted
				//@property {Number} rate
				//@property {Number} rate_formatted
			//@class CreditMemo.Model

		//@property {String} urlRoot
		urlRoot: 'services/CreditMemo.Service.ss'

	,	cacheSupport: true

	});
});
