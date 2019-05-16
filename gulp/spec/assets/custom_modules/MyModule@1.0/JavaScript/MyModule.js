//@module Cart
define('MyModule'
,	[	
		'MyModule.Router'
	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	]
,	function (
		Router
	,	_
	,	jQuery
	,	Backbone
	)
{
	'use strict';

	return {
		
		mountToApp: function (application)
		{

			// Initializes the router
			if (application.getConfig('modulesConfig.Cart.startRouter') || true)
			{
				return new Router(application, application.getConfig('mymodule.configoption1'));
			}

		}
	};
});
