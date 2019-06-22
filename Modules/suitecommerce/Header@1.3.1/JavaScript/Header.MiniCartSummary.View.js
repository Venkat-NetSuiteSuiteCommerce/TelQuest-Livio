/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Header
define(
	'Header.MiniCartSummary.View'
,	[
		'LiveOrder.Model'

	,	'header_mini_cart_summary.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		LiveOrderModel

	,	header_mini_cart_summary_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Header.MiniCartSummary.View @extends Backbone.View
	return Backbone.View.extend({

		template: header_mini_cart_summary_tpl

	,	initialize: function() {

			var self = this;

			this.itemsInCart = 0;
			this.showPluraLabel = true;
			this.isLoading = true;

			LiveOrderModel.loadCart().done(function()
			{
				var cart = LiveOrderModel.getInstance();
				self.itemsInCart = _.reduce(cart.get('lines').pluck('quantity'), function (memo, quantity) {
					return memo + (parseFloat(quantity) || 1);
				}, 0);

				self.showPluraLabel = self.itemsInCart !== 1;
				self.isLoading = false;
				self.render();

				cart.on('change', function ()
				{
					self.render();
				});
			});

			this.on('afterViewRender', function()
			{
				self.isLoading && _.ellipsis('.header-mini-cart-summary-cart-ellipsis');
			});
		}

		// @method getContext @return {Header.MiniCart.View.Context}
	,	getContext: function()
		{
			// @class Header.MiniCartSummary.View.Context
			return {
				// @property {Number} itemsInCart
				itemsInCart: this.itemsInCart
				// @property {Boolean} showPluraLabel
			,	showPluraLabel: this.showPluraLabel
				// @property {Boolean} isLoading
			,	isLoading: this.isLoading
			};
		}
	});

});