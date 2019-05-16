/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* globals session */

// @module Utilities
// --------
// @class Utils
// A collection of utility methods. This are added to both SC.Utils, and Underscore.js
// eg: you could use SC.Utils.formatPhone() or _.formatPhone()
define('Utils'
,	[
		'jQuery'
	,	'underscore'
	,	'Backbone'
	,	'String.format'
	,	'Backbone.Validation'
	]
,	function (
		jQuery
	,	_
	,	Backbone
	)
{
	'use strict';

	//@function deepCopy Deep Copy of the object taking care of Backbone models
	//@param {Object} obj Object to be copy
	//@return {Object}
	function deepCopy(obj)
	{
		if(_.isFunction(obj))
		{
			return null;
		}

		var copy = {};

		if(obj instanceof Backbone.Model)
		{
			obj = obj.attributes || {};
		}
		else if(obj instanceof Backbone.Collection)
		{
			obj = obj.models || [];
		}

		if(_.isArray(obj))
		{
			copy = [];
			_.each(obj, function(value){
				!_.isFunction(value) && copy.push(_.deepCopy(value));
			});
		}
		else if(_.isObject(obj))
		{
			_.each(obj, function(value, attr){
				if(!_.isFunction(value) && attr.indexOf('_') !== 0)
				{
					copy[attr] = _.deepCopy(value);
				}
			});
		}
		else
		{
			copy = obj;
		}

		return copy;
	}

	//@function trim Remove starting and ending spaces
	//@param {String} str String to be trimmed
	//@return {String}
	var trim = jQuery.trim;

	// @method formatPhone
	// Will try to reformat a phone number for a given phone Format,
	// If no format is given, it will try to use the one in site settings.
	// @param {String} phone @param {String} format @return {String}
	function formatPhone (phone, format)
	{
		// fyi: the tilde (~) its used as !== -1
		var extentionSearch = phone.search(/[A-Za-z#]/)
		,	extention = ~extentionSearch ? ' '+ phone.substring(extentionSearch) : ''
		,	phoneNumber = ~extentionSearch ? ' '+ phone.substring(0, extentionSearch) : phone;

		format = format || SC.ENVIRONMENT.siteSettings.phoneformat;

		if (/^[0-9()-.\s]+$/.test(phoneNumber) && format)
		{
			var format_tokens = {}
			,	phoneDigits = phoneNumber.replace(/[()-.\s]/g, '');

			switch (format)
			{
			// c: country, ab: area_before, aa: area_after, d: digits
			case '(123) 456-7890':
				format_tokens = {c: ' ', ab: '(', aa: ') ', d: '-'};
				break;
			case '123 456 7890':
				format_tokens = {c: ' ', ab: '', aa: ' ', d: ' '};
				break;
			case '123-456-7890':
				format_tokens = {c: ' ', ab: '', aa: '-', d: '-'};
				break;
			case '123.456.7890':
				format_tokens = {c: ' ', ab: '', aa: '.', d: '.'};
				break;
			default:
				return phone;
			}

			switch (phoneDigits.length)
			{
			case 7:
				return phoneDigits.substring(0, 3) + format_tokens.d + phoneDigits.substring(3) + extention;
			case 10:
				return format_tokens.ab + phoneDigits.substring(0, 3) + format_tokens.aa + phoneDigits.substring(3, 6) + format_tokens.d + phoneDigits.substring(6) + extention;
			case 11:
				return phoneDigits.substring(0, 1) + format_tokens.c + format_tokens.ab + phoneDigits.substring(1, 4) + format_tokens.aa + phoneDigits.substring(4, 7) + format_tokens.d + phoneDigits.substring(7) + extention;
			default:
				return phone;
			}
		}

		return phone;
	}

	// @method dateToString Convert a date object to string using international format YYYY-MM-dd
	// Useful for inputs of type="date" @param {Date} date @return {String}
	function dateToString (date)
	{
		var month = ''+(date.getMonth()+1)
		,	day = ''+ date.getDate();

		if (month.length === 1)
		{
			month = '0' + month;
		}

		if (day.length === 1)
		{
			day = '0'+day;
		}

		return date.getFullYear() + '-' + month + '-' + day;
	}

	// @method stringToDate parse a string date into a date object.
	// @param {String} str_date
	// @param {format:String,plusMonth:Number} options.format: String format that specify the format of the input string. By Default YYYY-MM-dd.
	// options.plusMonth: Number that indicate how many month offset should be applied whne creating the date object.
	function stringToDate (str_date, options)
	{
		options = _.extend({
			format: 'YYYY-MM-dd'
		,	plusMonth: -1
		,	dateSplitCharacter: '-'
		}, options || {});

		//plumbing
		var date_parts = str_date ? str_date.split(options.dateSplitCharacter) : []
		,	format_parts = options.format ? options.format.split('-') : []
		,	year_index = _.indexOf(format_parts, 'YYYY') >= 0 ? _.indexOf(format_parts, 'YYYY') : 2
		,	month_index = _.indexOf(format_parts, 'MM') >= 0 ? _.indexOf(format_parts, 'MM') : 1
		,	day_index = _.indexOf(format_parts, 'dd') >= 0 ? _.indexOf(format_parts, 'dd') : 0
		//Date parts
		,	year = parseInt(date_parts[year_index], 10)
		,	month = parseInt(date_parts[month_index], 10) + (options.plusMonth || 0)
		,	day = parseInt(date_parts[day_index], 10)
		,	result = new Date(year, month, day);

		if (!(result.getMonth() !== month || day !== result.getDate() || result.getFullYear() !== year))
		{
			return result;
		}
	}

	// @method isDateValid @param {Date} date @return {Boolean}
	function isDateValid (date)
	{
		if (Object.prototype.toString.call(date) === '[object Date]')
		{
			// it is a date
			if (isNaN(date.getTime()))
			{
				// d.valueOf() could also work
				// date is not valid
				return false;
			}
			else
			{
				// date is valid
				// now validate the values of day, month and year
				var dtDay = date.getDate()
				,   dtMonth= date.getMonth() + 1
				,   dtYear = date.getFullYear()
				,   pattern = /^\d{4}$/;

				if (!pattern.test(dtYear))
				{
					return false;
				}
				else if (dtMonth < 1 || dtMonth > 12)
				{
					return false;
				}
				else if (dtDay < 1 || dtDay > 31)
				{
					return false;
				}
				else if ((dtMonth === 4 || dtMonth ===6 || dtMonth === 9 || dtMonth === 11) && dtDay  === 31)
				{
					return false;
				}
				else if (dtMonth === 2)
				{
					var isleap = (dtYear % 4 === 0 && (dtYear % 100 !== 0 || dtYear % 400 === 0));
					if (dtDay> 29 || (dtDay === 29 && !isleap))
					{
						return false;
					}
				}

				return true;
			}
		}
		else
		{
			// not a date
			return false;
		}
	}

	// @method validateSecurityCode @param {String} value @return a non empty string with a internationalized warning message
	function validateSecurityCode (value)
	{
		var ccsn = trim(value);

		if (!ccsn)
		{
			return _('Security Number is required').translate();
		}

		if (!(Backbone.Validation.patterns.number.test(ccsn) && (ccsn.length === 3 || ccsn.length === 4)))
		{
			return _('Security Number is invalid').translate();
		}
	}

	// @method validatePhone @param {String} phone @return {String} an error message if the passed phone is invalid or falsy if it is valid
	function validatePhone (phone)
	{
		var minLength = 7;


		if (_.isNumber(phone))
		{
			// phone is a number so we can't ask for .length
			// we elevate 10 to (minLength - 1)
			// if the number is lower, then its invalid
			// eg: phone = 1234567890 is greater than 1000000, so its valid
			//     phone = 123456 is lower than 1000000, so its invalid
			if (phone < Math.pow(10, minLength - 1))
			{
				return _('Phone Number is invalid').translate();
			}
		}
		else if (phone)
		{
			// if its a string, we remove all the useless characters
			var value = phone.replace(/[()-.\s]/g, '');
			// we then turn the value into an integer and back to string
			// to make sure all of the characters are numeric

			//first remove leading zeros for number comparison
			while(value.length && value.substring(0,1) === '0')
			{
				value = value.substring(1, value.length);
			}
			if (parseInt(value, 10).toString() !== value || value.length < minLength)
			{
				return _('Phone Number is invalid').translate();
			}
		}
		else
		{
			return _('Phone is required').translate();
		}

	}

	// @method validateState @param {String} value @param {String} valName @param {Object} form @return {String} an error message if the passed state is invalid or falsy if it is valid
	function validateState (value, valName, form)
	{
		var countries = SC.ENVIRONMENT.siteSettings.countries || {};
		if (countries[form.country] && countries[form.country].states && value === '')
		{
			return _('State is required').translate();
		}
	}

	// @method validateZipCode @param {String} value @param {String} valName @param {Object} form @return {String} an error message if the passed zip code is invalid or falsy if it is valid
	function validateZipCode (value, valName, form)
	{
		var countries = SC.ENVIRONMENT.siteSettings.countries || {};

		value = trim(value);

		if (!value && (!form.country || countries[form.country] && countries[form.country].isziprequired === 'T'))
		{
			return _('Zip Code is required').translate();
		}
	}

	// @method translate
	// Used on all of the hardcoded texts in the templates. Gets the translated value from SC.Translations object literal.
	// Please always use the syntax _('string').translate(1, 2) instead of the syntax _.translate('string', 1, 2)
	// Example: ```_('There are $(0) apples in the tree').translate(appleCount)```
	// @param {String} text @return {String}
	function translate (text)
	{
		if (!text)
		{
			return '';
		}

		text = text.toString();
		// Turns the arguments object into an array
		var args = Array.prototype.slice.call(arguments)

		,	parameters

		// Checks the translation table
		,	result = SC.Translations && SC.Translations[text] ? SC.Translations[text] : text;

		if (args.length && result)
		{
			if(_.isArray(args[1]) && args[1].length)
			{
				parameters = args[1];
			}
			else
			{
				// Mixes in inline variables
				parameters = _.map(args.slice(1), function(param)
				{
					return _.escape(param);
				});
			}

			result = result.format.apply(result, parameters);
		}

		return result;
	}

	// @method getFullPathForElement
	// @param {HTMLElement} el
	// @returns {String} a string containing the path in the DOM tree of the element
	function getFullPathForElement (el)
	{
		var names = [], c, e;

		while (el.parentNode)
		{
			if (el.id)
			{
				// if a parent element has an id, that is enough for our path
				names.unshift('#'+ el.id);
				break;
			}
			else if (el === document.body)
			{
				names.unshift('HTML > BODY');
				break;
			}
			else if (el === (document.head || document.getElementsByTagName('head')[0]))
			{
				names.unshift('HTML > HEAD');
				break;
			}
			else if (el === el.ownerDocument.documentElement)
			{
				names.unshift(el.tagName);
				break;
			}
			else
			{
				e = el;
				for (c = 1; e.previousElementSibling; c++)
				{
					e = e.previousElementSibling;
				}
				names.unshift(el.tagName +':nth-child('+ c +')');
				el = el.parentNode;
			}
		}

		return names.join(' > ');
	}

	// @method formatCurrency @param {String} value @param {String} symbol @return {String}
	function formatCurrency (value, symbol)
	{
		var value_float = parseFloat(value)
		,	negative = value_float < 0
		,	groupseparator = ','
		,	decimalseparator = '.'
		,	negativeprefix = '('
		,	negativesuffix = ')'
		,	thousand_string = ''
		, 	beforeValue = true
		,	sessionInfo = SC.getSessionInfo && SC.getSessionInfo('currentCurrency');

		if (isNaN(value_float))
		{
			return value;
		}

		value_float = parseInt((Math.abs(value_float) + 0.005) * 100, 10) / 100;

		var value_string = value_float.toString()
		,	settings = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings ? SC.ENVIRONMENT.siteSettings : {};

		if (Object.prototype.hasOwnProperty.call(window,'groupseparator'))
		{
			groupseparator = window.groupseparator;
		}
		else if (Object.prototype.hasOwnProperty.call(settings,'groupseparator'))
		{
			groupseparator = settings.groupseparator;
		}

		if (Object.prototype.hasOwnProperty.call(window,'decimalseparator'))
		{
			decimalseparator = window.decimalseparator;
		}
		else if (Object.prototype.hasOwnProperty.call(settings, 'decimalseparator'))
		{
			decimalseparator = settings.decimalseparator;
		}

		if (Object.prototype.hasOwnProperty.call(window,'negativeprefix'))
		{
			negativeprefix = window.negativeprefix;
		}
		else if (Object.prototype.hasOwnProperty.call(settings,'negativeprefix'))
		{
			negativeprefix = settings.negativeprefix;
		}

		if (Object.prototype.hasOwnProperty.call(window,'negativesuffix'))
		{
			negativesuffix = window.negativesuffix;
		}
		else if (Object.prototype.hasOwnProperty.call(settings,'negativesuffix'))
		{
			negativesuffix = settings.negativesuffix;
		}

		value_string = value_string.replace('.',decimalseparator);
		var decimal_position = value_string.indexOf(decimalseparator);

		// if the string doesn't contains a .
		if (!~decimal_position)
		{
			value_string += decimalseparator+'00';
			decimal_position = value_string.indexOf(decimalseparator);
		}
		// if it only contains one number after the .
		else if (value_string.indexOf(decimalseparator) === (value_string.length - 2))
		{
			value_string += '0';
		}

		for (var i=value_string.length-1; i>=0; i--)
		{
								//If the distance to the left of the decimal separator is a multiple of 3 you need to add the group separator
			thousand_string =	(i > 0 && i < decimal_position && (((decimal_position-i) % 3) === 0) ? groupseparator : '') +
								value_string[i] + thousand_string;
		}

		if (!symbol)
		{
			if (typeof session !== 'undefined' && session.getShopperCurrency)
			{
				beforeValue = session.getShopperCurrency().beforeValue;
				symbol = session.getShopperCurrency().symbol;
			}
			else if (settings.shopperCurrency)
			{
				beforeValue = settings.shopperCurrency.beforeValue;
				symbol = settings.shopperCurrency.symbol;
			}
			else if (sessionInfo)
			{
				beforeValue = sessionInfo.beforeValue;
				symbol = sessionInfo.symbol;
			}

			if (!symbol)
			{
				symbol = '$';
			}
		}

		value_string  = beforeValue || _.isUndefined(beforeValue) ? symbol + thousand_string :
			thousand_string + symbol;

		return negative ? (negativeprefix + value_string + negativesuffix) : value_string;
	}

	// @method formatQuantity Formats with commas as thousand separator (e.g. for displaying quantities)
	// @param {String} number @return {String} the formatted quantity.
	function formatQuantity (number)
	{
		var result = []
		,	parts = ('' + number).split('.')
		,	integerPart = parts[0].split('').reverse();

		for (var i = 0; i < integerPart.length; i++)
		{
			if (i > 0 && (i % 3 === 0) && integerPart[i] !== '-')
			{
				result.unshift(',');
			}

			result.unshift(integerPart[i]);
		}

		if (parts.length > 1)
		{
			result.push('.');
			result.push(parts[1]);
		}

		return result.join('');
	}

	// @method highlightKeyword  given a string containing a keyword it highlights it using html strong @param {String} text @param {String} keyword
	function highlightKeyword (text, keyword)
	{
		text = text || '';
		text = _.escape(text);
		if(!keyword)
		{
			return text;
		}

		keyword = trim(keyword).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

		return text.replace(new RegExp('('+ keyword +')', 'ig'), function ($1, match)
		{
			return '<strong>' + match + '</strong>';
		});
	}

	// @method collectionToString iterates a collection of objects, runs a custom function getValue on each item and then joins them
	// @param {Object} options @returns {String}
	function collectionToString (options)
	{
		var temp = [];
		_.each(options.collection, function (item)
		{
			temp.push(options.getValue(item));
		});

		return temp.join(options.joinWith);
	}

	// @method addParamsToUrl
	// @param {String} baseUrl
	// @param {Object} params the params mapping to add @return {String}
	// @param {Boolean} avoidDoubleRedirect If true it will modify all the url parameters to be prepended with __. We do this to prevent Netsuite platform to process some parameters and generate a double redirect. See searchApi.ssp
	// @return {String}
	function addParamsToUrl (baseUrl, params, avoidDoubleRedirect)
	{
		if (avoidDoubleRedirect)
		{
			var new_params = {};
			_.each(params, function (param_value, param_key)
			{
				new_params['__' + param_key] = param_value;
			});
			params = new_params;
		}

		// We get the search options from the config file
		if (baseUrl && !_.isEmpty(params))
		{
			var paramString = jQuery.param(params)
			,	join_string = ~baseUrl.indexOf('?') ? '&' : '?';

			return baseUrl + join_string + paramString;
		}

		return baseUrl;
	}

	// @method parseUrlOptions
	// Takes a url with options (or just the options part of the url) and returns an object. You can do the reverse operation (object to url string) using jQuery.param()
	// @param {String} options_string
	// @return {ParameterOptions}
	function parseUrlOptions (options_string)
	{
		options_string = options_string || '';

		if (~options_string.indexOf('?'))
		{
			options_string = _.last(options_string.split('?'));
		}

		if (~options_string.indexOf('#'))
		{
			options_string = _.first(options_string.split('#'));
		}
		//@class ParameterOptions @extend Dictionary<String,String>
		//This class is used as a dictionary where each string key is a parameter from the passed in string and each value
		//is the corresponding value from the string being decodeURIComponent.
		//Example
		// input: /some-item?quantity=2&custcol3=12
		// output: {quantity: decodeURIComponent(2), custcol3: decodeURIComponent(12)}

		var options = {};

		if (options_string.length > 0)
		{
			var tokens = options_string.split(/\&/g)
			,	current_token;

			while (tokens.length > 0)
			{
				current_token = tokens.shift().split(/\=/g);

				if (current_token[0].length === 0)
				{
					continue;
				}

				options[current_token[0]] = decodeURIComponent(current_token[1]);
			}
		}

		return options;
	}


	// @method hyphenate simple hyphenation of a string, replaces non-alphanumerical characters with hyphens
	// @param {String} string
	// @returns {String}
	function hyphenate (string)
	{
		return string.replace(/[\W]/g, '-');
	}

	var objectToAtrributesKeyMap = [
			'href'
		,	'id'
		,	'title'

		,	'data'
		,	'data-hashtag'
		,	'data-touchpoint'
		,	'data-permissions'
	];

	// @method objectToAtrributes @param {Object} obj @param {String} prefix @return {String}
	function objectToAtrributes (obj, prefix)
	{
		prefix = prefix || '';

		return _.reduce(obj, function (memo, value, key)
		{
			var prefixKey = prefix + key;

			//filters attributes
			if ( _.contains(objectToAtrributesKeyMap, prefixKey) === false)
			{
				return memo;
			}

			if ( _.isObject(value))
			{
				return memo + objectToAtrributes(obj[key], key + '-');
			}
			else if ( _.isArray(value) === true)
			{
				return memo + ' ' + _.escape(prefixKey) + '="' + _.escape(value.join(' ')) + '"';
			}
			else
			{
				return memo + ' ' + _.escape(prefixKey) + '="' + _.escape(value) + '"';
			}

		}, '');
	}

	// @method isTargetActionable
	// @param {Event} event
	// @return {Boolean}
	function isTargetActionable(event)
	{
		//return true if the target is actionable
		var target = jQuery(event.target)
		,	targetTagName = target.prop('tagName').toLowerCase()
		,	targetParentTagName = target.parent().prop('tagName').toLowerCase()
		,	isCheckbox = target.prop('type') === 'checkbox';

		return	targetTagName === 'a' || targetParentTagName === 'a' ||
				targetTagName === 'i' || targetParentTagName === 'button' ||
				targetTagName === 'button' ||
				(targetTagName === 'input' && isCheckbox === false);
	}

	// @method resizeImage @param {Array<Object>} sizes @param {String} url @param {String} size the size id @return {String}
	function resizeImage (sizes, url, size)
	{
		var resize = _.where(sizes, {name: size})[0];
		url = url || '';

		if (!!resize)
		{
			return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
		}

		return url;
	}

	// @method getThemeAbsoluteUrlOfNonManagedResources @param {String} file @returns {String}
	function getThemeAbsoluteUrlOfNonManagedResources(default_value, file)
	{
		if(!file)
		{
			file = '';
			if(SC.ENVIRONMENT.isExtended)
			{
				file = (SC.ENVIRONMENT.themeAssetsPath || '');
			}
			else if(SC.ENVIRONMENT.BuildTimeInf && SC.ENVIRONMENT.BuildTimeInf.isSCLite)
			{
				if (SC.CONFIGURATION.unmanagedResourcesFolderName)
				{
					file = 'site/' + SC.CONFIGURATION.unmanagedResourcesFolderName + '/';
				}
				else
				{
					file = 'default/';
				}
			}
			
			file += default_value;
		}
		
		var absoulute_path = getAbsoluteUrl('');
		
		return file.indexOf(absoulute_path) !== 0 ? getAbsoluteUrl(file) : file;
	}
	
	// @method getAbsoluteUrl @param {String} file @returns {String}
	function getAbsoluteUrl (file)
	{
		var base_url = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.baseUrl || ''
		,	fileReplace = file ? file : '';
		return base_url ? base_url.replace('{{file}}', fileReplace) : file;
	}

	// @method getAbsoluteUrlOfNonManagedResources @param {String} file @returns {String}
	function getAbsoluteUrlOfNonManagedResources (file)
	{
		return getAbsoluteUrl(file);
	}

	// @method getDownloadPdfUrl @param {Object} params @returns {String}
	function getDownloadPdfUrl (params)
	{
		params = params || {};
		params.n = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings && SC.ENVIRONMENT.siteSettings.siteid || '';

		if(_.isSingleDomain())
		{
			return  _.addParamsToUrl(_.getAbsoluteUrl('download.ssp'), params);
		}
		else
		{
			var origin = window.location.origin ? window.location.origin :
			(window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : ''));

			return  _.addParamsToUrl(origin + _.getAbsoluteUrl('download.ssp'), params);
		}
	}

	// @method getWindow The reason for this method is be able to test logic regarding window.location - so tests can mock the window object @return {HTMLElement} the window global object
	function getWindow()
	{
		return window;
	}

	// @method doPost Performs a POST operation to a specific url @param {String} url
	function doPost (url)
	{
		var form = jQuery('<form id="do-post" method="POST" action="' + url + '"></form>').hide();

		// we have to append it to the dom  for browser compatibility
		// check if the form already exists (user could cancel the operation before it gets to the submit)
		var do_post = jQuery('#do-post');
		if(do_post && do_post[0])
		{
			do_post[0].action = url;
			do_post[0].method = 'POST';
		}
		else
		{
			jQuery('html').append(form);
			do_post = jQuery('#do-post');
		}

		do_post[0].submit();
	}

	// @method getPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} default_value value to return if nothing is found.
	function getPathFromObject (object, path, default_value)
	{
		if (!path)
		{
			return object;
		}
		else if (object)
		{
			var tokens = path.split('.')
			,	prev = object
			,	n = 0;

			while (!_.isUndefined(prev) && n < tokens.length)
			{
				prev = prev[tokens[n++]];
			}

			if (!_.isUndefined(prev))
			{
				return prev;
			}
		}

		return default_value;
	}

	// @method setPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} value the value to set
	function setPathFromObject(object, path, value)
	{
		if (!path)
		{
			return;
		}
		else if (!object)
		{
			return;
		}

		var tokens = path.split('.')
		,	prev = object;

		for(var token_idx = 0; token_idx < tokens.length-1; ++token_idx)
		{
			var current_token = tokens[token_idx];

			if( _.isUndefined(prev[current_token]))
			{
				prev[current_token] = {};
			}
			prev = prev[current_token];
		}

		prev[_.last(tokens)] = value;
	}

	// @method ellipsis creates the ellipsis animation (used visually while waiting to something) @param {String} selector
	function ellipsis (selector)
	{
		if (!jQuery(selector).data('ellipsis'))
		{
			var values = ['', '.', '..', '...', '..', '.']
			,	count = 0
			,	timer = null
			,	element = jQuery(selector);

			element.data('ellipsis', true);
			element.css('visibility', 'hidden');
			element.html('...');
			element.css('width', element.css('width'));
			element.css('display', 'inline-block');
			element.html('');
			element.css('visibility', 'visible');

			timer = setInterval(function ()
			{
				if (jQuery(selector).length)
				{
					element.html(values[count % values.length]);
					count++;
				}
				else
				{
					clearInterval(timer);
					element = null;
				}
			}, 250);
		}
	}

	// @method reorderUrlParams
	// @param {String} url
	// @return {String} the url with reordered parameters
	function reorderUrlParams (url)
	{
		var params = []
		,	url_array = url.split('?');

		if (url_array.length > 1)
		{
			params = url_array[1].split('&');
			return url_array[0] + '?' + params.sort().join('&');
		}

		return url_array[0];
	}

	// @method isShoppingDomain determines if we are in shopping domain (secure or non secure)
	// or single domain
	// @return {Boolean} true if in checkout or in single domain
	function isShoppingDomain ()
	{
		return SC.ENVIRONMENT.siteSettings.shoppingSupported;
	}

	// @method isCheckoutDomain determines if we are in a secure checkout
	// domain or in a secure single domain environment
	// @return {Boolean} true if in checkout or in single domain
	function isCheckoutDomain ()
	{
		return SC.ENVIRONMENT.siteSettings.checkoutSupported;
	}

	// @method isSingleDomain determines if we are in a single domain environment
	// @return {Boolean} true if single domain
	function isSingleDomain ()
	{
		return SC.ENVIRONMENT.siteSettings.isSingleDomain;
	}

	// @method isInShopping determines if we are in shopping ssp
	// used when there are frontend features only shown in the shopping domain
	// @return {Boolean} true if in shopping domain, false if in checkout or myaccount
	function isInShopping ()
	{
		return _.isShoppingDomain() && (SC.ENVIRONMENT.SCTouchpoint === 'shopping' || SC.ENVIRONMENT.siteSettings.sitetype === 'STANDARD');
	}


	// @method isInCheckout determines if we are in checkout or my account ssp
	// @return {Boolean} true if in checkout domain
	function isInCheckout ()
	{
		return !_.isSingleDomain() ? _.isCheckoutDomain() : _.isCheckoutDomain() && (SC.ENVIRONMENT.SCTouchpoint === 'checkout' ||  SC.ENVIRONMENT.SCTouchpoint === 'myaccount');
	}

	// @method getSessionParams search within a given url the values of the shopper session @param {String} url @return {Object} the parameters
	function getSessionParams (url)
	{
		// add session parameters to target host
		var params = {}
		,	ck = getParameterByName(url, 'ck')
		,	cktime = getParameterByName(url, 'cktime');

		if (ck && cktime)
		{
			params.ck = ck;
			params.cktime = cktime;
		}

		return params;
	}

	// @method getParameterByName @param {String} url @param {String} param_name
	function getParameterByName (url, param_name)
	{
		param_name = param_name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + param_name + '=([^&#]*)')
		,	results = regex.exec(url);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function isPageGenerator ()
	{
		return _.result(SC, 'isPageGenerator') || _.result(SC, 'isPageGenerator');
	}

	var SCRIPT_REGEX = /<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

	//@function Remove script tags in a html text @param {String} text
	function removeScripts (text)
	{
		if (isPageGenerator() && text)
		{
			text = text.replace(/(<!--[\s\S]*?-->)/g, ' $1 '); //invalidates de XSS attack like <scr<!--cheat-->ipt> - keep the comment and add spaces
			while (SCRIPT_REGEX.test(text))
			{
				text = text.replace(SCRIPT_REGEX, '');
			}
		}
		return text || '';
	}

	//@function Reduce unnecessary spaces in html texts @param {String} text
	function minifyMarkup (text)
	{
		return text
			// remove spaces between tags.
			.replace(/\>\s+</g, '><')
			// remove html comments that our markup could have.
			.replace(/<!--[\s\S]*?-->/g, '')
			// replace multiple spaces with a single one.
			.replace(/\s+/g, ' ');
	}

	function oldIE (version)
	{
		var ie_version = version || 7;
		// IE7 detection courtesy of Backbone
		// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
		var	isExplorer = /msie [\w.]+/
		,	docMode = document.documentMode;

		return (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= ie_version));
	}

	// @method require The motive for this method is being able to call require() of modules in-line without breaking amd-optimizer because we cannot use require() directly passing variables as dependencies because amd-optimizer will try to parse that and fail.
	// @param {Array<String>} dependencies
	// @param {Function} fn
	var requireModules;

	if (_.isFunction(window.require))
	{
		requireModules = window.require;
	}
	else if (window.SCM)
	{
		requireModules = function (moduleName)
		{
			return window.SCM[moduleName];
		};
	}
	else
	{
		requireModules = function ()
		{
			console.error('Impossible to retrieve dependencies');
		};
	}

	// we are caching window width so this won't work on window resize. Same for data-templates in views.
	var viewport_width = 0
	,	viewport_height = 0;

	// @method resetViewportWidth resets viewport width explicitly to be updated on resize.
	function resetViewportWidth ()
	{
		viewport_width = 0;
	}

	// @method getViewportWidth @return {Number} the width of the viewport in pixels
	function getViewportWidth ()
	{
		return viewport_width || (viewport_width = jQuery(window).width());
	}

	// @method getViewportHeight @return {Number} the height of the viewport in pixels
	function getViewportHeight ()
	{
		return viewport_height || (viewport_height = jQuery(window).height());
	}

	// @method selectByViewportWidth depending on current viewport width it will return one of the passed options that are named 'phone', 'tablet' or 'desktop'
	// @param {Object<String,Any>} options @param defaultValue @return {Any}
	function selectByViewportWidth (options, defaultValue)
	{
		var device = getDeviceType();
		return options[device] || defaultValue;
	}

	function getDeviceType (widthToCheck)
	{
		var width = widthToCheck ? widthToCheck : Utils.getViewportWidth();

		if (width < 768)
		{
			return 'phone';
		}
		else if (width < 992)
		{
			return 'tablet';
		}
		else
		{
			return 'desktop';
		}
	}

	function isPhoneDevice ()
	{
		return getDeviceType() === 'phone';
	}

	function isTabletDevice ()
	{
		return getDeviceType() === 'tablet';
	}

	function isDesktopDevice ()
	{
		return getDeviceType() === 'desktop';
	}

	function isNativeDatePickerSupported ()
	{
		var input = document.createElement('input');
		input.setAttribute('type', 'date');

		//if special input is not supported browser will fall back to text
		return input.type !== 'text';
	}

	function initBxSlider ($element, options)
	{
		if ($element.bxSlider && !oldIE() && !SC.isPageGenerator())
		{
			$element.bxSlider(options);
		}
		return $element;
	}

	function countItems (lines)
	{
		var item_count = 0;

		_.each(lines.models ? lines.models : lines, function (line)
		{
			item_count += line.get('quantity');
		});

		return item_count;
	}

	function getExponentialDelay(options)
	{
		var settings = options.settings || {
			base: 1.5
		,	y: 0.8
		,	retries: 2
		};

		return (Math.pow(settings.base, options.x) - settings.y) * 1000;
	}

	// @function imageFlatten
	// Helper function that receives the itemimages_detail (returned by the search api)
	// and flattens it into an array of objects containing url and altimagetext
	// @param {Object} images Receives the itemimages_detail (returned by the search api) which is a multi-level tree-like object grouped by "categories"
	// @return {Array<ImageContainer>}
	function imageFlatten (images)
	{
		if ('url' in images && 'altimagetext' in images)
		{
			return [images];
		}

		return _.flatten(_.map(images, function (item)
		{
			if (_.isArray(item))
			{
				return item;
			}

			return imageFlatten(item);
		}));
	}


	var Utils = SC.Utils = {
			translate: translate
		,	formatPhone: formatPhone
		,	dateToString: dateToString
		,	isDateValid: isDateValid
		,	stringToDate: stringToDate
		,	validatePhone: validatePhone
		,	trim: trim
		,	validateState: validateState
		,	validateZipCode: validateZipCode
		,	validateSecurityCode: validateSecurityCode
		,	formatCurrency: formatCurrency
		,	formatQuantity: formatQuantity
		,	highlightKeyword: highlightKeyword
		,	getFullPathForElement: getFullPathForElement
		,	collectionToString: collectionToString
		,	countItems: countItems
		,	addParamsToUrl: addParamsToUrl
		,	parseUrlOptions: parseUrlOptions
		,	objectToAtrributes: objectToAtrributes
		,	isTargetActionable : isTargetActionable
		,	resizeImage: resizeImage
		,	hyphenate: hyphenate
		,	getAbsoluteUrl: getAbsoluteUrl
		,	getAbsoluteUrlOfNonManagedResources: getAbsoluteUrlOfNonManagedResources
		,	getThemeAbsoluteUrlOfNonManagedResources: getThemeAbsoluteUrlOfNonManagedResources
		,	getWindow: getWindow
		,	getDownloadPdfUrl: getDownloadPdfUrl
		,	doPost: doPost
		,	getPathFromObject: getPathFromObject
		,	setPathFromObject: setPathFromObject
		,	ellipsis: ellipsis
		,	reorderUrlParams: reorderUrlParams
		,	getSessionParams: getSessionParams
		,	getParameterByName: getParameterByName
		,	isPageGenerator: isPageGenerator
		,	removeScripts: removeScripts
		,	minifyMarkup: minifyMarkup
		,	oldIE: oldIE
		,	requireModules: requireModules
		,	getViewportWidth: getViewportWidth
		,	getViewportHeight: getViewportHeight
		,	isPhoneDevice: isPhoneDevice
		,	isTabletDevice: isTabletDevice
		, 	isDesktopDevice: isDesktopDevice
		,	isNativeDatePickerSupported: isNativeDatePickerSupported
		,	selectByViewportWidth: selectByViewportWidth
		,	isShoppingDomain: isShoppingDomain
		,	isCheckoutDomain: isCheckoutDomain
		,	isSingleDomain: isSingleDomain
		,	isInShopping: isInShopping
		,	isInCheckout: isInCheckout
		,	resetViewportWidth: resetViewportWidth
		,	getDeviceType: getDeviceType
		,	initBxSlider: initBxSlider
		,	getExponentialDelay: getExponentialDelay
		,	imageFlatten: imageFlatten
		,	deepCopy: deepCopy
	};

	// We extend underscore with our utility methods
	// see http://underscorejs.org/#mixin
	_.mixin(Utils);

	return Utils;
});