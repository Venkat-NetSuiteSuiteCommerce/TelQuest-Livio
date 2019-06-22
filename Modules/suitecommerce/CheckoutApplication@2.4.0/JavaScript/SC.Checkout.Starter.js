/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	'SC.Checkout.Starter'
,	[
		'SC.Checkout'
	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Utils'

	,	'SC.Checkout.Starter.Dependencies' // Auto generated at build time using configuration from distro.json
	,	'SC.Extensions'
	]
,	function(
		application
	,	_
	,	jQuery
	,	Backbone
	,	Utils

	,	entryPointModules
	,	entryPointExtensionsModules
	)
{

	'use strict';
	
	// At starting time all the modules Array is initialized
	entryPointModules = entryPointModules.concat(entryPointExtensionsModules);

	jQuery(function ()
	{
		application.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

		if (SC.ENVIRONMENT.CHECKOUT.skipLogin)
		{
			application.Configuration.checkout = application.Configuration.checkout || {};
			application.Configuration.checkout.skipLogin = SC.ENVIRONMENT.CHECKOUT.skipLogin;
			delete SC.ENVIRONMENT.CHECKOUT.skipLogin;
		}

		application.start(entryPointModules, function ()
		{
			// Checks for errors in the context
			if (SC.ENVIRONMENT.contextError)
			{
				// Shows the error.
				if (SC.ENVIRONMENT.contextError.errorCode === 'ERR_WS_EXPIRED_LINK')
				{
					application.getLayout().expiredLink(SC.ENVIRONMENT.contextError.errorMessage);
				}
				else
				{
					application.getLayout().internalError(SC.ENVIRONMENT.contextError.errorMessage, 'Error ' + SC.ENVIRONMENT.contextError.errorStatusCode + ': ' + SC.ENVIRONMENT.contextError.errorCode);
				}
			}
			else
			{
				var fragment = Utils.parseUrlOptions(location.search).fragment;

				if (fragment && !location.hash)
				{
					location.hash = decodeURIComponent(fragment);
				}

				Backbone.history.start();
			}

			application.getLayout().appendToDom();
		});
	});
});
