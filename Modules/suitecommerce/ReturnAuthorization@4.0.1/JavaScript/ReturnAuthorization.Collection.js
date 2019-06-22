/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ReturnAuthorization
define('ReturnAuthorization.Collection'
,	[	'ReturnAuthorization.Model'
	,	'underscore'
	,	'Transaction.Collection'
	,	'Utils'
	]
,	function (
		Model
	,	_
	,	TransactionCollection
	)
{
	'use strict';

	//@class ReturnAuthorization.Collection @extend Transaction.Collection
	return TransactionCollection.extend({

		model: Model
		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: true

	,	url: 'services/ReturnAuthorization.Service.ss'
	});
});