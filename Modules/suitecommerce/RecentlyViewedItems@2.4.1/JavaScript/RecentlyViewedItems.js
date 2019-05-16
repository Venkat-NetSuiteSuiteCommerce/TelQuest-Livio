/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RecentlyViewedItems
define('RecentlyViewedItems'
,	[	'RecentlyViewedItems.View'
	,	'Cart.Detailed.View'
	]
,	function (
		RecentlyViewedItemsView
	,	CartDetailedView
	)
{
	'use strict';

	return {
		//@method mountToApp
		//@param {ApplicationSkeleton} application
		//@return {Void}
		mountToApp: function (application)
		{
			CartDetailedView.addChildViews({
				'RecentlyViewed.Items': function wrapperFunction ()
				{
					return function ()
					{
						return new RecentlyViewedItemsView({
							application: application
						});
					};
				}
			});
		}
	};

});