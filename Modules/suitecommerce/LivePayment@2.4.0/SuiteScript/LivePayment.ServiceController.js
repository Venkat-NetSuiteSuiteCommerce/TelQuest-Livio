/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// LivePayment.ServiceController.js
// ----------------
// Service to manage cart items requests
define(
	'LivePayment.ServiceController'
,	[
		'ServiceController'
	,	'LivePayment.Model'
	]
,	function(
		ServiceController
	,	LivePaymentModel
	)
	{
		'use strict';

		// @class LivePayment.ServiceController Manage cart items requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'LivePayment.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				,	requirePermissions: {
						list: [
							'transactions.tranCustPymt.2'
						,	'transactions.tranCustInvc.1'
						]
					}
				}
			}

			// @method get The call to LivePayment.Service.ss with http method 'get' is managed by this function
			// @return {LivePayment.Model}
		,	get: function()
			{
				return LivePaymentModel.get();
			}

			// @method post The call to LivePayment.Service.ss with http method 'post' is managed by this function
			// @return {LivePayment.Model}
		,	post: function()
			{
				return LivePaymentModel.submit(this.data);
			}

			// @method put The call to LivePayment.Service.ss with http method 'put' is managed by this function
			// @return {LivePayment.Model}
		,	put: function ()
			{
				return LivePaymentModel.submit(this.data);
			}
		});
	}
);