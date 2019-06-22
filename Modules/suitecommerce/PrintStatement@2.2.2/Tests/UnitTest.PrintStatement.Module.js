/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'PrintStatement.Router'
	,	'UnitTestHelper'
	,	'jQuery'
	,	'Backbone.View.saveForm'
	,	'ErrorManagement'
	,	'mock-ajax'
	]
,	function (
		PrintStatementRouter
	,	TestHelper
	,	jQuery
	)
{
	'use strict';

	// var helper = new TestHelper({
	// 		applicationName: 'PrintStatement'
	// 	,	loadTemplates: true
	// 	,	applicationConfiguration: {filterRangeQuantityDays: 30}
	// 	,	startApplication: true
	// 	,	environment: {permissions: {transactions: {tranStatement: 2}}}
	// });

	// return describe('PrintStatement Module', function ()
	// {
	// 	describe('Basic tests', function ()
	// 	{
	// 		beforeEach(function ()
	// 		{
	// 			jasmine.Ajax.install();
	// 			jQuery.ajaxSetup({ cache:true}); //Prevent underscore parameter in request url
	// 		});

	// 		afterEach(function()
	// 		{
	// 			jasmine.Ajax.uninstall();
	// 		});

	// 		xit('Check the form, click on both buttons and expect the requests are made.', function (done)
	// 		{
	// 			var router = new PrintStatementRouter(helper.application);
	// 			var view = router.printstatement();
	// 			// expect(view.template).toEqual('print_statement');
	// 			expect(view.title).toEqual('Print a Statement');
	// 			expect(view.page_header).toEqual('Print a Statement');
	// 			expect(view.model.urlRoot).toEqual('services/PrintStatement.Service.ss');

	// 			expect(view.$('form [name=statementDate]').attr('type')).toEqual('date');
	// 			expect(view.$('form [name=startDate]').attr('type')).toEqual('date');
	// 			expect(view.$('form [name=inCustomerLocale]').attr('type')).toEqual('checkbox');
	// 			expect(view.$('form [name=openOnly]').attr('type')).toEqual('checkbox');
	// 			expect(view.$('form [name=consolidatedStatement]').attr('type')).toEqual('checkbox');
	// 			expect(helper.application.getConfig('filterRangeQuantityDays')).toEqual(30);

	// 			spyOn(view,'showError').and.callThrough();
	// 			spyOn(view,'printStatement').and.callThrough();
	// 			spyOn(view,'saveForm').and.callThrough();
	// 			spyOn(window, 'open');

	// 			var statementDate = new Date(view.$('form [name=statementDate]').val().replace(/-/g,'/')).getTime()
	// 			,	startDate = new Date(view.$('form [name=startDate]').val().replace(/-/g,'/')).getTime();

	// 			expect(window.open.calls.count()).toEqual(0, 'a window was not opened yet');
	// 			view.$('form').submit();
	// 			expect(view.printStatement.calls.count()).toEqual(1, 'printStatement called once');
	// 			expect(view.showError.calls.count()).toEqual(0, 'showError not called yet');
	// 			expect(view.saveForm.calls.count()).toEqual(0, 'saveForm not called yet');
	// 			expect(window.open.calls.count()).toEqual(1, 'a window was opened');


	// 			expect(window.open.calls.argsFor(0)[0]).toContain('download.ssp?statementDate='+statementDate+'&startDate='+startDate+'&email=&asset=print-statement&n=');

	// 			jasmine.Ajax.stubRequest('services/PrintStatement.Service.ss').andReturn({ //Save and validate model
	// 				responseText:JSON.stringify({url:'services/getEmail'}) //Get eMail url
	// 			});

	// 			jasmine.Ajax.stubRequest('services/getEmail').andReturn({
	// 				responseText:'finish'
	// 			});

	// 			jasmine.Ajax.stubRequest('getEmail');

	// 			view.$('[data-action=email]').click();

	// 			whenTrue(function()
	// 				{
	// 					return jasmine.Ajax.requests.at(0) && jasmine.Ajax.requests.at(0).readyState === 2;
	// 				}
	// 			, 	function()
	// 				{
	// 					expect(view.printStatement.calls.count()).toEqual(2, 'printStatement called twice');
	// 					expect(view.saveForm.calls.count()).toEqual(1,'saveForm called once');
	// 					expect(window.open.calls.count()).toEqual(1,'window was not opened this time');
	// 					done();
	// 				});

	// 		});

	// 		//TODO: put a lower permission.transactions.tranStatement, navigate and check for an error page.
	// 	});
	// });
});
