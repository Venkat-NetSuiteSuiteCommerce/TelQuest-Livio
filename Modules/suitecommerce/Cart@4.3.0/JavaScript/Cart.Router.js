/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('Cart.Router'
,	[	'Cart.Detailed.View'
	,	'LiveOrder.Model'

	,	'Utils'
	,	'jQuery'
	,	'Backbone'
	]
,	function (
		CartDetailedView
	,	LiveOrderModel

	,	Utils
	,	jQuery
	,	Backbone
	)
{
	'use strict';

	// @class Cart.Router responsible to know render the cart when the user navigates to the cart url @extends Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'cart': 'showCart'
		,	'cart?*options': 'showCart'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

		// @method showCart handles the /cart path by showing the cart view.
	,	showCart: function (options)
		{
			var self = this
			,	cart = LiveOrderModel.getInstance()
			,	cart_promise = LiveOrderModel.loadCart()
			,	view = new CartDetailedView({
					model: cart
				,	application: self.application
				,	urlOptions: Utils.parseUrlOptions(options || '')
				});

			cart_promise.done(function ()
			{
				view.showContent();
			});

		}
	});
});
