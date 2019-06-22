/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
// Defines the CreditCard  module
define('CreditCard'
,	[	'CreditCard.Router'

	,	'underscore'
	,	'Utils'
	]
,	function (
		Router

	,	_
	)
{
	'use strict';

	// @class CreditCart @extends ApplicationModule
	return	{
		MenuItems: {
			parent: 'settings'
		,	id: 'creditcards'
		,	name: _('Credit Cards').translate()
		,	url: 'creditcards'
		,	index: 4
		}

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
