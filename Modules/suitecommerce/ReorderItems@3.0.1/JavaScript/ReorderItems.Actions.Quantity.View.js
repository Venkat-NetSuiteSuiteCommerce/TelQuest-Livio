/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReorderItems
define(
	'ReorderItems.Actions.Quantity.View'
,	[	'reorder_items_actions_quantity.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'jQuery'
	]
,	function (
		reorder_items_actions_quantity_tpl

	,	Backbone
	,	BackboneCompositeView
	,	jQuery
	)
{
	'use strict';
	//@class ReorderItems.Actions.Quantity.View @extends Backbone.View
	return Backbone.View.extend({

		//@propery {Function} template
		template: reorder_items_actions_quantity_tpl

		//@method initialize
	,	initialize: function (options)
		{
			this.line = options.model;

			BackboneCompositeView.add(this);
		}

	,	events:{
			'click [data-action="plus"]': 'addQuantity'
		,	'click [data-action="minus"]': 'subQuantity'
		}

	,	addQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseFloat(oldValue) + 1;

			$element.parent().find('input').val(newVal);
		}

	,	subQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseFloat(oldValue) - 1;

			newVal = Math.max(1,newVal);

			$element.parent().find('input').val(newVal);
		}


		//@method getContext @returns ReorderItems.Actions.Quantity.View.Context
	,	getContext: function()
		{
			var item = this.line.get('item')
			,	minimum_quantity = item.get('_minimumQuantity', true) || 1
			,	itemQuantity = this.line.get('quantity') > minimum_quantity ? this.line.get('quantity') : minimum_quantity;

			//@class ReorderItems.Actions.Quantity.View.Context
			return {
					//@propery {ReorderItems.Model} line
					line: this.line
					//@propery {Boolean} showQuantityInput
				,	showQuantityInput: !!item.get('_isPurchasable')
					//@propery {String} lineId
				,	lineId: this.line.get('internalid')
					//@propery {Number} itemQuantity
				,	itemQuantity: itemQuantity
					//@propery {Boolean} showLastPurchased
				,	showLastPurchased: !!this.line.get('trandate')
					//@property {Boolean} showMinimumQuantity
				,	showMinimumQuantity: minimum_quantity > 1
					//@property {Integer} minimumQuantity
				,	minimumQuantity: minimum_quantity
			};
		}
	});
});