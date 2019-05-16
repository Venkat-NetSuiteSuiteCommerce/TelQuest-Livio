/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Invoice
define('Invoice'
,	[	'Invoice.Router'

	,	'underscore'
	,	'Utils'
	]
,	function (
		InvoiceRouter

	,	_
	)
{
	'use strict';

	return	{

		MenuItems: {
			parent: 'billing'
		,	id: 'invoices'
		,	name: _('Invoices').translate()
		,	url: 'invoices'
		,	index: 2
		,	permission: 'transactions.tranCustInvc.1'
		}

	,	mountToApp: function (application)
		{
			return new InvoiceRouter(application);
		}
	};
});
