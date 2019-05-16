/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Case.ServiceController.js
// ----------------
// Service to manage support cases
define(
	'Case.ServiceController'
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

		// @class Case.ServiceController Manage support cases
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'Case.ServiceController'

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

			// @method get The call to Case.Service.ss with http method 'get' is managed by this function
			// @return {Array<Case.Model.Attributes>}
		,	get: function()
			{
				var id = this.request.getParameter('internalid') || this.data.internalid;
				if(id)
				{
					return CaseModel.get(id);
				}
				else
				{
					var list_header_data = {
						filter: this.request.getParameter('filter')
					,   order: this.request.getParameter('order')
                    ,   sort: this.request.getParameter('sort')
                    ,   from: this.request.getParameter('from')
                    ,   to: this.request.getParameter('to')
                    ,   page: this.request.getParameter('page')
					};
					return CaseModel.search(nlapiGetUser() + '', list_header_data);
				}
			}

			// @method post The call to Case.Service.ss with http method 'post' is managed by this function
			// @return {Case.Model.Attributes}
		,	post: function()
			{
				var new_case_id = CaseModel.create(nlapiGetUser() + '', this.data);
				return CaseModel.get(new_case_id);
			}

			// @method put The call to Case.Service.ss with http method 'put' is managed by this function
			// @return {Case.Model.Attributes}
		,	put: function()
			{
				var id = this.request.getParameter('internalid') || this.data.internalid;
				CaseModel.update(id, this.data);
				return CaseModel.get(id);
			}
		});
	}
);