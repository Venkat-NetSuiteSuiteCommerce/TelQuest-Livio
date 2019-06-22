/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CookieWarningBanner
// Handles the display of the banner to be displayed warning the customers about the site's use of cookies
define(
	'CookieWarningBanner'
,	[
		'CookieWarningBanner.View'
	,	'Header.View'
	]
,	function (
		CookieWarningBannerView
	,	HeaderView
	)
{
	'use strict';

	// @class CookieWarningBanner
	// @extends ApplicationModule
	return {
		mountToApp: function (application)
		{
			//Set the request a quote link on the Desktop header
			HeaderView.addChildViews({
				'Message.Placeholder': function wrapperFunction ()
				{
					return function ()
					{
						return new CookieWarningBannerView({application:application});
					};
				}
			});
		}
	};
});
