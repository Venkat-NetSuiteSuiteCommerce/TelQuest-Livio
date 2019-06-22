/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'ProductDetails'
	,	'UnitTest.ProductDetails.Data'
	,	'Item'
    ,	'ProductViews'
    ,	'Transaction.Line.Views'
	,	'SC.Configuration'
	,	'ProductList'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'

	,	'Application'
	,	'Backbone.View'
	,	'Backbone.View.render'
	,	'Backbone.Model'
	,	'mock-ajax'
	]
,	function (
		ProductDetails
	,	UnitTestProductDetailsData
	,	Item
	,	ProductViews
	,	TransactionLineViews
	,	Configuration
	,	ProductList
	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	return describe('Product Details Page (PDP) Component', function ()
	{
		var application
		,	pdp_component;

		beforeAll(function (done)
		{
			application = SC.Application('PDPTestAssurance');
			application.Configuration = _.extend(application.Configuration, Configuration);

			//fake router to avoid navigating (remember the PDP is the default router and read ALL routes)
			var fake_router = Backbone.Router.extend({
					routes: {
						'': 'fakeHandle'
					,	'?*params': 'fakeHandle'
					}
				,	fakeHandle: function()
					{
						var myView = Backbone.View.extend({
								template: function () {return 'Home Content';}
							})
						,	view = new myView({application:application});

						view.showContent();
					}
				})
			,	start_modules = [
					ProductDetails
				,	Item
				,	ProductViews
				,	TransactionLineViews
				,	ProductList
				];

			Backbone.history.stop();
			Backbone.history.off();
			application.start(start_modules, function ()
			{
				new fake_router({});

				application.getLayout().template = _('<div id="content">layout</div>').template();
				application.getLayout().appendToDom();

				jasmine.Ajax.install();
				Backbone.history.start();
				done();
			});
		});

		beforeEach(function ()
		{
			jasmine.Ajax.install();

			// (General) Arrange
			pdp_component = application.getComponent('PDP');
			Backbone.history.navigate('/', {trigger: true});
		});

		afterEach(function ()
		{
			// jasmine.Ajax.install();

			jasmine.Ajax.uninstall();
			Backbone.history.navigate('/', {trigger: true});
		});

		describe('Public interface', function ()
		{
			it ('should define/implement all public methods', function ()
			{
				expect(application.getComponent('PDP')).toBeDefined();
				expect(_.isFunction(application.getComponent('PDP').setOption)).toBe(true);
				expect(_.isFunction(application.getComponent('PDP').setQuantity)).toBe(true);
				expect(_.isFunction(application.getComponent('PDP').getItemInfo)).toBe(true);
			});
		});

		describe('setOption method', function ()
		{
			it ('should require a option id as first parameter', function ()
			{
				//Act & Assert
				expect(function () { return  pdp_component.setOption(); }).toThrow();
				expect(function () { return  pdp_component.setOption(); }).toThrowError(Error);
			});

			it ('should indicate when the operation is NOT successful (when the current page is not a PDP)', function (done)
			{
				//Arrange
				var expected_value = false
				,	operations = [];

				//Act & Assert
				expect(pdp_component).toBeDefined();

				operations.push(pdp_component.setOption('fake_option').then(function (operation_result)
				{
					expect(operation_result).toBe(expected_value);
				}));

				operations.push(pdp_component.setOption('fake_option', 'invalid_option').then(function (operation_result)
				{
					expect(operation_result).toBe(expected_value);
				}));

				operations.push(pdp_component.setOption('fake_option', 1).then(function (operation_result)
				{
					expect(operation_result).toBe(expected_value);
				}));

				jQuery.when.apply(jQuery, operations).then(done);
			});

			it('should set an option when the current page is a valid PDP and the option and value specified are correct', function (done)
			{
				//Arrange
				Backbone.history.navigate('#some-product', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent()
				,	operations = [];

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				pdp_component.setOption('custcol11', 'cleanPreviousSetOptions');

				var internalid_to_set
				,	post_item_information
				,	pre_item_information
				,	expected_valid_result = true;

				//VALID OPTIONS

				//option 1 (BOOMs)

				//Act
				internalid_to_set = '1';
				pre_item_information = pdp_component.getItemInfo();
				operations.push(pdp_component.setOption('custcol11', internalid_to_set).then(function (obtained_result)
					{
						post_item_information = pdp_component.getItemInfo();

						//Assert
						expect(obtained_result).toBe(expected_valid_result);
						expect(pre_item_information.options[0].value).toBeUndefined();
						expect(post_item_information.options[0].value).toBeDefined();
						expect(post_item_information.options[0].value.internalid).toBe(internalid_to_set);
						expect(post_item_information.options[0].value.label).toBe('BOOMs', 'The new set option label must be "BOOMs"');

						//option 2 (Toys)

						//Act
						internalid_to_set = '2';
						pre_item_information = pdp_component.getItemInfo();
						operations.push(pdp_component.setOption('custcol11', internalid_to_set).then(function (obtained_result)
							{
								post_item_information = pdp_component.getItemInfo();

								//Assert
								expect(pre_item_information.options[0].value).toBeDefined();
								expect(pre_item_information.options[0].value.label).toBe('BOOMs', 'The previous set option label must continue being "BOOMs"');

								expect(obtained_result).toBe(expected_valid_result);

								expect(post_item_information.options[0].value).toBeDefined();
								expect(post_item_information.options[0].value.internalid).toBe(internalid_to_set, 'The new set option id must be the one specified');
								expect(post_item_information.options[0].value.label).toBe('Toys', 'The new set option label must be "Toys"');
							}));

						jQuery.when.apply(jQuery, operations).then(done);
					}));
			});

			it('should clean the previous set option if passed none option id', function ()
			{
				//Arrange
				Backbone.history.navigate('#another-product', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent();
				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				//Act
				pdp_component.setOption('custcol11', '1');
				expect(pdp_component.getItemInfo().options[0].value.internalid).toBe('1');
				pdp_component.setOption('custcol11');

				//Assert
				expect(pdp_component.getItemInfo().options[0].value).toBeUndefined();
			});

			it('should trigger the event "beforeOptionSelection" when validly setting an option', function (done)
			{
				//Arrange
				Backbone.history.navigate('#the-product', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent();
				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				pdp_component.setOption('custcol11'); //clean previous option

				var set_option = { callback: function () {} };
				spyOn(set_option, 'callback');

				pdp_component.on('beforeOptionSelection', set_option.callback);

				//Act
				pdp_component.setOption('custcol11', '1').then(function ()
					{
						//Assert
						expect(set_option.callback).toHaveBeenCalled();

						pdp_component.off('beforeOptionSelection', set_option.callback);
						done();
					});
			});

			it('should trigger a CANCELABLE "beforeOptionSelection" event when validly setting an option that stop from setting the specified option', function (done)
			{
				//Arrange
				Backbone.history.navigate('#the-product_alternative', {trigger: true});

				var itemRequest  = jasmine.Ajax.requests.mostRecent()
				,	rejectCallback =  function rejectCallback ()
					{
						return jQuery.Deferred().reject();
					};

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				pdp_component.setOption('custcol11'); //clean previous option

				var expected_options = pdp_component.getItemInfo();
				pdp_component.on('beforeOptionSelection', rejectCallback);

				//Act
				pdp_component.setOption('custcol11', '1').then(function (operation_result)
					{
						//Assert
						expect(operation_result).toBe(false);
						expect(pdp_component.getItemInfo().options).toEqual(expected_options.options);

						pdp_component.off('beforeOptionSelection', rejectCallback);
						done();
					});
			});

			it('should trigger the event "afterOptionSelection" when an option is set outside the Component Interface', function (done)
			{
				//Arrange
				Backbone.history.navigate('#the-product02', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent();
				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				pdp_component.setOption('custcol11'); //clean previous option

				var set_option = { callback: function () {} };
				spyOn(set_option, 'callback');

				pdp_component.on('afterOptionSelection', set_option.callback);

				//Act
				pdp_component.setOption('custcol11', '1').then(function ()
					{
						//A timeout to allow the before event handler to run
						setTimeout(function ()
						{
							//Assert
							expect(set_option.callback).toHaveBeenCalled();

							pdp_component.off('afterOptionSelection', set_option.callback);
							done();
						}, 100);
					});
			});
		});

		describe('setQuantity method', function ()
		{
			it('should require a number as parameter', function ()
			{
				//Act & Assert
				expect(function () { return  pdp_component.setQuantity(); }).toThrow();
				expect(function () { return  pdp_component.setQuantity(); }).toThrowError(Error);
				expect(function () { return  pdp_component.setQuantity('Not Number'); }).toThrow();
				expect(function () { return  pdp_component.setQuantity(true); }).toThrow();
				expect(function () { return  pdp_component.setQuantity({}); }).toThrow();
				expect(function () { return  pdp_component.setQuantity(null); }).toThrow();
				expect(function () { return  pdp_component.setQuantity(/test/); }).toThrow();
				expect(function () { return  pdp_component.setQuantity(function (){}); }).toThrow();
			});

			it('should indicate when the operation is NOT successfully (when the current page is not a PDP)', function (done)
			{
				//Arrange
				var expected_value = false
				,	operations = [];

				//Act & Assert
				expect(pdp_component).toBeDefined();
				operations.push(pdp_component.setQuantity(12).then(function (operation_result)
				{
					expect(operation_result).toBe(expected_value);
				}));
				operations.push(pdp_component.setQuantity(12.2).then(function (operation_result)
				{
					expect(operation_result).toBe(expected_value);
				}));

				jQuery.when.apply(jQuery, operations).then(done);
			});

			it('should throw when the quantity is lower or equal than 0', function ()
			{
				//Act & Assert
				expect(function () { return  pdp_component.setQuantity(0); }).toThrow();
				expect(function () { return  pdp_component.setQuantity(-1); }).toThrow();
				expect(function () { return  pdp_component.setQuantity(-100); }).toThrow();
			});

			it('should set a new quantity when the current page is a valid PDP and the specified value is valid', function (done)
			{
				//Arrange
				Backbone.history.navigate('#second-product', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent();
				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var item_information
				,	operations = []
				,	expected_value = 2;

				//Act
				operations.push(pdp_component.setQuantity(expected_value).then(function (obtained_result)
				{
					item_information = pdp_component.getItemInfo();

					//Assert
					expect(obtained_result).toBe(true);
					expect(item_information.quantity).toBe(expected_value);

					//Act
					expected_value = 150;
					operations.push(pdp_component.setQuantity(expected_value).then(function (obtained_result)
					{
						item_information = pdp_component.getItemInfo();

						//Assert
						expect(obtained_result).toBe(true);
						expect(item_information.quantity).toBe(expected_value);
						done();
					}));
				}));
			});

			it('should trigger the event "beforeQuantityChange" when validly setting a new quantity', function (done)
			{
				//Arrange
				Backbone.history.navigate('#the-product-that', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent();
				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				pdp_component.setOption('custcol11'); //clean previous option

				var set_quantity = { callback: function () {} };
				spyOn(set_quantity, 'callback');

				pdp_component.on('beforeQuantityChange', set_quantity.callback);

				//Act
				pdp_component.setQuantity(431).then(function ()
					{
						//Assert
						expect(set_quantity.callback).toHaveBeenCalled();
						expect(set_quantity.callback).toHaveBeenCalledWith(431);

						pdp_component.off('beforeQuantityChange', set_quantity.callback);
						done();
					});
			});

			it('should trigger a cancelable "beforeQuantityChange" event when validly setting a quantity', function (done)
			{
				//Arrange
				Backbone.history.navigate('#the-product-sm!', {trigger: true});

				var itemRequest  = jasmine.Ajax.requests.mostRecent()
				,	rejectCallback =  function rejectCallback ()
					{
						return jQuery.Deferred().reject();
					};

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var expected_options = pdp_component.getItemInfo();
				pdp_component.on('beforeQuantityChange', rejectCallback);

				//Act
				pdp_component.setQuantity(544).then(function (operation_result)
					{
						//Assert
						expect(operation_result).toBe(false);
						expect(pdp_component.getItemInfo().quantity).toEqual(expected_options.quantity);

						pdp_component.off('beforeQuantityChange', rejectCallback);
						done();
					});
			});

			it('should trigger the event "beforeQuantityChange" when an option is set outside the Component Interface', function (done)
			{
				//Arrange
				Backbone.history.navigate('#the-thing', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent();
				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var set_quantity = { callback: function () {} };
				spyOn(set_quantity, 'callback');

				pdp_component.on('beforeQuantityChange', set_quantity.callback);

				//Act
				application.getLayout().getCurrentView().model.set('quantity', 42).then(function ()
					{
						//Assert
						expect(set_quantity.callback).toHaveBeenCalled();
						expect(set_quantity.callback).toHaveBeenCalledWith(42);

						pdp_component.off('beforeQuantityChange', set_quantity.callback);
						done();
					});
			});

			it ('should trigger "afterQuantityChange" after the quantity is successfully changed', function (done)
			{
				//Arrange
				Backbone.history.navigate('#my-product02', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent();
				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var set_quantity = { callback: function () {} };
				spyOn(set_quantity, 'callback');

				pdp_component.on('afterQuantityChange', set_quantity.callback);

				//Act
				pdp_component.setQuantity(44).then(function ()
					{
						//A timeout to allow the before event handler to run
						setTimeout(function ()
						{
							//Assert
							expect(set_quantity.callback).toHaveBeenCalled();

							pdp_component.off('afterQuantityChange', set_quantity.callback);
							done();
						}, 100);
					});
			});
		});

		describe('image change event', function ()
		{
			//IMPORTANT: The following tests trigger actions (Act stage) by trigger events on the DOM due to the lack of any other support to do so.

			it('should trigger an "beforeImageChange" event when clicking the next image button', function ()
			{
				//Arrange
				Backbone.history.navigate('#your-product-details', {trigger: true});
				var itemRequest = jasmine.Ajax.requests.mostRecent();

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var image_change = { callback: function () {} };
				spyOn(image_change, 'callback');

				pdp_component.on('beforeImageChange', image_change.callback);

				//Act
				application.getLayout().getCurrentView().$('[data-action="next-image"]').click();

				//Assert
				expect(image_change.callback).toHaveBeenCalled();

				pdp_component.off('beforeImageChange', image_change.callback);
			});

			it('should trigger an "beforeImageChange" event when clicking the previous image button', function ()
			{
				//Arrange
				Backbone.history.navigate('#your-product-details-or-not', {trigger: true});
				var itemRequest = jasmine.Ajax.requests.mostRecent();

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var image_change = { callback: function () {} };
				spyOn(image_change, 'callback');

				pdp_component.on('beforeImageChange', image_change.callback);

				//Act
				application.getLayout().getCurrentView().$('[data-action="prev-image"]').click();

				//Assert
				expect(image_change.callback).toHaveBeenCalled();

				pdp_component.off('beforeImageChange', image_change.callback);
			});

			it('should trigger a cancelable "beforeImageChange" event on next', function ()
			{
				//Arrange
				Backbone.history.navigate('#your-nothing!', {trigger: true});
				var itemRequest = jasmine.Ajax.requests.mostRecent()
				,	rejectCallback =  function rejectCallback ()
					{
						return jQuery.Deferred().reject();
					};

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var image_change = { callback: function () {} };
				spyOn(image_change, 'callback');

				pdp_component.on('beforeImageChange', rejectCallback);
				pdp_component.on('afterImageChange', image_change.callback);

				//Act
				application.getLayout().getCurrentView().$('[data-action="next-image"]').click();

				//Assert
				expect(image_change.callback).not.toHaveBeenCalled();

				pdp_component.off('beforeImageChange', image_change.callback);
			});

			it('should trigger a cancelable "beforeImageChange" event on previous', function ()
			{
				//Arrange
				Backbone.history.navigate('#the-caw!', {trigger: true});
				var itemRequest = jasmine.Ajax.requests.mostRecent()
				,	rejectCallback =  function rejectCallback ()
					{
						return jQuery.Deferred().reject();
					};

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				var image_change = { callback: function () {} };
				spyOn(image_change, 'callback');

				pdp_component.on('beforeImageChange', rejectCallback);
				pdp_component.on('afterImageChange', image_change.callback);

				//Act
				application.getLayout().getCurrentView().$('[data-action="prev-image"]').click();

				//Assert
				expect(image_change.callback).not.toHaveBeenCalled();

				pdp_component.off('beforeImageChange', image_change.callback);
			});

		});

		describe('getItemInfo method', function ()
		{
			it('should return null when the current page is not a PDP', function ()
			{
				expect(application.getComponent('PDP').getItemInfo()).toBe(null);
			});

			//This test is ignored because we remove the is-my-json-valid libray 
			xit('should return a JSON object that fulfill the defined JSON-Schema for Item Information', function ()
			{
				//Arrange
				Backbone.history.navigate('#silver-product', {trigger: true});
				var itemRequest  = jasmine.Ajax.requests.mostRecent()
				,	item_validator = validator(UnitTestProductDetailsData.itemSchema);

				itemRequest.response({
					status: 200
				,	responseText: JSON.stringify(UnitTestProductDetailsData.matrixItem)
				});

				//Act
				var item_info = pdp_component.getItemInfo();

				//Assert
				expect(item_validator(item_info)).toBe(true);
			});
		});
	});
});