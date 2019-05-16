/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Testing ProductList models
define(
	[
		'UnitTestHelper'
	,	'ProductList'
	,	'ProductList.Details.View'
	,	'Application'

	,	'jasmine2-typechecking-matchers'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		TestHelper
	,	ProductList
	,	ProductListDetailsView
	,	Application

	,	Jasmine2TypeCheckingMatchers
	,	_
	,	jQuery
	)
{
	'use strict';

	// var helper = new TestHelper({
	// 	applicationName: 'ProductListDetails.module'
	// ,	loadTemplates: true
	// ,	environment: SC.ENVIRONMENT
	// });

	// describe('ProductList module', function ()
	// {
	// 	beforeEach(function (done)
	// 	{
	// 		// SC.templates.layout_tmpl = '<div id="content"></div></div>';
	// 		jQuery('body').append('<div id="main"></div>');

	// 		// This is the configuration needed by the modules in order to run
	// 		helper.application.Configuration = {
	// 			// modules: [ProductList]
	// 			product_lists: {
	// 				itemsDisplayOptions: []
	// 			}
	// 		};
	// 		// Starts the application and wait until it is started
	// 		jQuery(helper.application.start([ProductList], function ()
	// 		{
	// 			//now that the app started, configure a custom control placeholder.
	// 			helper.application.ProductListModule.Utils.placeholder.control = '#mycontrol1';
	// 			helper.application.ProductListModule.Utils.renderControl = spyOn(helper.application.ProductListModule.Utils, 'renderControl').and.callThrough();
	// 			helper.application.getLayout().appendToDom();
	// 			done();
	// 		}));
	// 	});

	// 	it('should install accessible API', function()
	// 	{
	// 		expect(helper.application.ProductListModule.Utils.getProductLists).toBeA(Function);
	// 	});
	// });
});