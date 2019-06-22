/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Transaction.ServiceController.js
// ----------------
// Service to list transactions
define(
	'Transaction.ServiceController'
,	[
		'ServiceController'
	,	'Transaction.Model'
	]
,	function(
		ServiceController
	,	TransactionModel
	)
	{
		'use strict';

		// @class Transaction.ServiceController List transactions
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'Transaction.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}

			// @method get The call to Transaction.Service.ss with http method 'get' is managed by this function
			// @return {Transaction.Model.Get.Result || Transaction.Model.List.Result}
		,	get: function()
			{
				var id = this.request.getParameter('internalid')
			,	record_type = this.request.getParameter('recordtype');

				if (id && record_type)
				{
					return TransactionModel.get(record_type, id);
				}
				else
				{
					return TransactionModel.list(
					{
						filter: this.request.getParameter('filter')
					,	order: this.request.getParameter('order')
					,	sort: this.request.getParameter('sort')
					,	from: this.request.getParameter('from')
					,	to: this.request.getParameter('to')
					,	page: this.request.getParameter('page') || 1
					,	types: this.request.getParameter('types')
					,	createdfrom: this.request.getParameter('createdfrom')
					});
				}
			}
		});
	}
);