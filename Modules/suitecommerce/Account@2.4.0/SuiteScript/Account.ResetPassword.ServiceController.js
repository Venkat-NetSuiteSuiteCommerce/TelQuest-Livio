/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Account.ResetPassword.ServiceController.js
// ----------------
// Service to reset the password of a user
define(
	'Account.ResetPassword.ServiceController'
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

		// @class Account.ResetPassword.ServiceController Supports reset password process
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'Account.ResetPassword.ServiceController'

			// @method post The call to Account.ResetPassword.Service.ss with http method 'post' is managed by this function
			// @return {Boolean} success
		,	post: function()
			{
				return AccountModel.resetPassword(this.data.params, this.data.password);
			}
		});
	}
);