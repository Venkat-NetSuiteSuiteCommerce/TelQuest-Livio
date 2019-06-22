/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module PickupInStore
define('PickupInStore.AddToCart.Button'
,	[
	   'Cart.AddToCart.Button.View'
	,  'SC.Configuration'
	]
,	function (
		CartAddToCartButtonView
	,   Configuration
	)
{
	'use strict';

	if (Configuration.get('siteSettings.isPickupInStoreEnabled'))
	{
		var original_add_to_cart_fn = CartAddToCartButtonView.prototype.addToCart;

		CartAddToCartButtonView.prototype.addToCart = function ()
		{
			if (!this.model.getItem().get('_isstorepickupallowed') && this.model.get('fulfillmentChoice') === 'pickup')
			{
				this.model.set('fulfillmentChoice', 'ship');
			}

			return original_add_to_cart_fn.apply(this, arguments);
		};
	}
});
