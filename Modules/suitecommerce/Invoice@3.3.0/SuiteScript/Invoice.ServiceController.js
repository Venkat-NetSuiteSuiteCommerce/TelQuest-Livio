/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Invoice.Service.ss
// ----------------
// Service to manage invoice requests
define(
	'Invoice.ServiceController'
,	[
		'ServiceController'
	,	'Invoice.Model'
	]
,	function(
		ServiceController
	,	InvoiceModel
	)
	{
		'use strict';

		// @class Invoice.ServiceController Supports login process
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'Invoice.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				,	requirePermissions: {
						operator: 'or'
					,	list: [
							'transactions.tranFind.1'
						,	'transactions.tranCustInvc.1'
						]
					}
				}
			}

		// @method get The call to Invoice.Service.ss with http method 'get' is managed by this function
		// @return {Transaction.Model.Get.Result || Transaction.Model.List.Result}
		,	get: function()
			{
				var id = this.request.getParameter('internalid')
				,	status = this.request.getParameter('status')
				,	page = this.request.getParameter('page');

				return id ?
					InvoiceModel.get('invoice', id) :
					InvoiceModel.list({
							types: 'CustInvc'
						,	status: status
						,	page: page
						});
			}
		});
	}
);