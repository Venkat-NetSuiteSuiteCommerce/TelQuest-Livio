/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// DepositApplication.ServiceController.js
// ----------------
// Service to manage credit cards requests
define(
	'DepositApplication.ServiceController'
,	[
		'ServiceController'
	,	'DepositApplication.Model'
	]
,	function(
		ServiceController
	,	DepositApplicationModel
	)
	{
		'use strict';

		// @class DepositApplication.ServiceController Supports login process
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'DepositApplication.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}

			// @method get The call to DepositApplication.Service.ss with http method 'get' is managed by this function
			// @return {DepositApplication.Model}
		,	get: function()
			{
				var id = this.request.getParameter('internalid');
				return DepositApplicationModel.get('depositapplication', id);
			}
		});
	}
);