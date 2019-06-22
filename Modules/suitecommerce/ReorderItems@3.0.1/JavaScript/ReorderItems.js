/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@Module ReorderItems
define('ReorderItems'
,	[	'ReorderItems.Router'
	,	'SC.Configuration'

	,	'underscore'
	,	'Utils'
	]
,	function (
		ReorderItemsRouter
	,	Configuration

	,	_
	)
{
	'use strict';

	return	{


		MenuItems: function () 
		{
			var isSCISIntegrationEnabled = Configuration.get('siteSettings.isSCISIntegrationEnabled', false);

			return {
				parent: 'orders'
			,	id: 'reorderitems'
			,	name: _('Reorder Items').translate()
			,	url: 'reorderItems'
			,	index: 4
			,	permission: isSCISIntegrationEnabled ? 'transactions.tranFind.1,transactions.tranPurchases.1' : 'transactions.tranFind.1,transactions.tranSalesOrd.1'
			};
		}

	,	mountToApp: function (application)
		{
			this.application = application;
			
			return new ReorderItemsRouter(application);
		}
	};
});