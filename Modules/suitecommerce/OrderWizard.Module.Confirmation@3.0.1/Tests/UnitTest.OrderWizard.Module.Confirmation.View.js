/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
	// 	'OrderWizard.Router'
	// ,	'LiveOrder.Model'
	// ,	'Profile.Model'
	// ,	'UnitTestHelper'
	// ,	'UnitTestHelper.DummyData'
	// ,	'OrderWizard.Module.Confirmation'
	// ,	'Backbone'
	// ,	'underscore'
	// ,	'Utils'
	]
,	function (
	// 	OrderWizardRouter
	// ,	LiveOrderModel
	// ,	ProfileModel
	// ,	UnitTestHelper
	// ,	UnitTestHelperDummyData
	// ,	OrderWizardModuleConfirmation
	// ,	Backbone
	// ,	_
	)
{
	'use strict';

	// var helper = new UnitTestHelper({
	// 		applicationName: 'OrderWizardModuleConfirmation'
	// 	})
	// ,	live_order_model = LiveOrderModel.getInstance()
	// ,	profile_model = ProfileModel.getInstance()
	// ,	options = {
	// 			steps: {}
	// 		,	model: live_order_model
	// 		,	profile: profile_model
	// 	}
	// ,	orderWizardRouter = new OrderWizardRouter(helper.application, options);


	// live_order_model.set(UnitTestHelperDummyData.LiveOrderModel.withConfirmation);

	// try
	// {
	// 	Backbone.history.start();
	// }
	// catch (e)
	// {
	// 	console.log(e);
	// }

	// xdescribe('OrderWizard Module Confirmation', function ()
	// {
		
	// 	describe('Update url', function ()
	// 	{
	// 		it('the url should have the parameter "last_order_id"', function ()
	// 		{
	// 			var view = new OrderWizardModuleConfirmation({wizard: orderWizardRouter, step: {}});
	// 			view.render();

	// 			expect(_.parseUrlOptions(window.location.hash).last_order_id).toBe(UnitTestHelperDummyData.LiveOrderModel.withConfirmation.confirmation.internalid + '');

	// 		});

	// 	});

	// });

	// xdescribe('OrderWizard Module Confirmation without additional confirmation message', function ()
	// {
	// 	describe('UI Interaction', function ()
	// 	{
	// 		it('should not render additional confirmation message', function ()
	// 		{
	// 			var view = new OrderWizardModuleConfirmation({wizard: orderWizardRouter, step: {}});
	
	// 			view.render();
				
	// 			var $messagge = view.$('[data-type="additional-confirmation-message"]');
	// 			expect($messagge.length).toBe(0);
	// 		});

	// 	});

	// });
	
	// xdescribe('OrderWizard Module Confirmation with additional confirmation message', function ()
	// {

	// 	describe('UI Interaction', function ()
	// 	{
	// 		it('should render additional confirmation message', function ()
	// 		{
	// 			var view = new OrderWizardModuleConfirmation({wizard: orderWizardRouter, step: {}, additional_confirmation_message: 'THANKS!'});
	
	// 			view.render();
				
	// 			var $messagge = view.$('[data-type="additional-confirmation-message"]');
	// 			expect($messagge.length).toBe(1);

	// 		});

	// 		it('should be the same of configuration file', function ()
	// 		{
	// 			var view = new OrderWizardModuleConfirmation({wizard: orderWizardRouter, step: {}, additional_confirmation_message: 'THANKS!'});
				
	// 			view.render();
				
	// 			var $messagge = view.$('[data-type="additional-confirmation-message"]');

	// 			expect($messagge.html()).toBe('THANKS!');

	// 		});

	// 	});

	// });

});