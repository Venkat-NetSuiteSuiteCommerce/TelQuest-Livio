/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC
define('SC.Models.Init'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	var wrapped_objects = {};
	var suite_script_functions_to_wrap = ['nlapiLoadRecord', 'nlapiSearchRecord', 'nlapiSubmitRecord', 'nlapiCreateRecord', 'nlapiLookupField'];

	var container = null
	,	session = null
	,	customer = null
	,	context = null
	,	order = null;

		// only initialize vars when the context actually have the functions
	switch (nlapiGetContext().getExecutionContext())
	{
		case 'suitelet':
			context = nlapiGetContext();
			break;
		case 'webstore':
		case 'webservices':
		case 'webapplication':
			container = nlapiGetWebContainer();
			session = container.getShoppingSession();
			customer = session.getCustomer();
			context = nlapiGetContext();
			order = session.getOrder();
			break;
		default:
			break;
	}

	function log (level, title, details)
	{
		var console = require('Console')
		,	levels = {
				'DEBUG' : 'log'
			,	'AUDIT' : 'info'
			,	'EMERGENCY': 'error'
			,	'ERROR' :'warn'
		};

		console[levels[level]](title, details);
	}

	function wrapObject (object, class_name)
	{
		if (!wrapped_objects[class_name])
		{
			wrapped_objects[class_name] = {};

			for (var method_name in object)
			{
				if (method_name !== 'prototype')
				{
					wrapped_objects[class_name][method_name] = wrap(object, method_name, class_name);
				}
			}
		}

		return wrapped_objects[class_name];
	}

	function wrap (object, method_name, class_name, original_function)
	{
		return function ()
		{
			var result
			,	function_name = class_name + '.' + method_name + '()'
			,	start = Date.now();

			try
			{
				if (original_function)
				{
					result = original_function.apply(object, arguments);
				}
				else
				{
					console.log('Executing ' + object[method_name] + ' Length: ' + object[method_name].length + ' ToString: ' + object[method_name].toString());
					result = object[method_name].apply(object, arguments);
				}
			}
			catch (e)
			{

				log('ERROR', function_name, 'Arguments: ' + JSON.stringify(arguments) + ' Exception: ' + JSON.stringify(e) );

				throw e;
			}

			log('DEBUG', function_name, 'Arguments: ' + JSON.stringify(arguments) + ' Time: ' + (Date.now() - start) + 'ms RemainingUsage: ' +  nlapiGetContext().getRemainingUsage() );

			return result;
		};
	}

	/*
	*	Returns the location id for the employee.
	*		if SCIS => the selecetd scis location
	*		else => the employee location field.
	*/
	function getCurrentLocation()
	{
		var location = context.getLocation();
		if (SC.Configuration.isSCIS) {
			location = JSON.parse(context.getSessionObject('location'));
			location = location && location.internalid;
		}

		return location;
	}

	if (SC.debuggingMode)
	{
		_.each(suite_script_functions_to_wrap, function (method_name)
		{
			this[method_name] = wrap(this, method_name, 'SuiteScript', this[method_name]);
		}, this);

		return {
			container: wrapObject(container, 'WebContainer')
		,	session: wrapObject(session, 'ShoppingSession')
		,	customer: wrapObject(customer, 'Customer')
		,	context: wrapObject(context, 'Context')
		,	order: wrapObject(order, 'Order')
		,	getCurrentLocation: getCurrentLocation
		};
	}
	else
	{
		return {
			container: container
		,	session:  session
		,	customer: customer
		,	context: context
		,	order: order
		,	getCurrentLocation: getCurrentLocation
		};
	}
});