/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Account.Login.ServiceController.js
// ----------------
// Service to handle the login of a user into the system
define(
	'Account.Login.ServiceController'
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

	// @class Account.Login.ServiceController Supports login process
	// @extend ServiceController
	return ServiceController.extend({

		// @property {String} name Mandatory for all ssp-libraries model
		name:'Account.Login.ServiceController'

			// @method post The call to Account.Login.Service.ss with http method 'post' is managed by this function
			// @return {Account.Model.Attributes}
		,	post: function()
			{
				return AccountModel.login(this.data.email, this.data.password, this.data.redirect);
			}
		});
	}
);
