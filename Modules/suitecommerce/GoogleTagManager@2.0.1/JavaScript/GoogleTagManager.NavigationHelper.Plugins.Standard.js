/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module GoogleTagManager.NavigationHelper.Plugins.Standard
//It handle the mouseDown event only on the items link of the follow list: Search/Category, Recently viewed items and related/correlated items
define('GoogleTagManager.NavigationHelper.Plugins.Standard'
,	[	'Tracker'
	,	'jQuery'
	,	'Backbone'
	]
,	function (
		Tracker
	,	jQuery
	,	Backbone
	)
{
	'use strict';

	// @class GoogleTagManager.NavigationHelper.Plugins.Standard Contains the standard navigation helper behavior. @extends ApplicationModule
	var trackerPlugins = {

		//@method mouseDownNavigation Handle standard mouseDown event
		//@param {ApplicationSkeleton.Layout} layout General application layout
		//@param {jQuery.Event} e jQuery event
		//@return {jQuery.Event} e
		mouseDownNavigation: function (layout, e)
		{
			var $item = jQuery(e.currentTarget).closest('[itemprop="itemListElement"]');

			if ($item.length)
			{
				var category = $item.data('track-productlist-category');

				if (category)
				{
					var item = {
						category: category
					,	position: $item.data('track-productlist-position')
					,	list: $item.data('track-productlist-list')
					,	sku: $item.data('sku')
					,	itemId: $item.data('item-id')
					,	name: $item.find('[itemprop="name"]').text()
					};

					Tracker.getInstance().trackProductClick(new Backbone.Model(item));
				}
			}

			return e;
		}
	};

	return trackerPlugins;
});
