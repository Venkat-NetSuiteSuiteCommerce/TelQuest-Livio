/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CustomerPayment
define('CustomerPayment.Model'
,	[	
		'Transaction.Model'
	]
,	function (
		TransactionModel
	)
{
	'use strict';

	//@class CustomerPayment.Model @extend Backbone.Model
	return TransactionModel.extend({
			
		//@property {String} urlRoot
		urlRoot: 'services/CustomerPayment.Service.ss'

	,	cacheSupport: true
	});
});
