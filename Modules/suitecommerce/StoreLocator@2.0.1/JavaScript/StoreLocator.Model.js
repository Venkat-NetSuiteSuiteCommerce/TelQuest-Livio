/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Model'
,	[
		'Location.Model'
	,	'Utils'
	]
,	function
	(
		LocationModel
	,	Utils
	)
{
	'use strict';

	return LocationModel.extend({
		//@property {String} urlRoot
		urlRoot: Utils.getAbsoluteUrl('services/StoreLocator.Service.ss')
	});
});
