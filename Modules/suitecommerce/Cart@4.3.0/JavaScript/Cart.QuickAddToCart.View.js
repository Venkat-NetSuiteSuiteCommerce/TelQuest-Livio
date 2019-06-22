/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart.QuickAddToCart.View'
,	[
		'SC.Configuration'
	,	'LiveOrder.Model'
	,	'Backbone.CompositeView'
	,	'Cart.AddToCart.Button.View'
	,	'ProductViews.Price.View'

	,	'cart_quickaddtocart.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		Configuration
	,	LiveOrderModel
	,	BackboneCompositeView
	,	CartAddToCartButtonView
	,	ProductViewsPriceView

	,	cart_quickaddtocart_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Cart.QuickAddToCart.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: cart_quickaddtocart_tpl

	,	events: {
			'blur [data-action="setquantity"]': 'updateQuantity'
		}

		//@method initialize Override default method to define state properties and attach to model's change event
		//@param {Cart.QuickAddToCart.View.Initialize.Options} options
		//@return {Void}
	,	initialize: function initialize ()
		{
			BackboneCompositeView.add(this);

			this.cart = LiveOrderModel.getInstance();
	
			//@property {Boolean} showQuickAddToCartButton Indicate if the current model is valid to be added form the facet list and if the configuration to show this button is enabled
			this.showQuickAddToCartButton = !!(Configuration.get('addToCartFromFacetsView', false) &&
								this.model.getItem().get('_isPurchasable') &&
								this.model.areAttributesValid(['options']));
		}

		//@method getMinimumQuantity Returns the minimum quantity taking into account how many item are in the cart
		//@return {Number}
	,	getMinimumQuantity: function getMinimumQuantity ()
		{
			return !this.cart.findLine(this.model) ? this.model.getItem().get('_minimumQuantity') : 1;
		}

		//@method updateQuantity Set the quantity into the current line
		//@param {jQuery.Event} e
		//@return {Void}
	,	updateQuantity: function updateQuantity (e)
		{
			var new_quantity = parseInt(this.$(e.target).val(), 10)
			,	minimumQuantity = this.getMinimumQuantity();

			if (_.isNaN(new_quantity) || !_.isNumber(new_quantity) || new_quantity < minimumQuantity)
			{
				new_quantity = minimumQuantity;
			}

			this.model.set('quantity', new_quantity);
			this.render();
		}

	,	childViews: {
			'AddToCart': function ()
			{
				return new CartAddToCartButtonView({
					model: this.model
				,	application: this.options.application
				});
			}
		,	'ProductViewsPrice.Price': function ()
			{
				return new ProductViewsPriceView({
					model: this.model
				,	origin: 'ITEMCELL'
				});
			}
		}
		
		//@method getContext
		//@return {Cart.QuickAddToCart.View.Context}
	,	getContext: function getContext ()
		{
			var item_model = this.model.get('item');

			//@class Cart.QuickAddToCart.View.Context
			return {
				// @property {String} itemId
				itemId: item_model.get('_id')
				// @property {Boolean} showQuickAddToCartButton
			,	showQuickAddToCartButton: this.showQuickAddToCartButton
				// @property {Number} minimumQuantity
			,	minimumQuantity: this.getMinimumQuantity()
				// @property {Number} quantity
			,	quantity: this.model.get('quantity')
			};
			//@class Cart.QuickAddToCart.View
		}
	});

});

//@class Cart.QuickAddToCart.View.Initialize.Options
//@property {Product.Model} model