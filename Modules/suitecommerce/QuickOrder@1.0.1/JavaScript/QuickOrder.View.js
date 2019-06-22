/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuickOrder
define(
	'QuickOrder.View'
,	[
		'QuickAdd.View'
	,	'Backbone.CompositeView'
	,	'LiveOrder.Model'

	,	'quick_order.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		QuickAddView
	,	BackboneCompositeView
	,	LiveOrderModel

	,	quick_order_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class QuickOrder.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: quick_order_tpl

		// @method initialize Overrides default method to convert current view in to composite
		// @return {Void}
	,	initialize: function ()
		{
			BackboneCompositeView.add(this);

			this.cart = LiveOrderModel.getInstance();

			this.quickAddViewComponent = new QuickAddView({
				getItemQuantitySet: _.bind(this.getItemQuantitySet, this),
				showBackorderable: false
			});
			this.quickAddViewComponent.on('selectedLine', this.addNewLine, this);
		}

		//@method getItemQuantitySet Auxiliary method used to provide the amount of already added items into the transaction to the quick add component
		//@param {Number} item_id
		//@return {Number}
	,	getItemQuantitySet: function (item_id)
		{
			var selected_line = this.cart.get('lines').find(function (line)
				{
					return line.get('item').id === item_id;
				});

			return selected_line ? parseInt(selected_line.get('quantity'), 10) : 0;
		}

		//@method addNewLine
		//@param {QuickAdd.View.SelectedLine.Properties} options
		//@return {Void}
	,	addNewLine: function (options)
		{
			this.cart.addLine(options.selectedLine);
		}

		// @property {ChildViews} childViews
	,	childViews: {
			'QuickAddView': function ()
			{
				return this.quickAddViewComponent;
			}
		}
		//@method destroy Override default implementation to clean up all attached events of the initialize
		//@return {Void}
	,	destroy: function ()
		{
			this.quickAddViewComponent.off('selectedLine');
			this._destroy();
		}

		// @method getContext 
		// @return {QuickOrder.View.Context}
	,	getContext: function()
		{
			// @class QuickOrder.View.Context
			return {
				// @property {Boolean} showOpenedAccordion
				showOpenedAccordion: !!this.options.openQuickOrder
			};
			//@class QuickOrder.View
		}
	});
});