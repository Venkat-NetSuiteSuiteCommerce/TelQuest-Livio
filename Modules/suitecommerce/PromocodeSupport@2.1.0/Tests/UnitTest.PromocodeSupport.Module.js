/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// PromocodeSupport.js
// --------------------
// Testing PromocodeSupport module.
define(
	[
		'PromocodeSupport'
	,	'Cart'
	,	'UrlHelper'
	,	'LiveOrder.Model'
	,	'Application'
	,	'jasmine2-typechecking-matchers'

	]
,	function (
		PromocodeSupport
	,	Cart
	,	UrlHelper
	,	LiveOrderModel
	)
{
	
	'use strict';
	 
	xdescribe('Module: PromocodeSupport', function () 
	{
		
		var cartModel
		,	application;
		
		beforeEach(function (done)
		{
			application = SC.Application('PromocodeSupport');
			application.start([PromocodeSupport, UrlHelper], function () 
			{
				cartModel = LiveOrderModel.getInstance(); 
				spyOn(cartModel, 'save');
				done();
			});
		});
		
		it('#1 must be called save function of model cart when the promocode is in the url', function() 
		{
			UrlHelper.setUrl('http://www.netsuite.com?promocode=10off');
			expect(cartModel.save).toHaveBeenCalled();
		});	
		
	});

});