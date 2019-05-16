/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'CreditCard.Model'
	,	'UnitTestHelper'
	,	'UnitTest.CreditCard.TestCasesData'
	]
,	function (
		CreditCardModel
	,	UnitTestHelper
	,	TestCasesData
	)
{
	'use strict';

	var helper = new UnitTestHelper({
			applicationName: 'CreditCard.Model'
		,	environment: TestCasesData.environment
		,	applicationConfiguration: TestCasesData.configuration
	});

	return describe('Credit Card Model', function() {
	
		describe('validations', function()
		{
			_.each(TestCasesData.model, function (test, test_description)
			{
				var model = new CreditCardModel(test.data);
				helper.testModelValidations(model, test, test_description);
			});
		});
	});
});