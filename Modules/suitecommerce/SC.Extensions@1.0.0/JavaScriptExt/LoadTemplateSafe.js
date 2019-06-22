/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global define: false */
/* global require: false */
/* global requirejs: false */

(function loadTemplateSafe()
{
	'use strict';

	define('SC.LoadTemplateSafe', [], function ()
	{
		return {
			load: function (name, req, onload, config)
			{
				try
				{
					req([name], function (value) {
						onload(value);
					});
				}
				catch (e)
				{
				}
			}
		};
	});

	function copyProperties(source, dest)
	{
		for (var property in source)
		{
			if (source.hasOwnProperty(property))
			{
				dest[property] = source[property];
			}
		}
	}

	function insertPlugin(deps)
	{
		if (deps.splice)
		{
			for (var i = 0; i < deps.length; i++)
			{
				if (deps[i].indexOf('.tpl') !== -1 && deps[i].indexOf('SC.LoadTemplateSafe!') === -1)
				{
					deps[i] = 'SC.LoadTemplateSafe!' + deps[i];
				}
			}
		}
	}

	function wrapFunction(func, param_index)
	{
		var original = func;

		func = function()
		{
			insertPlugin(arguments[param_index]);
			return original.apply(null, arguments);
		}
		copyProperties(original, func);

		return func;
	}

	// define = function (name, deps, callback)
	define = wrapFunction(define, 1);

	// require = function (deps, callback, relName, forceSync, alt)
	requirejs = require = wrapFunction(require, 0);

})();
