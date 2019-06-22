/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuickAdd
define('QuickAdd.Item.View'
,	[
		'ItemsSearcher.Item.View'

	,	'underscore'
	]
,	function (
		ItemsSearcherItemView

	,	_
	)
{
	'use strict';

	//@class QuickAdd.Item.View @extend ItemsSearcher.Item.View
	return ItemsSearcherItemView.extend({

		//@method getContext
		//@return {QuickAdd.Item.View.Context}
		getContext: function getContext ()
		{
			//@class QuickAdd.Item.View.Context @extend ItemsSearcher.Item.View.Context
			return _.extend(ItemsSearcherItemView.prototype.getContext.apply(this, arguments),
				this.options.areResults ?
				{
					//@property {ImageContainer} thumbnail
					thumbnail:this.model.getThumbnail()
				} :
				{});
		}
	});
});