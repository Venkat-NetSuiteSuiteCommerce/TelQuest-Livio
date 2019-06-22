/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// console.js
// ----------------------

// Defines console for IE.
// Used to prevent the application to stop working in IE 
define('Console.Polyfill', function ()
{
	'use strict';
	// verify if there not console
	if (typeof window.console === 'undefined') 
	{
		window.console = {};

		var i = 0
		// defining default function
		,	noop = function () {}
		// defining methods names for console.
		,	methods = ['assert', 'error', 'clear', 'count', 'debug', 'dir', 'dirxml', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'trace', 'warn'];
		// adding all methods
		for (; i < methods.length; i++)
		{
			window.console[methods[i]] = noop;
		}
	}
	// adding memory object
	if (typeof window.console.memory === 'undefined')
	{
		window.console.memory = {};
	}
	
});