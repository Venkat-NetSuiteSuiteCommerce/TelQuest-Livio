/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Quote.ServiceController.js
// ----------------
// Service to manage quote requests
define(
	'Quote.ServiceController'
,	[
		'ServiceController'
	,	'Quote.Model'
	]
,	function(
		ServiceController
	,	QuoteModel
	)
	{
		'use strict';

		try
		{
			// @class Quote.ServiceController Manage quote requests
			// @extend ServiceController
			return ServiceController.extend({

				// @property {String} name Mandatory for all ssp-libraries model
				name: 'Quote.ServiceController'

				// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
				// The values in this object are the validation needed for the current service.
				// Can have values for all the request methods ('common' values) and specific for each one.
			,	options: {
					common: {
						requireLogin: true
					,	requirePermissions: {
							list: [
								'transactions.tranEstimate.1'
							,	'transactions.tranFind.1'
							]
						}
					}
				}

				// @method get The call to Quote.Service.ss with http method 'get' is managed by this function
				// @return {Transaction.Model.Get.Result || Transaction.Model.List.Result}
			,	get: function()
				{
					var id = this.request.getParameter('internalid');
					if (id)
					{
						return QuoteModel.get('estimate', id);
					}
					else
					{
						return QuoteModel.list({
							filter: this.request.getParameter('filter')
						,	order: this.request.getParameter('order')
						,	sort: this.request.getParameter('sort')
						,	from: this.request.getParameter('from')
						,	to: this.request.getParameter('to')
						,	page: this.request.getParameter('page') || 1
						,	types: this.request.getParameter('types')
					});
					}
				}

				// @method post The call to Quote.Service.ss with http method 'post' is managed by this function
				// @return {Transaction.Model.Get.Result}
			,	post: function()
				{
					// Updates the order with the passed in data
					QuoteModel.update('estimate', this.data.internalid || 'null', this.data);

					// Gets the status
					var order_info = QuoteModel.get('estimate', this.data.internalid || 'null');

					// Finally Submits the order
					order_info.confirmation = QuoteModel.submit();
					// //Override tempid with the real sales order id that have been created
					// order_info.internalid = order_info.confirmation.internalid;
					return order_info;
				}

				// @method put The call to Quote.Service.ss with http method 'put' is managed by this function
				// @return {Transaction.Model.Get.Result}
			,	put: function()
				{
					// Pass the data to the quote_model's update method and send it response
					QuoteModel.update('estimate', this.data.internalid, this.data);
					return QuoteModel.get('estimate', this.data.internalid);
				}
			});
		}
		catch (e)
		{
			console.warn('QuotePos.Service.ss' + e.name, e);
			this.sendError(e);
		}
	}
);