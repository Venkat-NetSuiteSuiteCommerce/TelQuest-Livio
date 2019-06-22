/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart.Item.Summary.View'
,	[	'Cart.Promocode.List.Item.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Profile.Model'

	,	'cart_item_summary.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		CartPromocodeListItemView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	ProfileModel

	,	cart_item_summary_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Cart.Item.Summary.View @extend Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: cart_item_summary_tpl

		//@method initialize Defines this view as composite
   		//@return {Void}
	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

		// @property {Object} events
	,	events:{
			'click [data-action="plus"]': 'addQuantity'
		,	'click [data-action="minus"]': 'subQuantity'
		}

		// @method addQuantity Add 1 to the quantity field
   		// @param {jQuery.Event} e
		// @return {Void}
	,	addQuantity: function (e)
		{
			e.preventDefault();
			
			var $element = this.$(e.target)
			,	quantity_input = $element.parent().find('input')
			,	old_value = quantity_input.val()
			,	new_val = parseFloat(old_value) + 1;
			
			quantity_input.val(new_val);
			quantity_input.change();
		}

		// @method subQuantity Subtract 1 from the quantity field
   		// @param {jQuery.Event} e
		// @return {Void}
	,	subQuantity: function (e)
		{
			e.preventDefault();
			
			var $element = this.$(e.target)
			,	quantity_input = $element.parent().find('input')
			,	old_value = quantity_input.val()
			,	new_val = parseFloat(old_value) - 1;
			
			new_val = Math.max(this.model.get('item').get('_minimumQuantity', true), new_val);

			quantity_input.val(new_val);
			quantity_input.change();
		}
	,	childViews: {
			'PromocodeList': function ()
			{
				if(!!this.model.get('discounts_impact')){
					
					var discounts = _.filter(this.model.get('discounts_impact').discounts, function(discount){ return !!discount.promotion_couponcode; });
					
					return new BackboneCollectionView({
						collection: discounts
					,	viewsPerRow: 1
					,	childView: CartPromocodeListItemView
					,	childViewOptions: {
							isReadOnly: true
						,	source: 'item_summary'
						}
					});
				}
			}
		}

		// @method getContext
		// @return {Cart.Item.Summary.View.Context}
	,	getContext: function ()
		{
			var minimum_quantity = this.model.get('item').get('_minimumQuantity', true) || 1;

			//@class Cart.Item.Summary.View.Context
			return {
				//@property {Model} line
				line: this.model
				//@property {String} lineId
			,	lineId: this.model.get('internalid')
				//@property {Boolean} isMinusButtonDisabled
			,	isMinusButtonDisabled: this.model.get('item').get('quantity') <= this.model.get('item').get('_minimumQuantity', true) || this.model.get('item').get('quantity') === 1
				//@property {Boolean} showQuantity
			,	showQuantity: this.model.get('item').get('_itemType') === 'GiftCert'
				//@property {Boolean} showComparePrice
			,	showComparePrice: this.model.get('amount') > this.model.get('total')
				//@property {Boolean} showMinimumQuantity
			,	showMinimumQuantity: minimum_quantity > 1
				//@property {Integer} minimumQuantity
			,	minimumQuantity: minimum_quantity
				// @property {Boolean} isPriceEnabled
			,	isPriceEnabled: !ProfileModel.getInstance().hidePrices()
			};
			//@class Cart.Item.Summary.View
		}
	});
});
