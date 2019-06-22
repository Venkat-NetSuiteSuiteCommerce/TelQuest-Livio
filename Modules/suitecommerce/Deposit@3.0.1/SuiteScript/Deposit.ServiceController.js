/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Deposit.ServiceController.js
// ----------------
// Service to manage deposit requests
define(
	'Deposit.ServiceController'
,	[
		'ServiceController'
	,	'Deposit.Model'
	]
,	function(
		ServiceController
	,	DepositModel
	)
	{
		'use strict';

		// @class Deposit.ServiceController Manage deposit requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'Deposit.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}

			// @method get The call to Deposit.Service.ss with http method 'get' is managed by this function
			// @return {Deposit.Model}
		,	get: function()
			{
				var id = this.request.getParameter('internalid');
				return DepositModel.get('customerdeposit', id);
			}
		});
	}
);