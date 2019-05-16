/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module TransactionHistory
define('TransactionHistory.Collection'
,	[	'TransactionHistory.Model'
	,	'Transaction.Collection'
	]
,	function (
		Model
	,	TransactionCollection)
{
	'use strict';

	//@class TransactionHistory.Collection @extend Transaction.Collection
	return TransactionCollection.extend({

		model: Model

		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: false

	,	url: 'services/TransactionHistory.Service.ss'
	});
});