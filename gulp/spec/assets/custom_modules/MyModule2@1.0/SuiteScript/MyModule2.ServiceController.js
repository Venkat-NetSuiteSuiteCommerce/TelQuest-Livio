// Address.ServiceController.js
// ----------------
// Service to manage addresses requests
define(
	'MyModule2.ServiceController'
,	[
		'ServiceController'
	,	'Application'
	,	'Address.Model'
	]
,	function(
		ServiceController
	,	Application
	,	AddressModel
	)
	{
		'use strict';

		// @class Address.ServiceController Manage addresses requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'MyModule2.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}

			// @method get The call to Address.Service.ss with http method 'get' is managed by this function
			// @return {Address.Model.Attributes | Array<Address.Model.Attributes>} one or all user addresses
		,	get: function()
			{
				var id = this.request.getParameter('internalid');
				return id ? AddressModel.get(id) : (AddressModel.list() || []);
			}

			// @method post The call to Address.Service.ss with http method 'post' is managed by this function
			// @return {AddressModel.Attributes}
		,	post: function()
			{
				var id = AddressModel.create(this.data);
				//Do not return anything here, we need send content with status 201
				this.sendContent(AddressModel.get(id), {'status': 201});
			}

			// @method update The call to Address.Service.ss with http method 'put' is managed by this function
			// @return {Address.Model.Attributes}
		,	put: function()
			{
				var id = this.request.getParameter('internalid');
				AddressModel.update(id, this.data);
				return AddressModel.get(id);
			}

			// @method delete The call to Address.Service.ss with http method 'delete' is managed by this function
			// @return {StatusObject}
		,	delete: function()
			{
				var id = this.request.getParameter('internalid');
				AddressModel.remove(id);
				// If something goes wrong in the remove, an exception will fire
				return {'status': 'ok'};
			}
		});
	}
);