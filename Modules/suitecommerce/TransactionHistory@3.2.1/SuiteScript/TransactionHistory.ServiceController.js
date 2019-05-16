/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// TransactionHistory.ServiceController.js
// ----------------
// Service to list transactions
define(
	'TransactionHistory.ServiceController'
,	[
		'ServiceController'
	,	'TransactionHistory.Model'
	,	'Application'
	]
,	function(
		ServiceController
	,	TransactionHistoryModel
	,	Application
	)
	{
		'use strict';

		// @class TransactionHistory.ServiceController List transactions
		// @extend ServiceController
		return ServiceController.extend({

			//@property {String} name Mandatory for all ssp-libraries model
			name: 'TransactionHistory.ServiceController'

		,	options: {
				common: {
					requireLogin: true
				}
			}

			// @method _validatePermission Validate permissions of this specific Service Controller. We use this function as an exception here,
			// because the validation conditions are particular and not repeated in other services.
			// @return {Void} If the validation fails, we throw an error
		,	_validatePermission: function ()
			{
				var permissions = Application.getPermissions().transactions;

				if (!(permissions.tranFind 			> 0 &&
					(permissions.tranCustInvc 		> 0 ||
					permissions.tranCustCred	 	> 0 ||
					permissions.tranCustPymt 		> 0 ||
					permissions.tranCustDep 		> 0 ||
					permissions.tranDepAppl 		> 0)))
				{
					throw forbiddenError;
				}
			}


			// @method get The call to TransactionHistory.Service.ss with http method 'get' is managed by this function
			// @return {TransactionHistoryModel.list} A list featuring the transaction history
		,	get: function()
			{
				this._validatePermission();

				return TransactionHistoryModel.list(
					{
						filter: this.request.getParameter('filter')
					,	order: 	this.request.getParameter('order')
					,	sort: 	this.request.getParameter('sort')
					,	from: 	this.request.getParameter('from')
					,	to: 	this.request.getParameter('to')
					,	page: 	this.request.getParameter('page') || 1
					});
			}
		});
	}
);