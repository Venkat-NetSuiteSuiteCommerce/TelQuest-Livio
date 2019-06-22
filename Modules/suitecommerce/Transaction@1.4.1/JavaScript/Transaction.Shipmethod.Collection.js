/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction
define('Transaction.Shipmethod.Collection'
,	[	'Transaction.Shipmethod.Model'

	,	'Backbone'
	]
,	function (
		TransactionShipmethodModel

	,	Backbone
	)
{
	'use strict';

	// @class OrderShipmethod.Collection Shipping methods collection @extends Backbone.Collection
	return Backbone.Collection.extend({
		// @property {Transaction.Shipmethod.Model} model
		model: TransactionShipmethodModel

		// @property {String} comparator
	,	comparator: 'name'
	});
});