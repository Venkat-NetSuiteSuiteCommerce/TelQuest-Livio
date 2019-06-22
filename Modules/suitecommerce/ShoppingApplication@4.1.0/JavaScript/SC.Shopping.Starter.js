/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ShoppingApplication
// @class SCA.Shopping.Starter the main file to be loaded with requirejs tools. It contains all required dependencies
// to run Shopping and also it will start() the Shopping Applicaiton.
define(
	'SC.Shopping.Starter'
,	[
		'SC.Shopping'
	,	'jQuery'
	,	'underscore'
	,	'Backbone'
	,	'SC.Shopping.Starter.Dependencies' // Auto generated at build time using configuration from distro.json
	,	'SC.Extensions'
	]
,	function(
		Shopping

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
	
	function startShopping ()
	{
		// we don't want to start the application if it is served externally, like in google cached pages.
		if (SC.isCrossOrigin())
		{
			// an user seeing the page in cache.google with js enabled won't see the images unless we unwrap it:
			jQuery('noscript').each(function()
			{
				jQuery(this).parent().append(jQuery(this).text());
			});
			return;
		}

		Shopping.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

		// The page generator needs to run in sync in order to work properly
		if (SC.isPageGenerator())
		{
			jQuery.ajaxSetup({ async: false });
		}

		jQuery.fn.modal.Constructor.BACKDROP_TRANSITION_DURATION = 0; //This is in order to prevent Quick View redrawing issues

		// When the document is ready we call the application.start, and once that's done we bootstrap and start backbone
		Shopping.start(entryPointModules, function ()
		{
			// Checks for errors in the context
			if (SC.ENVIRONMENT.contextError)
			{
				// Hide the header and footer.
				Shopping.getLayout().$('#site-header').hide();
				Shopping.getLayout().$('#site-footer').hide();

				// Shows the error.
				Shopping.getLayout().internalError(SC.ENVIRONMENT.contextError.errorMessage,'Error ' + SC.ENVIRONMENT.contextError.errorStatusCode + ': ' + SC.ENVIRONMENT.contextError.errorCode);
			}
			else
			{
				var fragment = _.parseUrlOptions(location.search).fragment;

				if (fragment && !location.hash)
				{
					location.hash = decodeURIComponent(fragment);
				}

				if (Shopping.getUser)
				{
					Shopping.getUser().done(function (){
						// Only do push state client side.
						Backbone.history.start({ pushState: !SC.isDevelopment && SC.ENVIRONMENT.jsEnvironment === 'browser' });
					});
				}
				else
				{
					// Only do push state client side.
					Backbone.history.start({ pushState: !SC.isDevelopment && SC.ENVIRONMENT.jsEnvironment === 'browser' });
				}
			}

			Shopping.getLayout().appendToDom();
		});
	}

	jQuery(document).ready(startShopping);
});
