/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define([
		'CreditMemo.Model'
	,	'Transaction.Line.Collection'
	,	'UnitTestHelper'
	,	'UnitTest.CreditMemo.TestCasesData'
	,	 'underscore'
	]
,	function (
		CreditMemoModel
	,	OrderLineCollection
	,	UnitTestHelper
	,	UnitTestCreditMemoTestCasesData
	,	_
	)
{
	'use strict';

	var helper = new UnitTestHelper({
		applicationName: 'CreditMemoModel'
	});


	return describe('Credit Memo Model', function()
	{
		
		describe('initialize', function()
		{
			it ('lines is a instance of OrderLineCollection', function() {
				var model = new CreditMemoModel();
				expect(model.get('lines') instanceof OrderLineCollection).toBe(true);
			});
		});

		describe('validations', function()
		{
			_.each(UnitTestCreditMemoTestCasesData.model, function (test, test_description)
			{
				var model = new CreditMemoModel(test.data);
				helper.testModelValidations(model, test, test_description);
			});
		});

	});

});