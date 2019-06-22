/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Console'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	// Create server side console
	// use to log on SSP application
	if (typeof console === 'undefined') {
		console = {};
	}
	// Maximum length for details and title for nlapiLogExecution.
	// Actual maxTitleLength is 99, setting to 95 to use the remaining characters to make "pagination" possible.
	var maxDetailsLength = 3995
	,	maxTitleLength = 95;

	/* Mostly to display the actual UNEXPECTED_ERROR */
	function basicClone(value)
	{
		var t = typeof value;
		if (t === 'function')
		{
			return 'function';
		}
		else if (!value || t !== 'object')
		{
			return value;
		}
		else
		{
			var o = {};
			Object.keys(value).forEach(function (key)
			{
				var val = value[key];
				var t2 = typeof(val);
				if (t2 === 'string' || t2 === 'number' || t2 === 'boolean')
				{
					o[key] = val;
				}
				else
				{
					o[key] = t2;
				}
			});
			return o;
		}
	}

	function stringify(value)
	{
		if (value && value.toJSON)
		{
			return value.toJSON();
		}
		else
		{
			value = basicClone(value);
			return JSON.stringify(value);
		}
	}

	// Pass these methods through to the console if they exist, otherwise just
	// fail gracefully. These methods are provided for convenience.
	var console_methods = 'assert clear count debug dir dirxml exception group groupCollapsed groupEnd info log profile profileEnd table time timeEnd trace warn'.split(' ')
	,	idx = console_methods.length
	,	noop = function(){};

	while (--idx >= 0)
	{
		var method = console_methods[idx];

		if (typeof console[method] === 'undefined')
		{
			console[method] = noop;
		}
	}

	if (typeof console.memory === 'undefined')
	{
		console.memory = {};
	}

	_.each({'log': 'DEBUG', 'info': 'AUDIT', 'error': 'EMERGENCY', 'warn': 'ERROR'}, function (value, key)
	{
		console[key] = function ()
		{
			var title, details;
			if (arguments.length > 1)
			{
				title = arguments[0];
				title = typeof title === 'object'? stringify(title): title;
				details = arguments[1];
				details = typeof details === 'object'? stringify(details): details;
			}
			else
			{
				title = '';
				details = arguments[0] || 'null';
			}
			if(details && details.length > maxDetailsLength)
			{
				details = details.match(new RegExp('.{1,' + maxDetailsLength + '}', 'g'));
			}
			else
			{
				details = [details];
			}
			_.each(details, function(detail, key, list)
			{
				var newTitle = list.length > 1 ? title.substring(0, maxTitleLength) + '(' + (key + 1) + ')' : title;
				nlapiLogExecution(value, newTitle, detail);
			});
		};
	});

	_.extend(console, {

		timeEntries: []

	,	trace: function()
		{
			try {
				''.foobar();
			}
			catch(err)
			{
				var stack = err.stack.replace(/^[^\(]+?[\n$]/gm, '')
      				.replace(/^\s+at\s+/gm, '')
      				.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
      				.split('\n');
  				console.log(stack);
			}
		}

	,	time: function (text)
		{
			if (typeof text === 'string')
			{
				console.timeEntries[text] = Date.now();
			}
		}

	,	timeEnd: function (text)
		{
			if (typeof text === 'string')
			{
				if (!arguments.length)
				{
					console.warn('TypeError:', 'Not enough arguments');
				}
				else
				{
					if (typeof console.timeEntries[text] !== 'undefined')
					{
						console.log(text + ':', Date.now() - console.timeEntries[text] + 'ms');
						delete console.timeEntries[text];
					}
				}
			}
		}
	});

	return console;
});
