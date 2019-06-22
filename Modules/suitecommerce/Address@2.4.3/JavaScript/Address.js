/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Address.js
// -----------------
// Defines the Address  module (Model, Collection, Views, Router)
define('Address'
,	[	'Address.Router'

	,	'underscore'
	, 	'Utils'
	]
,	function (
		Router

	,	_
	)
{
	'use strict';

	return	{
		MenuItems: {
			parent: 'settings'
		,	id: 'addressbook'
		,	name: _('Address Book').translate()
		,	url: 'addressbook'
		,	index: 3
		}

	,	mountToApp: function (application)
		{
			// Initializes the router
			return new Router(application);
		}
	};
});
