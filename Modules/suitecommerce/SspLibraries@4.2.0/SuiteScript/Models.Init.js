/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Init.js
// -------
// Global variables to be used accross models
// This is the head of combined file Model.js
/* exported container, session, settings, customer, context, order */

function log (level, title, details)
{
	'use strict';
	var console = require('Console')
	,	levels = {
			'DEBUG' : 'log'
		,	'AUDIT' : 'info'
		,	'EMERGENCY': 'error'
		,	'ERROR' :'warn'
	};

	console[levels[level]](title, details);

}

var wrapped_objects = {};

function wrapObject (object, class_name)
{
	'use strict';

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
	'use strict';

	return function ()
	{
		var result
		,	is_secure = ~request.getURL().indexOf('https:')
		,	function_name = class_name + '.' + method_name + '()'
		,	file = '/' + request.getParameter('sitepath').replace(session.getAbsoluteUrl(is_secure ? 'checkout' :'shopping', '/'), '')
		,	start = Date.now();

		try
		{
			if (original_function)
			{
				result = original_function.apply(object, arguments);
			}
			else
			{
				result = object[method_name].apply(object, arguments);
			}
		}
		catch (e)
		{

			log('ERROR', file + ' | ' +  function_name, ' | Arguments: ' + JSON.stringify(arguments) + ' | Exception: ' + JSON.stringify(e));

			throw e;
		}

		log('DEBUG', file + ' | ' +  function_name, 'Time: ' + (Date.now() - start) + 'ms | Remaining Usage: ' +  nlapiGetContext().getRemainingUsage() + ' | Arguments: ' + JSON.stringify(arguments));

		return result;
	};
}

var container = null
,	session = null
,	customer = null
,	context = null
,	order = null;
// only initialize vars when the context actually have the functions
switch(nlapiGetContext().getExecutionContext())
{
	case 'suitelet':
		context = nlapiGetContext();
		break;
	case 'webstore':
	case 'webservices':
	case 'webapplication':
		//nlapiLogExecution('DEBUG', 'Initializing global vars', nlapiGetContext().getExecutionContext());
		container = nlapiGetWebContainer();
		session = container.getShoppingSession();
		customer = session.getCustomer();
		context = nlapiGetContext();
		order = session.getOrder();
		break;
	default:
		//nlapiLogExecution('DEBUG', 'Omitting initialization of global vars', nlapiGetContext().getExecutionContext());
		break;
}

/*
*	Returns the location id for the employee.
*		if SCIS => the selecetd scis location
*		else => the employee location field.
*/
function getCurrentLocation()
{
	'use strict';

	var location = context.getLocation();
	if (SC.Configuration.isSCIS) {
		location = JSON.parse(context.getSessionObject('location'));
		location = location && location.internalid;
	}

	return location;
}

define('Models.Init', ['underscore'], function (_)
{
	'use strict';

	if (SC.debuggingMode)
	{
		var suite_script_functions_to_wrap = ['nlapiLoadRecord', 'nlapiSearchRecord', 'nlapiSubmitRecord', 'nlapiCreateRecord', 'nlapiLookupField'];

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
		,	session: session
		,	customer: customer
		,	context: context
		,	order: order
		,	getCurrentLocation: getCurrentLocation
		};
	}
});
