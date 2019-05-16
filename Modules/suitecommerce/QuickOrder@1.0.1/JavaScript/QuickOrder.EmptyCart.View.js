/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuickOrder
define(
	'QuickOrder.EmptyCart.View'
,	[
		'quick_order_empty_cart.tpl'

	,	'Backbone'
	]
,	function (
		quick_order_empty_cart_tpl

	,	Backbone
	)
{
	'use strict';

	//@class QuickOrder.EmptyCart.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: quick_order_empty_cart_tpl

	});
});