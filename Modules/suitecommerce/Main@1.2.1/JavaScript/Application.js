/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Application', ['ApplicationSkeleton'], function(ApplicationSkeleton)
{
	'use strict';

	// Application Creation:
	// Applications will provide by default: Layout (So your views can talk to)
	// and a Router (so you can extend them with some nice defaults)
	// If you like to create extensions to the Skeleton you should extend SC.ApplicationSkeleton
	SC._applications = {};
	SC.Application = function (application_name)
	{
		SC._applications[application_name] = SC._applications[application_name] || new ApplicationSkeleton(application_name);
		return SC._applications[application_name];
	};

	return SC.Application;
});