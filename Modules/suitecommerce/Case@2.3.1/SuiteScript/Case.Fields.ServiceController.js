/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Case.Fields.ServiceController.js
// ----------------
// Service to manage support case fields
define(
	'Case.Fields.ServiceController'
,	[
		'ServiceController'
	,	'Case.Model'
	]
,	function(
		ServiceController
	,	CaseModel
	)
	{
		'use strict';
		// @class Case.Fields.ServiceController Manage support case fields
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'Case.Fields.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				,	requirePermissions: {
						list: [
							'lists.listCase.1'
						]
					}
				}
			}

			// @method get The call to Case.Fields.Service.ss with http method 'get' is managed by this function
			// @return {Case.Model} New Case record
		,	get: function()
			{
				return CaseModel.getNew();
			}
		});
	}
);