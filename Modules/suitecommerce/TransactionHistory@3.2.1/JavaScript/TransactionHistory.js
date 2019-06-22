/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module TransactionHistory Defines the TransactionHistory module (Model, Collection, Views, Router)
define('TransactionHistory'
,	[	'TransactionHistory.Router'

	,	'underscore'
	,	'Utils'
	]
,	function (
		Router

	,	_
	)
{
	'use strict';

	//@class TransactionHistory @extends ApplicationModule
	return	{
		MenuItems: {
			parent: 'billing'
		,	id: 'transactionhistory'
		,	name: _('Transaction History').translate()
		,	url: 'transactionhistory'
		,	permissionOperator: 'OR'
		,	permission: 'transactions.tranCustInvc.1, transactions.tranCustCred.1, transactions.tranCustPymt.1, transactions.tranCustDep.1, transactions.tranDepAppl.1'
		,	index: 3
		}

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
