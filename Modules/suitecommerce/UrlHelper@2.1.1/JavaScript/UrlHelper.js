/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module UrlHelper
define('UrlHelper'
,	[	
		'underscore'
	,	'Utils'
	]
,	function (
		_
	,	Utils
	)
{
	'use strict';

	// @class UrlHelper Keeps track of the URL, triggering custom events to specific parameters. 
	// Provides methods to add, get and remove parameters from the url. 
	// Extends Utils and add this methods to underscore. 
	// As an application module, when mounted to the application will listen to onAfterAppendView 
	// and will update itself with the new url @extends ApplicationModule
	var UrlHelper = {

		// @property {String} url
		url : ''
		// @property {Object} listeners
	,	listeners : {}
		// @property {Object} parameters
	,	parameters : {}

		// @method setUrl @param {String} url
	,	setUrl: function (url)
		{
			var self = this;

			this.url = url;
			this.parameters = {};

			// for each of the listeners
			_.each(this.listeners, function (fn, token)
			{
				var parameter_value = self.getParameterValue(token);

				// if the key (token) is in the url
				if (parameter_value)
				{
					// we trigger the function
					var value = _.isFunction(fn) ? fn(parameter_value) : fn;

					// if there is a value, we store it in our parameters object
					if (value)
					{
						if (_.isBoolean(value))
						{
							self.parameters[token] = parameter_value;
						}
						else
						{
							self.parameters[token] = value;
						}
					}
				}
			});
		}

		// @method addTokenListener @param {String} token @param {Function} fn
	,	addTokenListener: function (token, fn)
		{
			this.listeners[token] = fn;
		}

		// @method getParameters @return {Object}
	,	getParameters: function ()
		{
			return this.parameters;
		}

		// @method getParameterValue @param {String} parameter @return {String} 
	,	getParameterValue: function (parameter)
		{
			var value = this.url.match(parameter +'{1}\\={1}(.*?[^&#]*)');

			if (value && value[1])
			{
				return value[1];
			}
			else
			{
				return '';
			}
		}

		// @method clearValues
	,	clearValues: function ()
		{
			this.url = '';
			this.listeners = {};
			this.parameters = {};
		}
	};

	// @module Utils @class Utils
	// @method fixUrl added by UrlHelper @param {String} url
	function fixUrl (url)
	{
		if (!new RegExp('^http').test(url))
		{
			var parameters = UrlHelper.getParameters()
			,	charValue = ''
			,	value = '';

			// for each of the parameters in the helper
			_.each(parameters, function (i, parameter)
			{
				value = url.match(new RegExp(parameter +'{1}\\={1}(.*?[^&]*)'));

				// if the parameter is not in the url
				if (!value)
				{
					charValue = ~url.indexOf('?') ? '&' : '?';
					// we append it
					url += charValue + parameter +'='+ parameters[parameter];
				}
			});
		}

		return url;
	}

	// @method setUrlParameter changes the value of a parameter in the url 
	// @param {String} url @param {String} parameter @param {String} new_value 
	function setUrlParameter(url, parameter, new_value)
	{
		var value = url.match(new RegExp(parameter + '{1}\\={1}(.*?[^(&|#)]*)'))
		,	charValue = '';

		if (value)
		{
			return url.replace(value[0], parameter +'='+ new_value);
		}
		else
		{
			charValue = ~url.indexOf('?') ? '&' : '?';

			return url + charValue + parameter +'='+  new_value;
		}
	}

	// @method removeUrlParameter @param {String} url @param {String} parameter
	function removeUrlParameter(url, parameter)
	{
		var value = url.match(new RegExp('(\\?|&)' + parameter + '{1}\\={1}(.*?[^(&|#)]*)'));

		if (value)
		{
			if (~value[0].indexOf('?') && ~url.indexOf('&'))
			{
				return url.replace(value[0] +'&', '?');
			}
			else
			{
				return url.replace(value[0], '');
			}
		}
		else
		{
			return url;
		}
	}

	_.extend(Utils, {
		fixUrl: fixUrl
	,	setUrlParameter: setUrlParameter
	,	removeUrlParameter: removeUrlParameter
	});

	_.mixin(Utils);

	return _.extend(UrlHelper, {

		mountToApp: function (Application)
		{
			var self = this;

			Application.getLayout().on('afterAppendView', function ()
			{
				// Every time afterAppendView is called, we set the url to the helper
				self.setUrl(window.location.href);
			});
		}
	});
});