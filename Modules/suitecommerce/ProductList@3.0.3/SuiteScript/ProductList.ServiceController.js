/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ProductList.ServiceController.js
// ----------------
// Service to manage credit cards requests
define(
	'ProductList.ServiceController'
,	[
		'ServiceController'
	,	'SC.Models.Init'
	,	'Application'
	,	'ProductList.Model'
	]
,	function(
		ServiceController
	,	ModelsInit
	,	Application
	,	ProductListModel
	)
	{
		'use strict';

		// @class ProductList.ServiceController  Manage product list request
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'ProductList.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLoggedInPPS: true
				}
			}

			// @method getUser
			// @return {Integer} user id
		,	getUser: function()
			{
				var user = ModelsInit.session.isLoggedIn2() ? nlapiGetUser() : 0
				,	role = ModelsInit.context.getRoleId();

				// This is to ensure customers can't query other customer's product lists.
				if (role !== 'shopper' && role !== 'customer_center')
				{
					user = parseInt(this.request.getParameter('user') || (this.data.owner && this.data.owner.id) || user, 10);
				}
				return user;
			}

			// @method getId
			// @return {String} internalid
		,	getId: function()
			{
				return this.request.getParameter('internalid') || this.data.internalid;
			}

			// @method get The call to ProductList.Service.ss with http method 'get' is managed by this function
			// @return {ProductList.Model.Get.Result || ProductList.Model.List.Result}
		,	get: function()
			{

				var id = this.getId()
				,	user = this.getUser();

				if (id)
				{
					if (id === 'later')
					{
						return ProductListModel.getSavedForLaterProductList(user);
					}
					else if (id === 'quote')
					{
						return ProductListModel.getRequestAQuoteProductList(user);
					}
					else
					{
						return ProductListModel.get(user, id);
					}
				}
				else
				{
					return ProductListModel.search(user, 'name');
				}
			}

			// @method post The call to ProductList.Service.ss with http method 'post' is managed by this function
			// @return {StatusObject}
		,	post: function()
			{
				var user = this.getUser()
				,	internalid = ProductListModel.create(user, this.data);
				// Do not return here as we need to output the status 201
				this.sendContent(ProductListModel.get(user, internalid), {'status': 201});
			}

			// @method put The call to ProductList.Service.ss with http method 'put' is managed by this function
			// @return {ProductList.Model.Get.Result}
		,	put: function()
			{
				var id = this.getId()
				,	user = this.getUser();
				ProductListModel.update(user, id, this.data);
				return ProductListModel.get(user, id);
			}

			// @method delete The call to ProductList.Service.ss with http method 'delete' is managed by this function
			// @return {StatusObject}
		,	delete: function()
			{
				var id = this.getId()
				,	user = this.getUser();
				ProductListModel.delete(user, id);
				return {'status': 'ok'};
			}
		});
	}
);