/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Utils.js
// --------------------
// Testing Utils.js and functions of Utils.
define(
	[
		'Utils'
	,	'underscore'
	,	'UnitTest.Utils.Preconditions'
	,	'jasmine2-typechecking-matchers'
	,	'Backbone'
	]
	, function (Utils, _, Preconditions)
{
	'use strict';

	beforeEach(function()
	{
		// required SC data
		// Preconditions.deepExtend(window.SC || {}, {
		// 	ENVIRONMENT: {
		// 		siteSettings: {
		// 			shopperCurrency: {
		// 				isdefault: 'T'
		// 			,	languagename: 'English (U.S.)'
		// 			,	locale: 'en_US'
		// 			,	name: 'English (U.S.)'
		// 			}
		// 		}
		// 	}
		// });
		Preconditions.setPreconditions();
	});

	describe('Utils', function () {

		it('should profivde a translate method', function ()
		{
			expect(_.translate).toBeA(Function);
		});

		it('should profivde a formatPhone method', function ()
		{
			expect(Utils.formatPhone).toBeA(Function);
		});

		it('should profivde a formatCurrency method', function ()
		{
			expect(Utils.formatCurrency).toBeA(Function);
		});

		it('should profivde a validatePhone method', function ()
		{
			expect(Utils.validatePhone).toBeA(Function);
		});

		it('should profivde a collectionToString method', function ()
		{
			expect(Utils.collectionToString).toBeA(Function);
		});

		it('should profivde a addParamsToUrl method', function ()
		{
			expect(Utils.addParamsToUrl).toBeA(Function);
		});

	});

	describe('_.translate', function () {

		it('should echo it\'s input if no translations found', function ()
		{
			expect(_('A text').translate()).toBe('A text');
		});

		it('should return a translated string if a translation map is precent in SC.Translations', function ()
		{
			SC.Translations = {'A text': 'Un Texto'};
			expect(_('A text').translate()).toBe('Un Texto');
		});

		it('should be able to mix in variables if configured to do so', function ()
		{
			expect(_('This is a $(0)').translate('Test')).toBe('This is a Test');
		});

		it('should be able to translate texts with mix in variables if configured to do so', function ()
		{
			SC.Translations = {'This is a $(0)': 'Esto es un $(0)'};
			expect(_('This is a $(0)').translate('Test')).toBe('Esto es un Test');
		});

		it('should let me configure the position of the mixin in the text', function ()
		{
			expect(_('$(1) -> $(0)').translate('Test1', 'Test2')).toBe('Test2 -> Test1');
		});

		it('should let me configure the position of the mixin to be different in a translation than the original', function ()
		{
			SC.Translations = {'$(1) -> $(0)': '$(0) -> $(1)'};
			expect(_('$(1) -> $(0)').translate('Test1', 'Test2')).toBe('Test1 -> Test2');
		});

		it('should escape unsafe arguments (unused argument that contain html)', function ()
		{
			SC.Translations = {'This is an XSS attempt': 'Esto es un intento de XSS'};
			expect(_('This is an XSS attempt').translate('<script>alert(1)</script>')).toBe('Esto es un intento de XSS');
		});

		it('should escape unsafe arguments (1 argument that contain html)', function ()
		{
			SC.Translations = {'This is an XSS attempt $(0)': 'Esto es un intento de XSS $(0)'};
			expect(_('This is an XSS attempt $(0)').translate('<script>alert(1)</script>')).toBe('Esto es un intento de XSS &lt;script&gt;alert(1)&lt;/script&gt;');
		});

		it('should escape unsafe arguments (multiple arguments that contain html)', function ()
		{
			SC.Translations = {'This is an XSS attempt $(0) yet other $(1)': 'Esto es un intento de XSS $(1) y otro $(0)'};
			expect(_('This is an XSS attempt $(0) yet other $(1)').translate('<script>alert(1)</script>', '<p onload="alert(1)">xss</p>')).toBe('Esto es un intento de XSS &lt;p onload=&quot;alert(1)&quot;&gt;xss&lt;/p&gt; y otro &lt;script&gt;alert(1)&lt;/script&gt;');
		});

		it('should return an empty string if param falsy', function ()
		{
			expect(_('').translate()).toBe('');
			expect(_(0).translate()).toBe('');
			expect(_(false).translate()).toBe('');
			expect(_(undefined).translate()).toBe('');
			expect(_(null).translate()).toBe('');
		});
	});

	describe('Utils.dateToString', function ()
	{
		it ('should return a date in basic string format', function()
		{
			expect(Utils.dateToString(new Date(2014, 8, 7))).toEqual('2014-09-07');
			expect(Utils.dateToString(new Date(2000, 10, 7))).toEqual('2000-11-07');
			expect(Utils.dateToString(new Date(2014, 8, 12))).toEqual('2014-09-12');
			expect(Utils.dateToString(new Date(2014, 9, 13))).toEqual('2014-10-13');
		});
	});

	describe('Utils.isDateValid', function ()
	{
		it('should return false if pass a number', function()
		{
			expect(Utils.isDateValid(2014)).toBeFalsy();
		});

		it('should return false if pass a string', function()
		{
			expect(Utils.isDateValid('2014-12-20')).toBeFalsy();
		});

		it('should return false if pass undefined', function()
		{
			expect(Utils.isDateValid()).toBeFalsy();
		});

		it('should return false if pass a bool', function()
		{
			expect(Utils.isDateValid(false)).toBeFalsy();
			expect(Utils.isDateValid(true)).toBeFalsy();
		});

		it('should return true if pass a date object in valid state', function()
		{
			expect(Utils.isDateValid(new Date())).toBeTruthy();
		});

		it('should return false if pass a date object in invalid state', function()
		{
			expect(Utils.isDateValid(new Date('pollitos verdes'))).toBeFalsy();
		});
	});

	describe('Utils.formatPhone', function () {


		it('should echo the input if no format is defined', function ()
		{
			expect(Utils.formatPhone('A text')).toBe('A text');
		});

		it('should format a phone number for a given format', function ()
		{
			expect(Utils.formatPhone('0987654321', '(123) 456-7890')).toBe('(098) 765-4321');
		});

		it('should support different formats', function ()
		{
			expect(Utils.formatPhone('0987654321', '(123) 456-7890')).toBe('(098) 765-4321');
			expect(Utils.formatPhone('0987654321', '123 456 7890')).toBe('098 765 4321');
			expect(Utils.formatPhone('0987654321', '123-456-7890')).toBe('098-765-4321');
			expect(Utils.formatPhone('0987654321', '123.456.7890')).toBe('098.765.4321');
		});

		it('should support different input lengths for a given format', function ()
		{
			expect(Utils.formatPhone('110987654321', '(123) 456-7890')).toBe('110987654321');
			expect(Utils.formatPhone('10987654321', '(123) 456-7890')).toBe('1 (098) 765-4321');
			expect(Utils.formatPhone('987654321', '(123) 456-7890')).toBe('987654321');
			expect(Utils.formatPhone('87654321', '(123) 456-7890')).toBe('87654321');
			expect(Utils.formatPhone('7654321', '(123) 456-7890')).toBe('765-4321');
			expect(Utils.formatPhone('654321', '(123) 456-7890')).toBe('654321');
		});

		it('should support common extentions number notations', function ()
		{
			expect(Utils.formatPhone('0987654321 Ext: 100', '(123) 456-7890')).toBe('(098) 765-4321 Ext: 100');
			expect(Utils.formatPhone('0987654321 Ex: 100', '(123) 456-7890')).toBe('(098) 765-4321 Ex: 100');
			expect(Utils.formatPhone('0987654321 #100', '(123) 456-7890')).toBe('(098) 765-4321 #100');
		});


		it('should use the format in the SiteSettings Model if no format is provided directly', function ()
		{
			SC.ENVIRONMENT.siteSettings.phoneformat = '(123) 456-7890';
			expect(Utils.formatPhone('0987654321 Ext: 100')).toBe('(098) 765-4321 Ext: 100');
		});

		it('should ignore the format in the SiteSettings Model if format is provided directly', function ()
		{
			SC.ENVIRONMENT.siteSettings.phoneformat = '(123) 456-7890';
			expect(Utils.formatPhone('0987654321 Ext: 100', '123-456-7890')).not.toBe('(098) 765-4321 Ext: 100');
		});


	});

	describe('Utils.validatePhone', function () {

		it('should echo Phone Number is invalid if the value is numeric and length < 7', function ()
		{
			expect(Utils.validatePhone('123456')).toBe('Phone Number is invalid');
		});

		it('should echo Phone Number is invalid if the value is not numeric and length > 7', function ()
		{
			expect(Utils.validatePhone('1234567abc')).toBe('Phone Number is invalid');
		});

		it('should echo Phone Number is invalid if the value is numeric and length >= 7, but 6 numbers and one or more spaces', function ()
		{
			expect(Utils.validatePhone('12345 6')).toBe('Phone Number is invalid');
		});

		it('should no return if the value is numeric and length > 7', function ()
		{
			expect(Utils.validatePhone('1234567')).not.toBeDefined();
		});
		it('should no return if the value is a number and length > 7', function ()
		{
			expect(Utils.validatePhone(1234567)).not.toBeDefined();
		});
		it('should no return if the value is a number and length <= 7', function ()
		{
			expect(Utils.validatePhone(1234)).toBe('Phone Number is invalid');
			expect(Utils.validatePhone(123456)).toBe('Phone Number is invalid');
		});
		it('should behave correctly with leading zeros', function ()
		{
			expect(Utils.validatePhone('0123456')).toBe('Phone Number is invalid');
			expect(Utils.validatePhone('01234567')).not.toBeDefined();
		});
		it('should invalidate with invalid input', function ()
		{
			expect(Utils.validatePhone(null)).toBe('Phone is required');
			expect(Utils.validatePhone('')).toBe('Phone is required');
		});
	});

	describe('Utils.formatCurrency', function ()
	{
		beforeEach(function()
		{
			Preconditions.setPreconditions();
		});

		it('should return a formated version of number', function ()
		{
			expect(Utils.formatCurrency(10)).toBe('$10.00');
		});

		it('should round decimal numbers', function ()
		{
			expect(Utils.formatCurrency(10 / 3)).toBe('$3.33');
		});

		it('should allow me to pass in the Symbol', function ()
		{
			expect(Utils.formatCurrency(10, '£')).toBe('£10.00');
		});

		it('should use the Symbol in the SiteSettings Model if present', function ()
		{
			// SC.ENVIRONMENT.siteSettings.shopperCurrency = SC.ENVIRONMENT.siteSettings.shopperCurrency || {};
			SC.ENVIRONMENT.siteSettings.shopperCurrency.symbol = '£';
			expect(Utils.formatCurrency(10)).toBe('£10.00');
		});

		it('should ignore the Symbol in the SiteSettings Model if passed directly', function ()
		{
			SC.ENVIRONMENT.siteSettings.shopperCurrency.symbol = '€';
			expect(Utils.formatCurrency(10, '¥')).toBe('¥10.00');
		});
	});

	describe('Utils.collectionToString', function () {

		var getValue = function (sort)
		{
			return sort.field + ':' + sort.dir;
		};

		it('should return a string', function ()
		{
			expect(Utils.collectionToString({collection:[{field: 'price', dir: 'desc'}], getValue: getValue, joinWith: ','})).toBe('price:desc');
		});

		it('should return a string', function ()
		{
			expect(Utils.collectionToString({collection:[{field: 'price',dir: 'desc'},{field: 'created',dir: 'asc'}], getValue:getValue, joinWith:','})).toBe('price:desc,created:asc');
		});

		it('should return an empty string', function ()
		{
			expect(Utils.collectionToString({collection:[], getValue:getValue, joinWith:','})).toBe('');
		});

		it('should return an empty string', function ()
		{
			expect(Utils.collectionToString({collection:null, getValue:getValue, joinWith:','})).toBe('');
		});
	});


	describe('Utils.addParamsToUrl', function ()
	{
		var config = {
			include: 'facets'
		,	fieldset: 'search'
		};

		it('adding parameters to url without parameters', function ()
		{
			var baseUrl = '/api/items';
			var baseUrlWithParams = Utils.addParamsToUrl(baseUrl, config);
			expect(baseUrlWithParams).toBe('/api/items?include=facets&fieldset=search');
		});

		it('adding parameters to url with parameters', function ()
		{
			var baseUrl = '/api/items?test=value';
			var baseUrlWithParams = Utils.addParamsToUrl(baseUrl, config);
			expect(baseUrlWithParams).toBe('/api/items?test=value&include=facets&fieldset=search');
		});

		it('empty parameters should not change the url', function ()
		{
			// arrange
			var empty_config = {}
			,	base_url1 = '/api/items?test=value'
			,	base_url2 = '/api/items';

			// act
			var result1 = Utils.addParamsToUrl(base_url1, empty_config)
			,	result2 = Utils.addParamsToUrl(base_url2, empty_config);

			// assert
			expect(result1).toEqual(result1);
			expect(result2).toEqual(result2);
		});
	});


	describe('Utils.parseUrlOptions', function ()
	{
		it('parseUrlOptions should be able to parse url options from absolute url', function ()
		{
			var completeUrl = 'https://checkout.netsuite.com/c.3690872/checkout/index.ssp?is=login&n=3&login=T&c=12345#login-register'
			,	options = Utils.parseUrlOptions(completeUrl);

			expect(options.is).toBe('login');
			expect(options.n).toBe('3');
			expect(options.login).toBe('T');
			expect(options.c).toBe('12345');
		});

		it('parseUrlOptions should be able to parse url options from relative url', function ()
		{
			var completeUrl = 'api/items?c=123123&n=3&fieldset=search#somehash'
			,	options = Utils.parseUrlOptions(completeUrl);

			expect(options.n).toBe('3');
			expect(options.fieldset).toBe('search');
			expect(options.c).toBe('123123');
		});

		it('parseUrlOptions should return empty object for empty input', function ()
		{
			var options = Utils.parseUrlOptions(null);
			expect(options).toEqual({});
		});
	});

	describe('Utils.stringToDate', function ()
	{
		it('should parse the string correctly in default format', function ()
		{
			var d = Utils.stringToDate('2014-09-19');
			expect(d.getDate()).toBe(19);
			expect(d.getMonth()).toBe(8); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = Utils.stringToDate('2014-12-31');
			expect(d.getDate()).toBe(31);
			expect(d.getMonth()).toBe(11); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = Utils.stringToDate('2014-13-31');
			expect(d).toBe(undefined); // This should fail as it contains invalid month

			// Testing leap years
			d = Utils.stringToDate('2014-2-29');
			expect(d).toBe(undefined);
			// Testing leap years
			d = Utils.stringToDate('2016-2-29');
			expect(d.getDate()).toBe(29);
			expect(d.getMonth()).toBe(1); //Months start at 0
			expect(d.getFullYear()).toBe(2016);
		});

		it('should parse the string correctly in given format', function ()
		{
			var d = Utils.stringToDate('19-09-2014',{format:'dd-MM-YYYY'});
			expect(d.getDate()).toBe(19);
			expect(d.getMonth()).toBe(8); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = Utils.stringToDate('31-12-2014',{format:'dd-MM-YYYY'});
			expect(d.getDate()).toBe(31);
			expect(d.getMonth()).toBe(11); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = Utils.stringToDate('31-13-2014',{format:'dd-MM-YYYY'});
			expect(d).toBe(undefined); // This should fail as it contains invalid month

			// Testing leap years
			d = Utils.stringToDate('29-2-2014',{format:'dd-MM-YYYY'});
			expect(d).toBe(undefined);
			// Testing leap years
			d = Utils.stringToDate('29-2-2016',{format:'dd-MM-YYYY'});
			expect(d.getDate()).toBe(29);
			expect(d.getMonth()).toBe(1); //Months start at 0
			expect(d.getFullYear()).toBe(2016);
		});

		it('should not parse dates with a different separator (/)', function ()
		{
			var d = Utils.stringToDate('19/09/2014',{format:'dd/MM/YYYY'});
			expect(d).toBe(undefined);
		});
	});

	xdescribe('Utils.paymenthodIdCreditCart', function ()
	{
		it('should not parse unlisted payment methods regardless of card', function ()
		{
			//VISA
			expect(Utils.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(Utils.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(Utils.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(Utils.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(Utils.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(Utils.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);


		});

		it('should correctly recognize VISA cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'VISA',internalid:1}];
			//VISA
			expect(Utils.paymenthodIdCreditCart('4111111111111')).toBe(1);
			expect(Utils.paymenthodIdCreditCart('4111111111111222')).toBe(1);
			//Master card
			expect(Utils.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(Utils.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(Utils.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(Utils.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(Utils.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('should correctly recognize Master card cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'Master Card',internalid:2}];
			//VISA
			expect(Utils.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(Utils.paymenthodIdCreditCart('5112345678901234')).toBe(2);
			expect(Utils.paymenthodIdCreditCart('5599999999999999')).toBe(2);
			//American express
			expect(Utils.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(Utils.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(Utils.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(Utils.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('should correctly recognize American Express cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'American Express',internalid:3}];
			//VISA
			expect(Utils.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(Utils.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(Utils.paymenthodIdCreditCart('340000000000000')).toBe(3);
			expect(Utils.paymenthodIdCreditCart('379999999999999')).toBe(3);
			//Discover
			expect(Utils.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(Utils.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(Utils.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('should correctly recognize Discover cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'Discover',internalid:4}];
			//VISA
			expect(Utils.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(Utils.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(Utils.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(Utils.paymenthodIdCreditCart('6011123456789012')).toBe(4);
			expect(Utils.paymenthodIdCreditCart('6509123456789012')).toBe(4);
			//Maestro
			expect(Utils.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(Utils.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('should correctly recognize Maestro cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'Maestro',internalid:5}];
			//VISA
			expect(Utils.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(Utils.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(Utils.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(Utils.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(Utils.paymenthodIdCreditCart('501201234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('560901234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('574501234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('587701234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('630401234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('639001234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('670901234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('679001234567')).toBe(5);

			expect(Utils.paymenthodIdCreditCart('5012012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('5609012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('5745012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('5877012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6304012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6390012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6709012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6790012345671234567')).toBe(5);

			//Other invalid types
			expect(Utils.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(Utils.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('should correctly recognize all cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [	{name:'VISA',internalid:1}
														,	{name:'Master Card',internalid:2}
														,	{name:'American Express',internalid:3}
														,	{name:'Discover',internalid:4}
														,	{name:'Maestro',internalid:5}];
			//VISA
			expect(Utils.paymenthodIdCreditCart('4111111111111')).toBe(1);
			expect(Utils.paymenthodIdCreditCart('4111111111111222')).toBe(1);
			//Master card
			expect(Utils.paymenthodIdCreditCart('5112345678901234')).toBe(2);
			expect(Utils.paymenthodIdCreditCart('5599999999999999')).toBe(2);
			//American express
			expect(Utils.paymenthodIdCreditCart('340000000000000')).toBe(3);
			expect(Utils.paymenthodIdCreditCart('379999999999999')).toBe(3);
			//Discover
			expect(Utils.paymenthodIdCreditCart('6011123456789012')).toBe(4);
			expect(Utils.paymenthodIdCreditCart('6509123456789012')).toBe(4);
			//Maestro
			expect(Utils.paymenthodIdCreditCart('501201234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('560901234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('574501234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('587701234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('630401234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('639001234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('670901234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('679001234567')).toBe(5);

			expect(Utils.paymenthodIdCreditCart('5012012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('5609012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('5745012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('5877012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6304012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6390012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6709012345671234567')).toBe(5);
			expect(Utils.paymenthodIdCreditCart('6790012345671234567')).toBe(5);

			//Other invalid types
			expect(Utils.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);


			expect(Utils.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('should correctly not recognize invalid input', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [	{name:'VISA',internalid:1}
														,	{name:'Master Card',internalid:2}
														,	{name:'American Express',internalid:3}
														,	{name:'Discover',internalid:4}
														,	{name:'Maestro',internalid:5}];

			expect(Utils.paymenthodIdCreditCart(null)).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart(1234567891234)).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart({})).toBe(undefined);
			expect(Utils.paymenthodIdCreditCart([])).toBe(undefined);
		});
	});

	describe('Utils.validateSecurityCode', function ()
	{
		it('should validate security number correctly',function(){
			expect(Utils.validateSecurityCode('123')).toBe(undefined);
			expect(Utils.validateSecurityCode('4567')).toBe(undefined);
			expect(Utils.validateSecurityCode('000')).toBe(undefined);
		});

		it('should validate security number correctly',function(){
			expect(Utils.validateSecurityCode(null).length).toBeGreaterThan(0);
			expect(Utils.validateSecurityCode({}).length).toBeGreaterThan(0);
			expect(Utils.validateSecurityCode([]).length).toBeGreaterThan(0);
			expect(Utils.validateSecurityCode('aaa').length).toBeGreaterThan(0);
			expect(Utils.validateSecurityCode('01234').length).toBeGreaterThan(0);
			expect(Utils.validateSecurityCode('01234345345').length).toBeGreaterThan(0);
			expect(Utils.validateSecurityCode('01').length).toBeGreaterThan(0);
		});
	});

	describe('Utils.validateState', function ()
	{
		it('should approve all states when no country states set',function(){
			expect(Utils.validateState(null,null,{country:'US'})).toBe(undefined);
			expect(Utils.validateState(0,null,{country:'US'})).toBe(undefined);
			expect(Utils.validateState('',null,{country:'US'})).toBe(undefined);
			expect(Utils.validateState('WA',null,{country:'US'})).toBe(undefined);
		});

		it('should display an error if the country has states but the value is empty',function(){
			SC.ENVIRONMENT.siteSettings.countries = {'US':{states:[]}};
			expect(Utils.validateState(null,null,{country:'US'})).toBe(undefined);
			expect(Utils.validateState(0,null,{country:'US'})).toBe(undefined);
			expect(Utils.validateState('',null,{country:'US'})).toBe('State is required');
			expect(Utils.validateState('WA',null,{country:'US'})).toBe(undefined);
		});
	});

	describe('Utils.validateZipcode', function ()
	{
		it('should approve all zipcodes when no country states set',function()
		{
			expect(Utils.validateZipCode(null,null,{country:'US'})).toBe(undefined);
			expect(Utils.validateZipCode(0,null,{country:'US'})).toBe(undefined);
			expect(Utils.validateZipCode('',null,{country:'US'})).toBe(undefined);
			expect(Utils.validateZipCode('11800',null,{country:'US'})).toBe(undefined);
		});

		it('should display an error if the country zipcode is required but the value is empty',function()
		{
			SC.ENVIRONMENT.siteSettings.countries = {'US':{isziprequired:'T'}};
			expect(Utils.validateZipCode(null,null,{country:'US'})).toBe('Zip Code is required');
			expect(Utils.validateZipCode(0,null,{country:'US'})).toBe(undefined);
			expect(Utils.validateZipCode('',null,{country:'US'})).toBe('Zip Code is required');
			expect(Utils.validateZipCode('WA',null,{country:'US'})).toBe(undefined);
		});
	});

	describe('Utils.getFullPathForElement ', function ()
	{
		it('should give full path for basic elements',function()
		{
			expect(Utils.getFullPathForElement(document.body)).toBe('HTML > BODY');
			expect(Utils.getFullPathForElement(document.head || document.getElementsByTagName('head')[0])).toBe('HTML > HEAD');
			expect(Utils.getFullPathForElement(document.documentElement)).toBe('HTML');
		});

		it('should give full path for inserted elements',function()
		{
			var el = document.createElement('div');
			el.setAttribute('id','myDiv');
			var el2 = document.createElement('span');
			el.appendChild(el2);
			var el3 = document.createElement('ul');
			el2.appendChild(el3);
			document.body.appendChild(el);
			expect(Utils.getFullPathForElement(el)).toBe('#myDiv');
			expect(Utils.getFullPathForElement(el2)).toBe('#myDiv > SPAN:nth-child(1)');
			expect(Utils.getFullPathForElement(el3)).toBe('#myDiv > SPAN:nth-child(1) > UL:nth-child(1)');
		});
	});

	describe('Utils.formatQuantity', function ()
	{
		it('should correctly format a number string',function(){
			expect(Utils.formatQuantity('')).toBe('');
			expect(Utils.formatQuantity(null)).toBe('n,ull');
			expect(Utils.formatQuantity([])).toBe('');
			expect(Utils.formatQuantity('0')).toBe('0');
			expect(Utils.formatQuantity('12')).toBe('12');
			expect(Utils.formatQuantity('123')).toBe('123');
			expect(Utils.formatQuantity('1234')).toBe('1,234');
			expect(Utils.formatQuantity('1234.0')).toBe('1,234.0');
			expect(Utils.formatQuantity('1234.00')).toBe('1,234.00');
			expect(Utils.formatQuantity('01234.00')).toBe('01,234.00');
			expect(Utils.formatQuantity(0)).toBe('0');
			expect(Utils.formatQuantity(12)).toBe('12');
			expect(Utils.formatQuantity(123)).toBe('123');
			expect(Utils.formatQuantity(1234)).toBe('1,234');
			expect(Utils.formatQuantity(1234.0)).toBe('1,234');
			expect(Utils.formatQuantity(1234.00)).toBe('1,234');
			expect(Utils.formatQuantity(1234.1)).toBe('1,234.1');
			expect(Utils.formatQuantity(1234.15)).toBe('1,234.15');
		});
	});

	describe('Utils.highlightKeyword', function ()
	{
		it('should correctly highlight a keyword',function(){
			expect(Utils.highlightKeyword('dábale arroz a la zorra el abad',null)).toBe('dábale arroz a la zorra el abad');
			expect(Utils.highlightKeyword('dábale arroz a la zorra el abad','')).toBe('dábale arroz a la zorra el abad');
			expect(Utils.highlightKeyword('dábale arroz a la zorra el abad',0)).toBe('dábale arroz a la zorra el abad');
			expect(Utils.highlightKeyword('','arroz')).toBe('');
			expect(Utils.highlightKeyword(null,'arroz')).toBe('');
			expect(Utils.highlightKeyword('dábale arroz a la zorra el abad','arroz')).toBe('dábale <strong>arroz</strong> a la zorra el abad');
			expect(Utils.highlightKeyword('dábale arroz a la zorra el abad arroz','arroz')).toBe('dábale <strong>arroz</strong> a la zorra el abad <strong>arroz</strong>');
			expect(Utils.highlightKeyword('dábale arrozarroz a la zorra el abad arroz','arroz')).toBe('dábale <strong>arroz</strong><strong>arroz</strong> a la zorra el abad <strong>arroz</strong>');
		});

		it('should escape unsafe text', function ()
		{
			expect(Utils.highlightKeyword('dábale arroz a la <script>alert(1)</script> el abad',null)).toBe('dábale arroz a la &lt;script&gt;alert(1)&lt;/script&gt; el abad');
		});

		it('should escape unsafe text and highlight correctly', function ()
		{
			expect(Utils.highlightKeyword('dábale <p onload="alert(1)">xss</p> arroz a la <script>alert(1)</script> el abad', 'abad')).toBe('dábale &lt;p onload=&quot;alert(1)&quot;&gt;xss&lt;/p&gt; arroz a la &lt;script&gt;alert(1)&lt;/script&gt; el <strong>abad</strong>');
		});
	});

	describe('Utils.objectToAtrributes', function ()
	{
		it('should correctly display ellipsis animation',function(){
			expect(Utils.objectToAtrributes()).toBe('');
			expect(Utils.objectToAtrributes({})).toBe('');
			expect(Utils.objectToAtrributes({data:'1'})).toBe(' data="1"');
			expect(Utils.objectToAtrributes({a:1})).toBe(''); //a is not supported attribute
			expect(Utils.objectToAtrributes({data:{a:1}})).toBe(''); //data-a is not supported attribute
			expect(Utils.objectToAtrributes({data:{hashtag:'foo'}})).toBe(' data-hashtag="foo"');
			// expect(Utils.objectToAtrributes(null,'%')).toBe('');
			// expect(Utils.objectToAtrributes({},'%')).toBe('');
			// expect(Utils.objectToAtrributes({a:'a'},'%')).toBe(' %-a="a"');
			// expect(Utils.objectToAtrributes({a:1,b:2,c:{a:1}},'%')).toBe(' %-a="1" %-b="2" %- c-a="1"');
		});

		it('should escape unsafe attributes', function()
		{
			var object = {
				href: '<script>alert(1)</script>',
				title: 'the gummy wizard <script>alert(1)</script>',
				data: {
					hashtag: '<p onload="alert(60)">got life?</p>',
					touchpoint: 'https://something.lalalal.com?keyword=<script>alert("owned!")</script>'
				},
				id: ['one', 'two', '!!<script>alert(1)</script>']
			};
			expect(Utils.objectToAtrributes(object)).toBe(' href="&lt;script&gt;alert(1)&lt;/script&gt;" title="the gummy wizard &lt;script&gt;alert(1)&lt;/script&gt;" data-hashtag="&lt;p onload=&quot;alert(60)&quot;&gt;got life?&lt;/p&gt;" data-touchpoint="https://something.lalalal.com?keyword=&lt;script&gt;alert(&quot;owned!&quot;)&lt;/script&gt;"');
		});
	});

	xdescribe('Utils.ellipsis', function ()
	{
		it('should correctly display ellipsis animation',function(done)
		{
			var el = document.createElement('div');
			el.setAttribute('id','ellipsis');
			document.body.appendChild(el);
			Utils.ellipsis('#ellipsis');
			var values = ['', '.', '..', '...', '..', '.'];
			var i = 0;
			var t = setInterval(function ()
			{
				var $el = jQuery('#ellipsis');
				expect($el.html()).toBe(values[i++]);
				if(i === values.length)
				{
					$el.remove();
					clearInterval(t);
					done();
				}
			},250);
		});
	});

	describe('Utils.getWindow',function()
	{
		it('should return the window element',function(){
			expect(Utils.getWindow()).toBe(window);
		});
	});

	describe('Utils.resizeImage',function()
	{
		it('should resize images changing the url',function()
		{
			expect(Utils.resizeImage([{name:'small',urlsuffix:'_small'}],'img.jpg','big')).toBe('img.jpg');
			expect(Utils.resizeImage([],'img.jpg','big')).toBe('img.jpg');
			expect(Utils.resizeImage(null,'img.jpg','big')).toBe('img.jpg');
			expect(Utils.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg','small')).toBe('img.jpg?_small');
			expect(Utils.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg','big')).toBe('img.jpg?_big');
			expect(Utils.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg?param=val','small')).toBe('img.jpg?param=val&_small');
			expect(Utils.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg?param=val','big')).toBe('img.jpg?param=val&_big');

		});
	});

	describe('Utils.getAbsoluteUrl',function()
	{
		it('should correctly prepend the domain to form the absolute url',function()
		{
			delete SC.ENVIRONMENT.baseUrl //= '{{file}}';
			expect(Utils.getAbsoluteUrl(null)).toBe(null);
			expect(Utils.getAbsoluteUrl('')).toBe('');
			expect(Utils.getAbsoluteUrl('/test/url')).toBe('/test/url');
			SC.ENVIRONMENT.baseUrl = 'http://netsuite.com';
			expect(Utils.getAbsoluteUrl(null)).toBe('http://netsuite.com');
			expect(Utils.getAbsoluteUrl('')).toBe('http://netsuite.com');
			expect(Utils.getAbsoluteUrl('/test/url')).toBe('http://netsuite.com');
			SC.ENVIRONMENT.baseUrl = 'http://netsuite.com{{file}}';
			expect(Utils.getAbsoluteUrl(null)).toBe('http://netsuite.com');
			expect(Utils.getAbsoluteUrl('')).toBe('http://netsuite.com');
			expect(Utils.getAbsoluteUrl('/test/url')).toBe('http://netsuite.com/test/url');
		});
	});

	describe('Utils.getDownloadPdfUrl',function()
	{
		it('should return the pdf download url',function(){
			SC.ENVIRONMENT.baseUrl = '/{{file}}';
			expect(Utils.getDownloadPdfUrl()).toContain('/download.ssp?n=');
			expect(Utils.getDownloadPdfUrl({param1:2})).toContain('/download.ssp?param1=2&n=');
			SC.ENVIRONMENT.siteSettings.siteid = 3;
			expect(Utils.getDownloadPdfUrl()).toContain('/download.ssp?n=3');
			expect(Utils.getDownloadPdfUrl({param1:2})).toContain('/download.ssp?param1=2&n=3');
		});
	});

	describe('Utils.getPathFromObject',function()
	{
		it('should return the value located at path in the object or the default if no path found',function(){
			expect(Utils.getPathFromObject()).toBe(undefined);
			expect(Utils.getPathFromObject(null,null,null)).toBe(null);

			var empty = {};
			var obj3 = {d:2};
			var obj2 = {b:1,c:obj3};
			var obj1 = {a:obj2};


			expect(Utils.getPathFromObject(empty,null)).toBe(empty);
			expect(Utils.getPathFromObject(empty,'')).toEqual(empty);
			expect(Utils.getPathFromObject(obj1,'a')).toBe(obj2);
			expect(Utils.getPathFromObject(obj1,'a.b')).toEqual(1);
			expect(Utils.getPathFromObject(obj1,'a.c')).toBe(obj3);
			expect(Utils.getPathFromObject(obj1,'a.c.d')).toEqual(2);
			expect(Utils.getPathFromObject(obj1,'x')).toBe(undefined);
			expect(Utils.getPathFromObject(obj1,'x','default')).toBe('default');
		});
	});

	describe('Utils.reorderUrlParams',function()
	{
		it('should correctly sort url parameters',function()
		{
			expect(Utils.reorderUrlParams('')).toBe('');
			expect(Utils.reorderUrlParams('http://netsuite.com')).toBe('http://netsuite.com');
			expect(Utils.reorderUrlParams('http://netsuite.com?z=1')).toBe('http://netsuite.com?z=1');
			expect(Utils.reorderUrlParams('http://netsuite.com?z=1&a=2')).toBe('http://netsuite.com?a=2&z=1');
			expect(Utils.reorderUrlParams('http://netsuite.com?z=1&t=20&a=2')).toBe('http://netsuite.com?a=2&t=20&z=1');
		});
	});

	describe('Utils.getSessionParams', function ()
	{
		it('should be defined', function ()
		{
			expect(Utils.getSessionParams).toBeA(Function);
		});

		it('should return empty object if no session params', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&t=20&a=2'
			,	expected = {};

			// act
			var result = Utils.getSessionParams(url);

			// arrange
			expect(result).toEqual(expected);
		});

		it('should return object with ck and cktime defined', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&ck=12345abcdef&t=20&a=2&cktime=321'
			,	expected = '321';

			// act
			var result = Utils.getSessionParams(url);

			// arrange
			expect(result.ck).toEqual('12345abcdef');
			expect(result.cktime).toEqual(expected);
		});

	});

	describe('Utils.getParameterByName', function ()
	{
		it('should be defined', function ()
		{
			expect(Utils.getParameterByName).toBeA(Function);
		});

		it('should be empty if no param by name', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&ck=12345abcdef&t=20&a=2&cktime=321'
			,	expected = '';

			// act
			var result = Utils.getParameterByName(url, 'anything');

			// assert
			expect(result).toEqual(expected);
		});

		it('should be param value if name matches', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&ck=12345abcdef&t=20&a=2&cktime=321'
			,	expected = '20';

			// act
			var result = Utils.getParameterByName(url, 't');

			// assert
			expect(result).toEqual(expected);
		});

	});

	describe('format quantity tests', function()
	{
		it('should have a formatQuantity function defined', function ()
		{
			expect(Utils.formatQuantity).toBeA(Function);
		});

		it('should format numbers < 1000 without commas', function()
		{
			expect(Utils.formatQuantity(8)).toBe('8');
			expect(Utils.formatQuantity(56)).toBe('56');
			expect(Utils.formatQuantity(345)).toBe('345');
		});

		it('should format numbers > 1000 with a comma', function()
		{
			expect(Utils.formatQuantity(12431)).toBe('12,431');
			expect(Utils.formatQuantity(5621)).toBe('5,621');
			expect(Utils.formatQuantity(678345)).toBe('678,345');
		});

		it('should format with a comma on every thousand', function()
		{
			expect(Utils.formatQuantity(12431567)).toBe('12,431,567');
			expect(Utils.formatQuantity(562156215621)).toBe('562,156,215,621');
			expect(Utils.formatQuantity(6978345678345)).toBe('6,978,345,678,345');
		});

		it('should take into account decimals', function()
		{
			expect(Utils.formatQuantity(1243.1567)).toBe('1,243.1567');
			expect(Utils.formatQuantity(562.156215621)).toBe('562.156215621');
			expect(Utils.formatQuantity(697834567834.5)).toBe('697,834,567,834.5');
		});

		it('does not consider special cases: negative numbers, numbers with exponents, infinities', function ()
		{
			expect(Utils.formatQuantity(NaN)).toBe('NaN');
		});
	});

	describe('deep copy tests', function()
	{
		it('should return null if its called for a function', function()
		{
			expect(Utils.deepCopy(function(){})).toBe(null);
		});

		it('should return the identity if its called for a basic type', function()
		{
			var number = 1;
			expect(Utils.deepCopy(number)).toEqual(number);

			var string = 'string';
			expect(Utils.deepCopy(string)).toEqual(string);

			var boolean = true;
			expect(Utils.deepCopy(boolean)).toEqual(boolean);

			expect(Utils.deepCopy(undefined)).toBeUndefined();
		});

		it('should return the identity if its called for an array of basic types', function()
		{
			var collection = [1, 'string', true, undefined];
			expect(Utils.deepCopy(collection)).toEqual(collection);
		});

		it('should ignore functions and private attributes', function()
		{
			var obj = {
				fn: function(){}
			,	_private_fn: function(){}
			,	_private: 'private'
			,	number: 1
			};
			expect(Utils.deepCopy(obj)).toEqual({number: 1});
		});

		it('should return a copy of an object with nested objects with functions attributes, undefined attributes and basic type attributes', function()
		{
			var obj = {
					fn: function(){}
				,	_private_fn: function(){}
				,	_private: 'private'
				,	number: 1
				,	nested: {
						string: 'string'
					,	_private: true
					,	n: null
					,	collection: [
							{
								fn: function(){}
							,	_private_fn: function(){}
							,	number: 1
							,	obj: {
									bool: false
								}
							,	und: undefined
							}
						,	{
								collection: []
							,	_private: [
									{
										string: 'string'
									}
								,	{}
								]
							}
						]
					,	obj: {
							empty: {}
						,	fn: function(){}
						}
					}
				}

		   ,	expected_obj = {
					number: 1
				,	nested: {
						string: 'string'
					,	n: null
					,	collection: [
							{
								number: 1
							,	obj: {
									bool: false
								}
							,	und: undefined
							}
						,	{
								collection: []
							}
						]
					,	obj: {
							empty: {}
						}
					}
				};

			expect(Utils.deepCopy(obj)).toEqual(expected_obj);
		});

		it('should return a copy of attributes for a backbone model', function()
		{
			var Obj = Backbone.Model.extend({})

			,	obj = new Obj({
					number: 4
				,	string: 'string'
				,	bool: false
				,	un: undefined
				,	_private: 'private'
				,	obj: {
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	fn: function(){}
					}
				})

			,	expected_obj = {
					number: 4
				,	string: 'string'
				,	bool: false
				,	un: undefined
				,	obj: {
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					}
				};

			expect(Utils.deepCopy(obj)).toEqual(expected_obj);
		});

		it('should return a copy of attributes for the backbone models in a backbone collection', function()
		{
			var Obj = Backbone.Model.extend({})
			,	Collection = Backbone.Collection.extend({
					model: Obj
				})

			,	collection = new Collection()

			,	obj1 = new Obj({
					number: 4
				,	string: 'string'
				,	bool: false
				,	un: undefined
				,	_private: 'private'
				,	obj: {
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	fn: function(){}
					}
				})
			,	obj2 = new Obj({
					number: 7
				,	string: 'string1'
				,	bool: false
				,	un: undefined
				,	_private: 'private'
				,	obj: {
						number: 4
					,	string: 'string1'
					,	bool: true
					,	un: undefined
					,	_private: 'private'
					,	fn: function(){}
					}
				});

			collection.add(obj1);
			collection.add(obj2);

			var expected_obj = [
				{
					number: 4
				,	string: 'string'
				,	bool: false
				,	un: undefined
				,	obj: {
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					}
				}
			,	{
					number: 7
				,	string: 'string1'
				,	bool: false
				,	un: undefined
				,	obj: {
						number: 4
					,	string: 'string1'
					,	bool: true
					,	un: undefined
					}
				}
			];

			expect(Utils.deepCopy(collection)).toEqual(expected_obj);
		});

		it('should return a copy of an object with nested backbone models, backbone collections, functions attributes, undefined attributes and basic type attributes', function()
		{
			var Obj = Backbone.Model.extend({})
			,	Collection = Backbone.Collection.extend({
					model: Obj
				})

			,	collection = new Collection()

			,	obj1 = new Obj({
					number: 4
				,	string: 'string'
				,	bool: false
				,	un: undefined
				,	_private: 'private'
				,	obj: {
						number: 4
					,	string: 'string'
					,	bool: false
					,	un: undefined
					,	_private: 'private'
					,	fn: function(){}
					}
				})
			,	obj2 = new Obj({
					number: 7
				,	string: 'string1'
				,	bool: false
				,	un: undefined
				,	_private: 'private'
				,	obj: {
						number: 4
					,	string: 'string1'
					,	bool: true
					,	un: undefined
					,	_private: 'private'
					,	fn: function(){}
					}
				});

			collection.add(obj1);
			collection.add(obj2);

			var obj = {
				fn: function(){}
			,	_private_fn: function(){}
			,	_private: 'private'
			,	number: 1
			,	nested: {
					string: 'string'
				,	_private: true
				,	n: null
				,	collection: [
						{
							fn: function(){}
						,	_private_fn: function(){}
						,	number: 1
						,	obj: {
								bool: false
							}
						,	und: undefined
						}
					,	{
							collection: []
						,	_private: [
								{
									string: 'string'
								}
							,	{}
							]
						}
					,	{
							col: collection
						}
					]
				,	obj: {
						empty: {}
					,	fn: function(){}
					}
				}
			}

			,	expected_obj =  {
					number: 1
				,	nested: {
						string: 'string'
					,	n: null
					,	collection: [
							{
								number: 1
							,	obj: {
									bool: false
								}
							,	und: undefined
							}
						,	{
								collection: []
							}
						,	{
								col: [
									{
										number: 4
									,	string: 'string'
									,	bool: false
									,	un: undefined
									,	obj: {
											number: 4
										,	string: 'string'
										,	bool: false
										,	un: undefined
										}
									}
								,	{
										number: 7
									,	string: 'string1'
									,	bool: false
									,	un: undefined
									,	obj: {
											number: 4
										,	string: 'string1'
										,	bool: true
										,	un: undefined
										}
									}
								]
							}
						]
				,	obj: {
						empty: {}
					}
				}
			};

			expect(Utils.deepCopy(obj)).toEqual(expected_obj);
		});

	});

});
