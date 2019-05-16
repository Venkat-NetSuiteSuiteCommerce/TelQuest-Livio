/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module LoginRegister
// Handles views and routers of Login/Register Page. Includes Register Guest, Forgot Passowrd and Reset password
define('LoginRegister'
,	['LoginRegister.Router']
,	function (Router)
{
	'use strict';

	//@class LoginRegisterModule @extend ApplicationModule
	return {
		mountToApp: function (application)
		{
			if (application.getConfig('modulesConfig.LoginRegister.startRouter'))
			{
				return new Router(application);
			}
		}
	};
});