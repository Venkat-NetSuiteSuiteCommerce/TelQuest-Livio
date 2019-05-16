// Cart.js
// --------------------
// Testing Cart module.
define(['Cart', 'UnitTestHelper', 'jasmine2-typechecking-matchers'], function (Cart, UnitTestHelper)
{
	'use strict';

	var	helper = new UnitTestHelper({
			applicationName: 'Cart.Router'
		,	startApplication: true
		,	mountModules: [Cart]
	});

	describe('Module: Cart', function ()
	{
		it('layout.showMiniCart not to be undefined', function ()
		{
			var layout = helper.application.getLayout();
			expect(layout.showMiniCart).not.toBe(undefined);
		});

		it('layout.showMiniCart to be function', function ()
		{
			var layout = helper.application.getLayout();
			expect(layout.showMiniCart).toBeA(Function);
		});

		it('layout.showCartConfirmationModal not to be undefined', function ()
		{
			var layout = helper.application.getLayout();
			expect(layout.showCartConfirmationModal).not.toBe(undefined);
		});

		it('layout.showCartConfirmationModal to be function', function ()
		{
			var layout = helper.application.getLayout();
			expect(layout.showCartConfirmationModal).toBeA(Function);
		});

		it('layout.goToCart not to be undefined', function ()
		{
			var layout = helper.application.getLayout();
			expect(layout.goToCart).not.toBe(undefined);
		});

		it('layout.goToCart to be function', function ()
		{
			var layout = helper.application.getLayout();
			expect(layout.goToCart).toBeA(Function);
		});

		it('layout.goToCart() must navigate to the url "#cart"', function ()
		{
			var layout = helper.application.getLayout();

			try
			{
				Backbone.history.start();
			}
			catch (e)
			{
				console.log('Backbone.history has already been started');
			}

			layout.goToCart();
			expect(window.location.hash).toBe('#cart');
		});


	});
});