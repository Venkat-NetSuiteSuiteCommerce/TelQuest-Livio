/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction
define('Transaction.Paymentmethod.Collection'
,	[	'Transaction.Paymentmethod.Model'

	,	'Backbone'
	]
,	function (
		TransactionPaymentmethodModel

	,	Backbone
	)
{
	'use strict';

	// @class Transaction.Paymentmethod.Collection Collection of possible payment method @extends Backbone.Collection
	return Backbone.Collection.extend({
		// @property {Transaction.Paymentmethod.Model} model
		model: TransactionPaymentmethodModel
	});
});
