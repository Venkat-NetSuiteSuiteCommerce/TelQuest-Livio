/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// CreditCard.ServiceController.js
// ----------------
// Service to manage credit cards requests
define(
	'CreditCard.ServiceController'
,	[
		'ServiceController'
	,	'CreditCard.Model'
	]
,	function(
		ServiceController
	,	CreditCardModel
	)
	{
		'use strict';

		// @class CreditCard.ServiceController Manage credit cards requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'CreditCard.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLogin: true
				}
			}

			// @method get The call to CreditCard.Service.ss with http method 'get' is managed by this function
			// @return {CreditCard.Model.Attributes || Array<CreditCard.Model.Attributes>} One or a list of credit cards
		,	get: function()
			{
				var id = this.request.getParameter('internalid');
				return id ? CreditCardModel.get(id) : (CreditCardModel.list() || []);
			}

			// @method post The call to CreditCard.Service.ss with http method 'post' is managed by this function
			// @return {StatusObject}
		,	post: function()
			{
				var id = CreditCardModel.create(this.data);
				this.sendContent(CreditCardModel.get(id), {'status': 201});
				// Do not return here as we need to output the status 201
			}

			// @method put The call to CreditCard.Service.ss with http method 'put' is managed by this function
			// @return {CreditCard.Model.Attributes} The updated credit card
		,	put: function()
			{
				var id = this.request.getParameter('internalid');
				CreditCardModel.update(id, this.data);
				return CreditCardModel.get(id);
			}

			// @method delete The call to CreditCard.Service.ss with http method 'delete' is managed by this function
			// @return {StatusObject}
		,	delete: function()
			{
				var id = this.request.getParameter('internalid');
				CreditCardModel.remove(id);

				return {'status':'ok'};
			}
		});
	}
);