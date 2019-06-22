/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart'
,	[
		'LiveOrder.Model'
	,	'Cart.Router'
	,	'SC.Configuration'
	,	'Cart.Confirmation.Helpers'

	,	'jQuery'
	]
,	function (
		LiveOrderModel
	,	CartRouter
	,	Configuration
	,	CartConfirmationHelpers

	,	jQuery
	)
{
	'use strict';

	/*
		@class Cart

		Defines the Cart module

		mountToApp() handles some environment issues

		@extends ApplicationModule
	*/
	return {

		mountToApp: function mountToApp (application)
		{
			this.cart_model = LiveOrderModel.getInstance();

			// Check if cart was bootstrapped
			if (!SC.ENVIRONMENT.CART_BOOTSTRAPED)
			{
				// Load the cart information
				LiveOrderModel.loadCart();
			}
			else if (SC.ENVIRONMENT.CART)
			{
				this.cart_model.set(SC.ENVIRONMENT.CART);

				this.cart_model.cartLoad = this.cart_model.cartLoad || jQuery.Deferred();

				this.cart_model.isLoading = false;

				this.cart_model.cartLoad.resolveWith(SC.ENVIRONMENT.CART);
			}

			var self = this;

			//IMPORTANT: This api/method is preserve ONLY for Bronto Integration. IT IS NOT A PUBLIC API!
			application.getCart = function getCart ()
			{
				console.warn('Using application.getCart is deprecated!');
				var cart_promise = jQuery.Deferred();

				LiveOrderModel.loadCart()
					.done(function ()
					{
						cart_promise.resolve(self.cart_model);
					})
					.fail(function ()
					{
						cart_promise.reject.apply(this, arguments);
					});

				return cart_promise;
			};

			application.getLayout().goToCart = function()
			{
				return CartConfirmationHelpers._goToCart(this.application.getCart());
			};

			application.getLayout().showMiniCart = function()
			{
				return CartConfirmationHelpers._showMiniCart(this.application.getCart(), null, this.application);
			}; 
			
			application.getLayout().showCartConfirmationModal = function()
			{
				return CartConfirmationHelpers._showCartConfirmationModal(this.application.getCart(), null, this.application);
			}; 

			// Initializes the router
			if (Configuration.get('modulesConfig.Cart.startRouter', true))
			{
				new CartRouter(application);
			}
		}
	};
});
