/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('OrderHistory.Item.Actions.View'
,	[	'order_history_item_actions.tpl'

	,	'Backbone'
	,	'Utils'
	]
,	function (
		order_history_item_actions_tpl

	,	Backbone
	)
{
	'use strict';

	//@class OrderHistory.Item.Actions.View @extend Backbone.View
	return Backbone.View.extend({
		//@property {Function} template
		template: order_history_item_actions_tpl

		//@method getContext @return OrderHistory.Item.Actions.View.Context
	,	getContext: function ()
		{
			var line = this.model
			,	item = line.get('item');

			//@class OrderHistory.Item.Actions.View.Context
			return {
				//@property {Model} line
				line: line
				//@property {String} lineId
			,	lineId: line.get('internalid') || line.get('id') 
				//@property {Boolean} showActions
			,	showActions: !!line.get('item').get('_isPurchasable') && item.get('itemtype') !== 'GiftCert'
				//@property {String} itemURL
			,	itemURL: item.get('_url')
				//@property {String} itemSKU
			,	itemSKU: item.get('_sku')
				//@property {String} itemParentId
			,	itemParentId: item.get('parent_internalid')
				//@property {String} lineFormatOptions
			,	lineFormatOptions: line.format_options
				//@property {String} itemId
			,	itemId: item.get('_id')
				//@property {Boolean} isQuantityGreaterThan1
			,	isQuantityGreaterThan1: line.quantity > 1
			};
		}
	});

});