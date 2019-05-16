/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReorderItems
define(
	'ReorderItems.Actions.AddToCart.View'
,	[	'reorder_items_actions_add_to_cart.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		reorder_items_actions_add_to_cart_tpl
	
	,	Backbone
	,	_
	)
{
	'use strict';
	//@class ReorderItems.Actions.AddToCart.View @extends Backbone.View
	return Backbone.View.extend({
	
		//@propery {Function} template
		template: reorder_items_actions_add_to_cart_tpl
		//@method initialize
	,	initialize: function (options)
		{
			this.line = options.model;
		}
		//@method getContext @returns ReorderItems.Actions.AddToCart.View.Context
	,	getContext: function()
		{
			var item = this.line.get('item')
			,	item_id = item.get('_id')
			,	parent_internalid = this.line.get('item').get('parent_internalid')
			,	format_options = _.map(this.line.get('options_object'), function (option)
				{
					return option.id + '=' + option.value;
				}).join(',');
			//@class ReorderItems.Actions.AddToCart.View.Context
			return {
					//@propery {ReorderItems.Model} line
					line: this.line
					//@propery {Boolean} disableButtonAddToCart
				,	disableButtonAddToCart: !item.get('_isPurchasable')
					//@propery {String} itemOptions
				,	itemOptions: format_options
					//@propery {String} lineId
				,	lineId: this.line.get('internalid')
					//@propery {String} itemId
				,	itemId: item_id
					//@propery {String} parentItemId
				,	parentItemId: parent_internalid
			};
		}

	});

});
