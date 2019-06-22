/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Account.Register.ServiceController.js
// ----------------
// Service to receive a new user registration
define(
	'Account.Register.ServiceController'
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

		// @class Account.Register.ServiceController Supports register process
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'Account.Register.ServiceController'

			// @method post The call to Account.Register.Service.ss with http method 'post' is managed by this function
			// @return {Account.Model.register.data} Object literal with registration related data
		,	post: function()
			{
				return AccountModel.register(this.data);
			}
		});
	}
);