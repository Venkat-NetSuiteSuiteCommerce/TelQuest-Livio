// Cart.js
// --------------------
// Testing Cart module.
define(['Cart.Detailed.View'
	,	'Cart.Router'
	,	'UnitTestHelper'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		CartDetailedView
	,	CartRouter
	,	UnitTestHelper
	)
{
	'use strict';

	var	helper = new UnitTestHelper({
		applicationName: 'Cart.Router'
	});

	describe('Module: Cart.Router', function () {

		helper.testRoute(CartRouter, {
				instanceOf: CartDetailedView
			,	instanceName: 'Cart.Views.Detailed'
			,	navigateTo: '#cart'
		});

		helper.testRoute(CartRouter, {
				instanceOf: CartDetailedView
			,	instanceName: 'Cart.Views.Detailed'
			,	navigateTo: '#cart?test=1'
		});

		helper.testRoute(CartRouter, {
				instanceOf: CartDetailedView
			,	instanceName: 'Cart.Views.Detailed'
			,	navigateTo: '#cart&test=1'
		});
	});

});