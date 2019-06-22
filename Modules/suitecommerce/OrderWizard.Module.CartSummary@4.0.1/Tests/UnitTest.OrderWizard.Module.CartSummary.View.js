/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
	// 	'OrderWizard.Router'
	// ,	'OrderWizard.Module.CartSummary'
	// ,	'UnitTestHelper'
	// ,	'Profile.Model'
	// ,	'LiveOrder.Model'
	// ,	'UnitTestHelper.DummyData'
	]
,	function (
	// 	OrderWizardRouter
	// ,	OrderWizardModuleCartSummary
	// ,	UnitTestHelper
	// ,	ProfileModel
	// ,	LiveOrderModel
	// ,	UnitTestHelperDummyData
	)
{
	'use strict';

	// describe('OrderWizard Cart Summary Module', function ()
	// {
	// 	var helper

	// 	describe('UI Interaction', function ()
	// 	{
	// 		beforeEach(function()
	// 		{
	// 			helper = new UnitTestHelper({
	// 						applicationName: 'OrderWizardModuleCartSummary'
	// 					})
	// 				,	live_order_model = LiveOrderModel.getInstance()
	// 				,	profile_model = ProfileModel.getInstance()
	// 				,	options = {
	// 							steps: {}
	// 						,	model: live_order_model
	// 						,	profile: profile_model
	// 					}
	// 				,	orderWizardRouter = new OrderWizardRouter(helper.application, options);


	// 				live_order_model.set(UnitTestHelperDummyData.LiveOrderModel.twoItems);

	// 				try{Backbone.history.start();}catch(ex){}
	// 		})
	// 		afterEach(function()
	// 		{
	// 			try{Backbone.history.stop()}catch(ex){}
	// 		})
	// 		it('Should re-render on module summary changes', function ()
	// 		{
	// 			var wizard
	// 			,	view_rendered =  false;

	// 			helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = false;

	// 			orderWizardRouter.model.set('ismultishipto', false);
				
	// 			var view = new OrderWizardModuleCartSummary({wizard: orderWizardRouter, show_promocode_form: true, step: {}});

	// 			view.state = 'present';

	// 			view.render();
				
	// 			expect(view.$('.order-wizard-cart-summary-promocode-unsupported-summary-warning').length).toBe(0);

	// 		});
			
	// 		it('Should sould be disable promocode if it is MST', function ()
	// 		{

	// 			helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;

	// 			orderWizardRouter.model.set('ismultishipto', true);

	// 			var view = new OrderWizardModuleCartSummary({wizard: orderWizardRouter, show_promocode_form: true, step: {}});
									
	// 			view.state = 'present';

	// 			view.render();
				
	// 			expect(view.$('.order-wizard-cart-summary-promocode-unsupported-summary-warning').length).toBe(1);

	// 		});

	// 		it('Should save the order when applying a new Promo Code', function ()
	// 		{
	// 			orderWizardRouter.model.set('ismultishipto', false);

	// 			var view = new OrderWizardModuleCartSummary({wizard: orderWizardRouter, show_promocode_form: true, step: {}});

	// 			view.state = 'present';

	// 			view.render();

	// 			view.$('input[name=promocode]').val('TEST_CODE');

	// 			var fake_event = jQuery.Event('submit', {
	// 				target: view.$('form[data-action="apply-promocode"]').get(0)
	// 			})
	// 			,	call_arguments = null;

	// 			spyOn(orderWizardRouter.model, 'save').and.callFake(function ()
	// 			{
	// 				call_arguments = arguments;
	// 				return jQuery.Deferred();
	// 			})

	// 			view.$('form[data-action="apply-promocode"]').trigger(fake_event);

	// 			expect(call_arguments[0].promocode.code).toEqual('TEST_CODE');
	// 		});

	// 		it('Should set promo code to null when removing the promo code', function ()
	// 		{

	// 			orderWizardRouter.model.set('ismultishipto', false);

	// 			orderWizardRouter.model.set('promocode', {
	// 					code: '50GENCODE'
	// 				,	internalid: '1'
	// 				,	isvalid: true
	// 			});

	// 			var view = new OrderWizardModuleCartSummary({wizard: orderWizardRouter, allow_remove_promocode: true, show_promocode_form: true, step: {}});

	// 			view.state = 'present';

	// 			view.render();


	// 			expect(view.$('.order-wizard-cart-summary-promo-code-applied').length).toBe(1);
	// 			expect(view.$('.order-wizard-cart-summary-promocode-unsupported-summary-warning').length).toBe(0);
	// 			expect(view.$('.order-wizard-cart-summary-grid-float').text()).toContain('#50GENCODE - Instant Rebate');


	// 			var fake_event = jQuery.Event('click', {
	// 				target: view.$('[data-action="remove-promocode"]').get(0)
	// 			})
	// 			,	call_arguments = null;

	// 			spyOn(orderWizardRouter.model, 'save').and.callFake(function ()
	// 			{
	// 				call_arguments = arguments;
	// 				return jQuery.Deferred().resolveWith(UnitTestHelperDummyData.LiveOrderModel.twoItems);
	// 			})

	// 			view.$('[data-action="remove-promocode"]').trigger(fake_event);

	// 			expect(call_arguments[0].promocode).toEqual(null);


	// 		});

	// 	});

	// });
});
