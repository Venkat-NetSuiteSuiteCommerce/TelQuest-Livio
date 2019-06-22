/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PrintStatement
define(
	'PrintStatement'
,	[	'PrintStatement.Router'

	,	'underscore'
	,	'Utils'
	]
,	function (
		PrintStatementRouter
	,	_
	)
{
	'use strict';
	//@class PrintStatement
	return	{
		//@property {Object} MenuItems
		MenuItems: {
			parent: 'billing'
		,	id: 'printstatement'
		,	name: _('Print a Statement').translate()
		,	url: 'printstatement'
		,	index: 4
		,	permission: 'transactions.tranStatement.2'
		}
		//@method mountToApp
	,	mountToApp: function (application)
		{
			return new PrintStatementRouter(application);
		}
	};
});
