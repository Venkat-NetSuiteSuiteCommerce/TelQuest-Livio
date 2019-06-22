/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// CreditMemo.ServiceController.js
// ----------------
// Service to manage CreditMemo requests
define(
	'CreditMemo.ServiceController'
,	[
		'ServiceController'
	,	'CreditMemo.Model'
	]
,	function(
		ServiceController
	,	CreditMemoModel
	)
	{
		'use strict';

		// @class CreditMemo.ServiceController Manage credit memo requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'CreditMemo.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}

			// @method get The call to CreditMemo.Service.ss with http method 'get' is managed by this function
			// @return {CreditMemo.Model}
		,	get: function()
			{
				var id = this.request.getParameter('internalid');
				return CreditMemoModel.get('creditmemo', id);
			}
		});
	}
);