/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// OrderHistory.ServiceController.js
// ----------------
// Service to manage placed orders requests
define(
	'OrderHistory.ServiceController'
,	[
		'ServiceController'
	,	'OrderHistory.Model'
	]
,	function(
		ServiceController
	,	OrderHistoryModel
	)
	{
		'use strict';

		// @class OrderHistory.ServiceController Manage placed orders requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'OrderHistory.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				,	requirePermissions: {
						list: [
							'transactions.tranFind.1'
						,	OrderHistoryModel.isSCISIntegrationEnabled ? 'transactions.tranPurchases.1' : 'transactions.tranSalesOrd.1'
						]
					}
				}
			}

			// @method get The call to OrderHistory.Service.ss with http method 'get' is managed by this function
			// @return {Transaction.Model.Get.Result || Transaction.Model.List.Result}
		,	get: function ()
			{
				var recordtype = this.request.getParameter('recordtype')
				,	id = this.request.getParameter('internalid');
				//If the id exist, sends the response of Order.get(id), else sends the response of (Order.list(options) || [])
				if (recordtype && id)
				{
					return OrderHistoryModel.get(recordtype, id);
				}
				else
				{
					return OrderHistoryModel.list({
						filter: this.request.getParameter('filter')
					,	order: this.request.getParameter('order')
					,	sort: this.request.getParameter('sort')
					,	from: this.request.getParameter('from')
					,	to: this.request.getParameter('to')
					,	origin: this.request.getParameter('origin')
					,	page: this.request.getParameter('page') || 1
					,	results_per_page: this.request.getParameter('results_per_page')
					});
				}
			}

			// @method put The call to OrderHistory.Service.ss with http method 'put' is managed by this function
			// @return {Transaction.Model.Get.Result}
		,	put: function()
			{
				var id = this.request.getParameter('internalid')
				,	cancel_result = OrderHistoryModel.update(id, this.data, this.request.getAllHeaders())
				,	record = OrderHistoryModel.get(this.data.recordtype, id);
				
				record.cancel_response = cancel_result;
				return record;
			}
		});
	}
);