/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
		'UnitTest.CreditCard.TestCasesData'
	,	[]
,	function()
{
	TestCasesData = {
		view:
		{
		}
	,	model:
		{
			'model empty':{
				data: { }
			,	result: {
					invalidFields: ['ccname', 'ccnumber', 'expyear', 'expmonth']
				}
			}
		,	'name with less than 27 characters is valid': {
				data: { ccname: 'Maximiliano Ricardo'}
			,	result: {
					validFields: ['ccname']
				}
			}
		,	'name with more than 27 characters is invalid': {
				data: { ccname: 'Maximiliano Ricardo Javier Fausto Nicolás Arturo de la Cruz Reffino' }
			,	result: {
					invalidFields: ['ccname']
				}
			}
		,	'incorrect value of number (0000000000000000000)': {
				data: { ccnumber: '9000000000000000000' }
			,	result: {
					invalidFields: ['ccnumber']
				}
			}
		,	'correct value of number (VISA - 4111111111111111)': {
				data: { ccnumber: '4111111111111111' }
			,	result: {
					validFields: ['ccnumber']
				}
			}
		,	'correct value of number (Master Card - 5105105105105100)': {
				data: { ccnumber: '5105105105105100' }
			,	result: {
					validFields: ['ccnumber']
				}
			}
		,	'correct value of number but not supported card (Discover - 6011111111111117)': {
				data: { ccname: '6011111111111117' }
			,	result: {
					invalidFields: ['ccnumber']
				}
			}
		,	'expiration date invalid (06/1950)': {
				data: { expyear: 1950, expmonth: 6 }
			,	result: {
					invalidFields: ['expyear', 'expmonth']
				}
			}
		,	'expiration date valid (06/2050)': {
				data: { expyear: 2050, expmonth: 6 }
			,	result: {
					validFields: ['expyear', 'expmonth']
				}
			}
		}
	,	environment: {siteSettings:{paymentmethods:[{'ispaypal':'F','name':'Master Card','creditcard':'T','internalid':'4'},{'ispaypal':'F','name':'VISA','creditcard':'T','internalid':'5'}]}}
	,	configuration: {}
	};

	return TestCasesData;
}); 