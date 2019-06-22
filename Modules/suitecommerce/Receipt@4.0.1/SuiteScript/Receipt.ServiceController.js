/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Receipt.ServiceController.js
// ----------------
// Service to manage invoice requests
define(
	'Receipt.ServiceController'
,	[
		'ServiceController'
	,	'Receipt.Model'
	]
,	function(
		ServiceController
	,	ReceiptModel
	)
	{
		'use strict';

		// @class Receipt.ServiceController Manage invoice requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'Receipt.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				,	requirePermissions: {
						list: [
							'transactions.tranFind.1'
						,	'transactions.tranCashSale.1'
						]
					}
				}
			}

			// @method get The call to Receipt.Service.ss with http method 'get' is managed by this function
			// @return {Transaction.Model.Get.Result || Transaction.Model.List.Result}
		,	get: function()
			{
				var id = this.request.getParameter('internalid')
				,	status = this.request.getParameter('status')
				,	page = this.request.getParameter('page');

				// If the id exist, sends the response of Receipt.get(id), else send (Receipt.list(options) || [])
				return id ? ReceiptModel.get('cashsale', id) : ReceiptModel.list({
							types: 'CashSale'
						,	status: status
						,	page: page
						});
			}
		});
	}
);