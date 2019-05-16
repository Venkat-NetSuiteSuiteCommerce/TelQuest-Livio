/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Balance
define('Balance.Router'
,	[	'Balance.View'
	,	'Backbone'
	]
,	function (
		View
	,	Backbone
	)
{
	'use strict';

	//@class Balance.Router @extend Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'balance': 'showBalance'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	showBalance: function ()
		{
			new View({
				application: this.application
			}).showContent();
		}
	});
});
