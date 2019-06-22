/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ReturnAuthorization.ServiceController.js
// ----------------
// Service to manage return authorization requests
define(
	'ReturnAuthorization.ServiceController'
,	[
		'ServiceController'
	,	'ReturnAuthorization.Model'
	]
,	function(
		ServiceController
	,	ReturnAuthorizationModel
	)
	{
		'use strict';

		// @class ReturnAuthorization.ServiceController Manage return authorization requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'ReturnAuthorization.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				,	requirePermissions: {
						list: [
							ReturnAuthorizationModel.isSCISIntegrationEnabled ? 'transactions.tranPurchasesReturns.1' : 'transactions.tranRtnAuth.1'
						,	'transactions.tranFind.1'
						]
					}
				}
			,	post: {
					requirePermissions: {
						extraList: [
							'transactions.tranRtnAuth.2'
						]
					}
				}
			}

		// @method get The call to ReturnAuthorization.Service.ss with http method 'get' is managed by this function
		// @return {Transaction.Model.Get.Result || Transaction.Model.List.Result}
		,	get: function ()
			{
				var recordtype = this.request.getParameter('recordtype')
				,	id = this.request.getParameter('internalid');

				return id && recordtype ? ReturnAuthorizationModel.get(recordtype, id) : ReturnAuthorizationModel.list(
				{
					order: this.request.getParameter('order')
				,	sort: this.request.getParameter('sort')
				,	from: this.request.getParameter('from')
				,	to: this.request.getParameter('to')
				,	page: this.request.getParameter('page')
				});
			}

			// @method post The call to ReturnAuthorization.Service.ss with http method 'post' is managed by this function
			// @return {StatusObject}
		,	post: function ()
			{
				var id = ReturnAuthorizationModel.create(this.data);
				this.sendContent(ReturnAuthorizationModel.get('returnauthorization', id), {'status': 201});
			}
		});
	}
);