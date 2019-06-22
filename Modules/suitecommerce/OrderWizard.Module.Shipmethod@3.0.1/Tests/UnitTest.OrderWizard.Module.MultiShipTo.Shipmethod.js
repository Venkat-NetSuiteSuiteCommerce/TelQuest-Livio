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
	// ,	'OrderWizard.Module.MultiShipTo.Shipmethod'
	// ,	'Address.Model'
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
	// ,	OrderWizardModuleMultiShipToShipmethod
	// ,	Address
	// ,	Backbone
	// ,	_
	)
{
	'use strict';

	// describe('OrderWizard MultiShipTo Shipmethod', function ()
	// {
	// 	var	helper = new UnitTestHelper({
	// 			applicationName: 'OrderWizardModuleMultiShipToShipmethod'
	// 		})
	// 	,	live_order_model = LiveOrderModel.getInstance()
	// 	,	profile_model = ProfileModel.getInstance()
	// 	,	options = {
	// 				steps: {}
	// 			,	model: live_order_model
	// 			,	profile: profile_model
	// 		}
	// 	,	orderWizardRouter = new OrderWizardRouter(helper.application, options);


	// 	live_order_model.set(UnitTestHelperDummyData.LiveOrderModel.twoItemsWithMultiShipToShipmethods);

	// 	helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;

	// 	try
	// 	{
	// 		Backbone.history.start();
	// 	}
	// 	catch (e)
	// 	{
	// 		console.log(e);
	// 	}

	// 	describe('UI Interaction', function ()
	// 	{
	// 		it('Should package per address', function ()
	// 		{
	// 			var view = new OrderWizardModuleMultiShipToShipmethod({is_read_only: false, wizard: orderWizardRouter, step: {}});
		
	// 			view.state = 'present';

	// 			view.render();

	// 			var $packages = view.$('[data-type="package"]');
	// 			expect($packages.length).toBe(2);
	// 		});

	// 		it('Should render each package with it corresponding editable shipmethod', function ()
	// 		{
	// 			var view = new OrderWizardModuleMultiShipToShipmethod({is_read_only: false, wizard: orderWizardRouter, step: {}});
		
	// 			view.state = 'present';

	// 			view.render();

	// 			var $packages = view.$('[data-type="package"]')
	// 			,	selected_package = $packages.first()
	// 			,	address_id = selected_package.data('address-id')
	// 			,	shipmethods = orderWizardRouter.model.get('multishipmethods');


	// 			expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(shipmethods[address_id].length);

	// 			selected_package = $packages.last();
	// 			address_id = selected_package.data('address-id');

	// 			expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(shipmethods[address_id].length);
	// 		});

	// 		it('Should display a readonly version when specified', function ()
	// 		{
	// 			var	shipmethods = orderWizardRouter.model.get('multishipmethods');

	// 			orderWizardRouter.model.get('lines').each(function (line)
	// 			{
	// 				var selected_shipmethods = shipmethods[line.get('shipaddress')];
	// 				line.set('shipmethod', selected_shipmethods.first().get('internalid'));
	// 			});

	// 			var view = new OrderWizardModuleMultiShipToShipmethod({is_read_only: true, wizard: orderWizardRouter, step: {}});

	// 			view.state = 'present';

	// 			view.render();

	// 			var $packages = view.$('[data-type="package"]')
	// 			,	selected_package = $packages.first();

	// 			expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(0);

	// 			selected_package = $packages.last();
	// 			expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(0);
	// 		});
	// 	});

	// 	describe('Update Address', function ()
	// 	{
			
	// 		it ('should retrieve shipping methods if the address update change country and-or zip code', function ()
	// 		{

	// 			var profile_addresses = orderWizardRouter.options.profile.get('addresses');
				
	// 			orderWizardRouter.model.get('addresses').each(function (model_address)
	// 			{
	// 				profile_addresses.add(new Address(model_address.attributes), {silent: true});
	// 			});

	// 			var	shipmethods = orderWizardRouter.model.get('multishipmethods');
				
	// 			orderWizardRouter.model.get('lines').each(function (line)
	// 			{
	// 				var selected_shipmethods = shipmethods[line.get('shipaddress')];
	// 				line.set('shipmethod', selected_shipmethods.first().get('internalid'));
	// 			});

	// 			var view = new OrderWizardModuleMultiShipToShipmethod({is_read_only: true, wizard: orderWizardRouter, step: {}});

	// 			view.state = 'present';

	// 			view.render();

	// 			var $packages = view.$('[data-type="package"]')
	// 			,	selected_package = $packages.first()
	// 			,	address_id = selected_package.data('address-id')
	// 			,	call_arguments = null;

	// 			spyOn(view, 'reloadShppingMethodForAddress').and.callFake(function()
	// 			{
	// 				call_arguments = arguments;
	// 			});
				
	// 			profile_addresses.get(address_id).set('zip', '22800');

	// 			expect(call_arguments[0]).toEqual(address_id + '');
	// 		});

	// 		it('should notify the user if when retrieving the delivery methods none is get back', function ()
	// 		{
	// 			var profile_addresses = orderWizardRouter.options.profile.get('addresses');
				
	// 			orderWizardRouter.model.get('addresses').each(function (model_address)
	// 			{
	// 				profile_addresses.add(new Address(model_address.attributes), {silent: true});
	// 			});

	// 			var	shipmethods = orderWizardRouter.model.get('multishipmethods');
				
	// 			orderWizardRouter.model.get('lines').each(function (line)
	// 			{
	// 				var selected_shipmethods = shipmethods[line.get('shipaddress')];
	// 				line.set('shipmethod', selected_shipmethods.first().get('internalid'));
	// 			});

	// 			var view = new OrderWizardModuleMultiShipToShipmethod({is_read_only: true, wizard: orderWizardRouter, step: {}});

	// 			view.state = 'present';

	// 			view.render();

	// 			expect(view.$('.order-wizard-msr-shipmethod-package-message').length).toBe(0);
				
	// 			orderWizardRouter.model.get('lines').each(function (line)
	// 			{
	// 				line.set('shipmethod' , null, {silent: true});
	// 			});
				
	// 			_.each(_.keys(shipmethods), function (address_id)
	// 			{
	// 				shipmethods[address_id].reset();
	// 			});

				
	// 			view.render();
				
	// 			expect(view.$('.order-wizard-msr-shipmethod-package-message').length).toBe(2); //One per package

	// 		});

	// 	});

	// });

});