/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Account.RegisterAsGuest.ServiceController.js
// ----------------
// Service to enable the user to be registered as a guest.
define(
	'Account.RegisterAsGuest.ServiceController'
,	[
		'ServiceController'
	,	'Account.Model'
	]
,	function(
		ServiceController
	,	AccountModel
	)
	{
		'use strict';

		// @class Account.RegisterAsGuest.ServiceController Supports register as guest process
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'Account.RegisterAsGuest.ServiceController'

			// @method post The call to Account.RegisterAsGuest.Service.ss with http method 'post' is managed by this function
			// @return {Account.Model.Attributes}
		,	post: function()
			{
				return AccountModel.registerAsGuest(this.data);
			}
		});
	}
);