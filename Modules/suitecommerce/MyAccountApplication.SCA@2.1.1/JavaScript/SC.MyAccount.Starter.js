/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	'SC.MyAccount.Starter'
,	[
		'SC.MyAccount'
	,	'jQuery'
	,	'underscore'
	,	'Backbone'

	,	'SC.MyAccount.Starter.Dependencies' // Auto generated at build time using configuration from distro.json
	,	'SC.Extensions'
	]
,	function(
		MyAccount
	,	jQuery
	,	_
	,	Backbone

	,	entryPointModules
	,	entryPointExtensionsModules
	)
{
	'use strict';

	// At starting time all the modules Array is initialized
	entryPointModules = entryPointModules.concat(entryPointExtensionsModules);
	
	jQuery(function ()
	{
		MyAccount.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

		MyAccount.start(entryPointModules, function ()
		{
			// Checks for errors in the context
			if (SC.ENVIRONMENT.contextError)
			{
				// Hide the header and footer.
				MyAccount.getLayout().$('#site-header').hide();
				MyAccount.getLayout().$('#site-footer').hide();

				// Shows the error.
				MyAccount.getLayout().internalError(SC.ENVIRONMENT.contextError.errorMessage, 'Error ' + SC.ENVIRONMENT.contextError.errorStatusCode + ': ' + SC.ENVIRONMENT.contextError.errorCode);
			}
			else
			{
				var fragment = _.parseUrlOptions(location.search).fragment;
				if (fragment && !location.hash)
				{
					location.hash = decodeURIComponent(fragment);
				}
				Backbone.history.start();
			}

			MyAccount.getLayout().appendToDom();
		});
	});
});
