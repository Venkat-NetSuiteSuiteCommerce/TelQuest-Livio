/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Profile.ServiceController.js
// ----------------
// Service to manage profile requests
define(
	'Profile.ServiceController'
,	[
		'ServiceController'
	,	'SC.Models.Init'
	,	'Profile.Model'
	]
,	function(
		ServiceController
	,	ModelsInit
	,	ProfileModel
	)
	{
		'use strict';

		// @class Profile.ServiceController Manage profile requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'Profile.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLoggedInPPS: true
				}
			,	put:
				{
					requireLogin: true
				}
			}

		// @method get The call to Profile.Service.ss with http method 'get' is managed by this function
		// @return {Profile.Model.Item}
		,	get: function()
			{
				return ProfileModel.get();
			}

		// @method put The call to Profile.Service.ss with http method 'put' is managed by this function
		// @return {Profile.Model.Item}
		,	put: function()
			{
				// Pass the data to the Profile's update method and send it response
				ProfileModel.update(this.data);
				return ProfileModel.get();
			}
		});
	}
);