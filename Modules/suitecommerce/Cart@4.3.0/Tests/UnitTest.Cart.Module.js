/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Cart.js
// --------------------
// Testing Cart module.

window.SC = window.SC || {};

define(['Cart', 'UnitTestHelper', 'UnitTestHelper.Preconditions', 'jasmine2-typechecking-matchers']
	, function (Cart, UnitTestHelper, Preconditions)
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
			Preconditions.setDefaultEnvironment();		
			SC.isPageGenerator = function()
			{
				return true;
			};
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

		// commented because incompatibility of several unit tests changing the history.fragment in the same DOM
		it('layout.goToCart() must navigate to the url "#cart"', function (done)
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
			done()
		});
	});
});