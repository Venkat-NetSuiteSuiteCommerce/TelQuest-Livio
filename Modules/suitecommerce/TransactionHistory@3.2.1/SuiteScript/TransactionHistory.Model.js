/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// TransactionHistory.Model.js
// ----------------
//
define(
	'TransactionHistory.Model'
,	[
		'SC.Model'
	,	'Application'
	,	'Utils'
	,	'Transaction.Model'
	]
,	function (
		SCModel
	,	Application
	,	Utils
	,	Transaction
	)
{
	'use strict';

	return Transaction.extend({
		setExtraListFilters: function ()
		{	

			this.filters.types_operator = 'and';
			this.filters.types = ['type', 'anyof',  this.data.filter.split(',')];

		}
	});
});