/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
	// 	'OrderWizard.Router'
	// ,	'OrderWizard.Module.MultiShipTo.EnableLink'
	// ,	'UnitTestHelper'
	// ,	'LiveOrder.Model'
	// ,	'Profile.Model'
	// ,	'UnitTest.OrderWizard.Module.MultiShipTo.EnableLink.Preconditions'
	]
,	function (
	// 	OrderWizardRouter
	// ,	OrderWizardModuleMultiShipToEnableLink
	// ,	UnitTestHelper
	// ,	LiveOrderModel
	// ,	ProfileModel
	)
{
	'use strict';

	// xdescribe('OrderWizard MultiShipTo Enable Link Module', function ()
	// {

	// 	var helper = new UnitTestHelper({
	// 			applicationName: 'OrderWizardRouter'
	// 		})
	// 	,	live_order_model = LiveOrderModel.getInstance()
	// 	,	profile_model = ProfileModel.getInstance()
	// 	,	options = {
	// 				steps: {}
	// 			,	model: live_order_model
	// 			,	profile: profile_model
	// 		}
	// 	, 	orderWizardRouter = new OrderWizardRouter(helper.application, options);
		

	// 	live_order_model.getShippableLines = function () { return [1,1]; };

	// 	describe('UI Interaction', function ()
	// 	{
	// 		it('Should NOT render if Multi Ship To is not enabled', function ()
	// 		{

	// 			helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = false;

	// 			var view = new OrderWizardModuleMultiShipToEnableLink({wizard: orderWizardRouter, step: {}});

	// 			view.render();

	// 			var	$link = view.$('[data-action="change-status-multishipto"]');
				
	// 			expect($link.length).toBe(0);

	// 		});

	// 		it('Should display enable Multi Ship To if it is enabled and Multi ship to is NOT set', function ()
	// 		{
	// 			helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;

	// 			var view = new OrderWizardModuleMultiShipToEnableLink({wizard: orderWizardRouter, step: {}});

	// 			view.render();

	// 			var	$link = view.$('[data-action="change-status-multishipto"]');
				
	// 			expect($link.length).toBe(1);

	// 			expect($link.data('type')).toEqual('singleshipto');
				
	// 		});

	// 		it('Should display enable Multi Ship To if it is enabled and Multi ship to is set', function ()
	// 		{

	// 			helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;

	// 			live_order_model.set('ismultishipto', true, {silent: true});

	// 			var view = new OrderWizardModuleMultiShipToEnableLink({wizard: orderWizardRouter, step: {}});

	// 			view.render();

	// 			var	$link = view.$('[data-action="change-status-multishipto"]');
				
	// 			expect($link.length).toBe(1);

	// 			expect($link.data('type')).toEqual('multishipto');

	// 		});

	// 	});

	// });
});
