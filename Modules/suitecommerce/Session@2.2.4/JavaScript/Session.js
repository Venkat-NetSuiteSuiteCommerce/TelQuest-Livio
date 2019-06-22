/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//! © 2015 NetSuite Inc.
// Session.js
// -------------
//
define('Session'
,	[	'underscore'
	,	'Utils'
	]
,	function (
	_
	)
{
	'use strict';

	return {

		get: function (path, default_value)
		{
			var session_info = SC && SC.getSessionInfo && SC.getSessionInfo() || {};
			return _.getPathFromObject(session_info, path, default_value);
		}

	,	set: function (path, value)
		{
			var session_info = SC && SC.getSessionInfo && SC.getSessionInfo() || {};
			session_info[path] = value;
		}

	,	getSearchApiParams: function()
		{
			var search_api_params = {}
			,	locale = this.get('language.locale', '')
			,	language = ''
			,	country = ''
			,	currency = this.get('currency.code', '') ? this.get('currency.code', '') : this.get('currency', '');

			if (~locale.indexOf('_'))
			{
				var locale_tokens = locale.split('_');
				language = locale_tokens[0];
				country = locale_tokens[1];
			}
			else
			{
				language = locale;
			}


			//SET API PARAMS
			if (language)
			{
				search_api_params.language = language;
			}

			if (country)
			{
				search_api_params.country = country;
			}

			// Currency
			if (currency)
			{
				search_api_params.currency = currency;
			}
			
			// Price Level
			search_api_params.pricelevel = this.get('priceLevel', '');

			// No cache
			if (_.parseUrlOptions(location.search).nocache === 'T')
			{
				search_api_params.nocache = 'T';
			}

			return search_api_params;
		}

	};

});
