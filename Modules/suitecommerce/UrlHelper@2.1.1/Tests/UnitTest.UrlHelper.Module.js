/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'UrlHelper'
	,	'underscore'
	]
,	function (
		UrlHelper
	,	_
	)
{
	'use strict';
	
	describe('Function: _.fixUrl - Listening only one token', function ()
	{		
		beforeEach(function ()
		{
			UrlHelper.clearValues();
			UrlHelper.addTokenListener('locale', true);
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
		});
		
		it('external url', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293';
			var result = _.fixUrl(url);
			expect(url).toBe(result);
		});
		
		it('internal url with parameters', function ()
		{
			var result = _.fixUrl('#search?test=1&url=392&promocode=39293');
			expect(result).toBe('#search?test=1&url=392&promocode=39293&locale=es');
		});

		it('internal url without parameters', function ()
		{
			var result = _.fixUrl('#search');
			expect(result).toBe('#search?locale=es');
		});

		it('internal url with parameters and locale parameter is set', function ()
		{
			var result = _.fixUrl('#search?test=1&url=392&promocode=39293&locale=pt');
			expect(result).toBe('#search?test=1&url=392&promocode=39293&locale=pt');
		});

	
	});


	describe('Function: _.fixUrl - Listening two token', function ()
	{
		beforeEach(function ()
		{
			UrlHelper.clearValues();
			UrlHelper.addTokenListener('promocode', true);
			UrlHelper.addTokenListener('locale', true);
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
		});
		
		it('external url', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293';
			var result = _.fixUrl(url);
			expect(url).toBe(result);
		});
		
		it('internal url with parameters', function ()
		{
			var result = _.fixUrl('#search?test=1&url=392');
			expect(result).toBe('#search?test=1&url=392&promocode=39293&locale=es');
		});

		it('internal url without parameters', function ()
		{
			var result = _.fixUrl('#search');
			expect(result).toBe('#search?promocode=39293&locale=es');
		});

		it('internal url with parameters and locale parameter is set', function ()
		{
			var result = _.fixUrl('#search?test=1&url=392&locale=pt');
			expect(result).toBe('#search?test=1&url=392&locale=pt&promocode=39293');
		});

		it('internal url with parameters and promocode parameter is set', function ()
		{
			var result = _.fixUrl('#search?test=1&url=392&promocode=different');
			expect(result).toBe('#search?test=1&url=392&promocode=different&locale=es');
		});

	
	});
	
	describe('Module: UrlHelper - Listening one token, set url without value for the token', function ()
	{		
		var test;
		beforeEach(function ()
		{
			UrlHelper.clearValues();
			test = {
				fn : function ()
				{ 
					return true;
				}
			};
			spyOn(test, 'fn');
			UrlHelper.addTokenListener('locale', true);
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&locale=es');
		});
		
		it('function in Listener should not have been called', function ()
		{
			expect(test.fn).not.toHaveBeenCalled();
		});	
	});

	describe('Function: _.setUrlParameter', function ()
	{		
		it('url with parameters, add new value.', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
		});

		it('url with parameters, edit value.', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=pt';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
		});		
		
		it('url without parameters, add new parameter', function ()
		{
			var url = 'http://www.netsuite.com';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?locale=es');
		});
		
		it('url with only one parameter, edit this parameter', function ()
		{
			var url = 'http://www.netsuite.com?locale=pt';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?locale=es');
		});
	});


	describe('Function: _.removeUrlParameter', function () 
	{		
		it('url without parameters', function ()
		{
			var url = 'http://www.netsuite.com';
			var result = _.removeUrlParameter(url, 'locale');
			expect(result).toBe('http://www.netsuite.com');
		});

		it('url with parameters and the parameter to remove is the last', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es';
			var result = _.removeUrlParameter(url, 'locale');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&promocode=39293');
		});

		it('url with parameters and the parameter to remove is the first', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es';
			var result = _.removeUrlParameter(url, 'test');
			expect(result).toBe('http://www.netsuite.com?url=392&promocode=39293&locale=es');
		});
		
		it('url with parameters and the parameter to remove is in the middle', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es';
			var result = _.removeUrlParameter(url, 'promocode');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&locale=es');
		});
		
		it('url with only one parameter ', function ()
		{
			var url = 'http://www.netsuite.com?test=1';
			var result = _.removeUrlParameter(url, 'test');
			expect(result).toBe('http://www.netsuite.com');
		});
		
		it('url with only two parameters ', function ()
		{
			var url = 'http://www.netsuite.com?test=1&locale=es';
			var result = _.removeUrlParameter(url, 'test');
			expect(result).toBe('http://www.netsuite.com?locale=es');
		});		
	});

	describe('Module: UrlHelper', function ()
	{		
		beforeEach(function ()
		{
			UrlHelper.clearValues();
		});
		
		it('getParameters: with only one Listener return obj with token and value', function ()
		{
			UrlHelper.addTokenListener('locale', true);
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameters();
			expect(result.locale).toBe('es');
		});

		it('getParameters: with two Listener, return obj with both values', function ()
		{
			UrlHelper.addTokenListener('locale', true);
			UrlHelper.addTokenListener('promocode', true);
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameters();
			expect(result.locale).toBe('es');
			expect(result.promocode).toBe('39293');
		});

		it('getParameters: with two Listener but one without persistence, return obj with only one value', function ()
		{
			UrlHelper.addTokenListener('locale', true);
			UrlHelper.addTokenListener('promocode', false);
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameters();
			expect(result.locale).toBe('es');
			expect(result.promocode).toBe(undefined);
		});	

		it('getParameters: with only one Listener and set a function to change the value', function ()
		{
			UrlHelper.addTokenListener('locale', function (value) { return value + '-test'; });
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameters();
			expect(result.locale).toBe('es-test');
		});	

		it('getParameters: with only one Listener and set a function to add persistence', function ()
		{
			UrlHelper.addTokenListener('promocode', function () { return true; });
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameters();
			expect(result.promocode).toBe('39293');
		});	

		it('getParameters: with only one Listener and set a function to remove persistence', function ()
		{
			UrlHelper.addTokenListener('locale', function () { return false; });
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameters();
			expect(result.locale).toBe(undefined);
		});	

		it('getParameterValue: get value that existing in the url', function ()
		{
			UrlHelper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameterValue('promocode');
			expect(result).toBe('39293');
		});	


		it('getParameterValue: get value that not existing in the url', function ()
		{
			UrlHelper.setUrl('http://www.netsuite.com?url=392&promocode=39293&locale=es');
			var result = UrlHelper.getParameterValue('test');
			expect(result).toBe('');
		});

		it('getParameters: promocode with a hash tag following internal', function ()
		{
			UrlHelper.addTokenListener('promocode', function () { return true; });
			UrlHelper.setUrl('http://www.netsuite.com?promocode=SALE20#color=red');
			var result = UrlHelper.getParameters();
			expect(result.promocode).toBe('SALE20');
		});		

		it('getParameters: promocode and another parameter with a hash tag following internal', function ()
		{
			UrlHelper.addTokenListener('promocode', function () { return true; });
			UrlHelper.setUrl('http://www.netsuite.com?affliate=sportsstore.com&promocode=SALE20#color=red');
			var result = UrlHelper.getParameters();
			expect(result.promocode).toBe('SALE20');
		});		

		it('getParameters: promocode and affliate with a hash tag following internal', function ()
		{
			UrlHelper.addTokenListener('promocode', function () { return true; });
			UrlHelper.addTokenListener('affliate', function () { return true; });
			UrlHelper.setUrl('http://www.netsuite.com?affliate=sportsstore.com&promocode=SALE20#color=red');
			var result = UrlHelper.getParameters();
			expect(result.promocode).toBe('SALE20');
			expect(result.affliate).toBe('sportsstore.com');
		});		

	});
});