/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define(
	'Cart.AddToCart.Button.View'
,	[
		'LiveOrder.Model'
	,	'LiveOrder.Line.Model'
	,	'Cart.Confirmation.Helpers'

	,	'cart_add_to_cart_button.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		LiveOrderModel
	,	LiveOrderLineModel
	,	CartConfirmationHelpers

	,	cart_add_to_cart_button_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Cart.AddToCart.Button.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: cart_add_to_cart_button_tpl

	,	events: {
			'click [data-type="add-to-cart"]': 'addToCart'
		}

		//@method initialize
		//@param {ProductDeatils.AddToCart.ViewCart.AddToCart.Button.View.Initialize.Options} options
		//@return {Void}
	,	initialize: function initialize ()
		{
			Backbone.View.prototype.initialize.apply(this, arguments);

			this.cart = LiveOrderModel.getInstance();

			this.model.on('change', this.render, this);
		}

		//@method destroy Override default method to detach from change event of the current model
		//@return {Void}
	,	destroy: function destroy ()
		{
			Backbone.View.prototype.destroy.apply(this, arguments);

			this.model.off('change', this.render, this);
		}

		//@method getAddToCartValidators Returns the extra validation to add a product into the cart
		//@return {BackboneValidationObject}
	,	getAddToCartValidators: function getAddToCartValidators ()
		{
			var self = this;

			return {
				quantity: {
					fn : function ()
					{
						var line_on_cart = self.cart.findLine(self.model)
						,	quantity = self.model.get('quantity')
						,	minimum_quantity = self.model.getItem().get('_minimumQuantity') || 1;

						if (!_.isNumber(quantity) || _.isNaN(quantity) || quantity < 1)
						{
							return _.translate('Invalid quantity value');
						}
						else if (!line_on_cart && quantity < minimum_quantity)
						{
							return _.translate('Please add $(0) or more of this item', minimum_quantity);
						}
					}
				}
			};
		}

		//@method submitHandler Public method that fulfill the require interface of the Main action View of the PDP
		//@param {jQuery.Event} e
		//@return {Boolean}
	,	submitHandler: function submitHandler (e)
		{
			return this.addToCart(e);
		}

		// @method addToCart Updates the Cart to include the current model
		// also takes care of updating the cart if the current model is already in the cart
		// @param {jQuery.Event} e
		// @return {Boolean}
	,	addToCart: function addToCart (e)
		{
			e.preventDefault();

			var self = this
			,	cart_promise;

			if (!this.model.areAttributesValid(['options','quantity'], self.getAddToCartValidators()))
			{
				return;
			}

			if (!this.model.isNew() && this.model.get('source') === 'cart')
			{
 				cart_promise = this.cart.updateProduct(this.model);
 				cart_promise.done(function ()
 				{
 					self.options.application.getLayout().closeModal();
 				});
			}
			else
			{
				var line = LiveOrderLineModel.createFromProduct(this.model);
				cart_promise = this.cart.addLine(line);
				CartConfirmationHelpers.showCartConfirmation(cart_promise, line, self.options.application);
			}

			cart_promise.fail(function (jqXhr)
			{
				var error_details = null;
				try
				{
					var response = JSON.parse(jqXhr.responseText);
					error_details = response.errorDetails;
				}
				finally
				{
					if (error_details && error_details.status === 'LINE_ROLLBACK')
					{
						self.model.set('internalid', error_details.newLineId);
					}
				}

			});

			this.disableElementsOnPromise(cart_promise, e.target);
			return false;
		}

		//@method getContext
		//@return {Cart.AddToCart.Button.View.Context}
	,	getContext: function getContext ()
		{
			//@class Cart.AddToCart.Button.View.Context
			return {
				//@property {Boolean} isCurrentItemPurchasable Indicate if the current item is valid to be purchase or not
				isCurrentItemPurchasable: this.model.getItem().get('_isPurchasable')
				//@property {Boolean} isUpdate
			,	isUpdate: !this.model.isNew() && this.model.get('source') === 'cart'
			};
			//@class Cart.AddToCart.Button.View
		}
	});
});

//@class Cart.AddToCart.Button.View.Initialize.Options
//@property {Product.Model} model This view is only capable of adding new PRODUCTs into the cart.
//If you need to add something else please convert it into a Product.Model.
//
