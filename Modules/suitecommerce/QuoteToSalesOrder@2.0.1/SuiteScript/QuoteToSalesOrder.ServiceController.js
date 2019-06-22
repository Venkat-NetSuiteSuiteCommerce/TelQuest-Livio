/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// QuoteToSalesOrder.ServiceController.js
// ----------------
// Service to manage quote to sales order request
define(
	'QuoteToSalesOrder.ServiceController'
,	[
		'ServiceController'
	,	'SC.Models.Init'
	,	'QuoteToSalesOrder.Model'
	]
,	function(
		ServiceController
	,	ModelsInit
	,	QuoteToSalesOrderModel
	)
	{
		'use strict';

		// @class QuoteToSalesOrder.ServiceController Manage quote to sales order request
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'QuoteToSalesOrder.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					checkLoggedInCheckout : true
				}
			}

			// @method get The call to QuoteToSalesOrder.Service.ss with http method 'get' is managed by this function
			// @return {Transaction.Model.Get.Result}
		,	get: function()
			{
				var quote_id = this.request.getParameter('quoteid')
				,	salesorder_id = this.request.getParameter('salesorderid')
				,	skip_validation = this.request.getParameter('skipvalidation');

				return QuoteToSalesOrderModel.get(salesorder_id, quote_id, skip_validation);
			}

			// @method post The call to QuoteToSalesOrder.Service.ss with http method 'post' is managed by this function
			// @return {Transaction.Model.Get.Result}
		,	post: function()
			{
				var quote_id = this.request.getParameter('quoteid')
				,	salesorder_id = this.request.getParameter('salesorderid');

				// Updates the order with the passed in data
				QuoteToSalesOrderModel.update(salesorder_id, quote_id, this.data);
				// Gets the status
				var order_info = QuoteToSalesOrderModel.get(salesorder_id, quote_id, true);
				// Finally Submits the order
				order_info.confirmation = QuoteToSalesOrderModel.submit();
				//Override tempid with the real sales order id that have been created
				order_info.internalid = order_info.confirmation.internalid;

				return order_info;
			}

			// @method put The call to QuoteToSalesOrder.Service.ss with http method 'put' is managed by this function
			// @return {Transaction.Model.Get.Result}
		,	put: function()
			{
				var quote_id = this.request.getParameter('quoteid')
				,	salesorder_id = this.request.getParameter('salesorderid');
				// Pass the data to the quoteToSalesOrderModel's update method and send it response
				QuoteToSalesOrderModel.update(salesorder_id, quote_id, this.data);
				return QuoteToSalesOrderModel.get(salesorder_id, quote_id, true);
			}
		});
	}
);