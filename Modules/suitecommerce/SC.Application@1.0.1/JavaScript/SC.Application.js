/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/


//only used in test cases, consider remove
define('SC.Application'
,	[
		'SC.Application.Skeleton'
	]
,	function (
		SCApplicationSkeleton
	)
{
	'use strict';

	// Application Creation:
	// Applications will provide by default: Layout (So your views can talk to)
	// and a Router (so you can extend them with some nice defaults)
	// If you like to create extensions to the Skeleton you should extend SC.Application.Skeleton
	var _applications = {};

	return function Application (application_name)
	{
		_applications[application_name] = _applications[application_name] || new SCApplicationSkeleton(application_name);
		return _applications[application_name];
	};
});