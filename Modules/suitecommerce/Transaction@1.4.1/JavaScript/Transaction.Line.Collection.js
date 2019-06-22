/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction
define('Transaction.Line.Collection'
,	[	'Transaction.Line.Model'

	,	'Backbone'
	]
,	function (
		TransactionLineModel

	,	Backbone
	)
{
	'use strict';

	// @class Transaction.Line.Collection Order Line collection @extends Backbone.Collection
	return Backbone.Collection.extend({
		// @property {Transaction.Line.Model} model
		model: TransactionLineModel
	});
});