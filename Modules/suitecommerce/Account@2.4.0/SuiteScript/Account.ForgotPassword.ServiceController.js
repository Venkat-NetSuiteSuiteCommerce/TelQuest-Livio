/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Account.ForgotPassword.ServiceController.js
// ----------------
// Service to enable the user to recover the password when he forgets it
define(
	'Account.ForgotPassword.ServiceController'
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

		// @class Account.ForgotPassword.ServiceController
		// Supports password recovery process
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'Account.ForgotPassword.ServiceController'

			// @method post The call to Account.ForgotPassword.Service.ss with http method 'post' is managed by this function
			// @return {Boolean} True if the password retrieval email is successfully sent
		,	post: function ()
			{
				return AccountModel.forgotPassword(this.data.email);
			}
		});
	}
);