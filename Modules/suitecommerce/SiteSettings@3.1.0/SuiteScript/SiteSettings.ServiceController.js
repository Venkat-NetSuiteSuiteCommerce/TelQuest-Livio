/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// SiteSettings.ServiceController.js
// ----------------
// Service to manage sitesettings requests
define(
	'SiteSettings.ServiceController'
,	[
		'ServiceController'
	,	'SiteSettings.Model'
	]
,	function(
		ServiceController
	,	SiteSettingsModel
	)
	{
		'use strict';

		// @class SiteSettings.ServiceController Manage sitesettings requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'SiteSettings.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLoggedInPPS: true
				}
			}

			// @method get The call to SiteSettings.Service.ss with http method 'get' is managed by this function
			// @return {ShoppingSession.SiteSettings}
		,	get: function()
			{
				return SiteSettingsModel.get();
			}
		});
	}
);