/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// PrintStatement.ServiceController.js
// ----------------
// Service to manage print requests
define(
	'PrintStatement.ServiceController'
,	[
		'ServiceController'
	,	'PrintStatement.Model'
	]
,	function(
		ServiceController
	,	PrintStatementModel
	)
	{
		'use strict';

		// @class PrintStatement.ServiceController Manage print requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'PrintStatement.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			,	post : {
					requirePermissions: {
						extraList: [
							'transactions.tranStatement.2'
						]
					}
				}
			}

			// @method post The call to PrintStatement.Service.ss with http method 'post' is managed by this function
			// @return {PrintStatementModel.UrlObject}
		,	post: function()
			{
				return {'url': PrintStatementModel.getUrl(this.data)};
			}
		});
	}
);