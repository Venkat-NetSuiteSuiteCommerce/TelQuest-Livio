/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// LiveOrder.Line.ServiceController.js
// ----------------
// Service to manage lines in the live order
define(
	'LiveOrder.Line.ServiceController'
,	[
		'ServiceController'
	,	'SC.Models.Init'
	,	'LiveOrder.Model'
	,	'underscore'
	]
,	function(
		ServiceController
	,	ModelsInit
	,	LiveOrderModel
	,	_
	)
	{
		'use strict';

		// @class LiveOrder.Line.ServiceController Manage lines in the live order
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'LiveOrder.Line.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					checkLoggedInCheckout : true
				}
			}

			// @method post The call to LiveOrder.Line.Service.ss with http method 'post' is managed by this function
			// @return {LiveOrder.Model.Data || Object} Returns a LiveOrder object or an empty object
		,	post: function()
			{
				LiveOrderModel.addLines(_.isArray(this.data) ? this.data : [this.data]);
				return LiveOrderModel.get() || {};
			}

			// @method put The call to LiveOrder.Line.Service.ss with http method 'put' is managed by this function
			// @return {LiveOrder.Model.Data || Object} Returns a LiveOrder object or an empty object
		,	put: function()
			{
				var id = this.request.getParameter('internalid');

				// Pass the data to the Cart's update method and send it response
				if (this.data.options && this.data.options.void)
				{
					LiveOrderModel.voidLine(id);
				}
				else if (this.data.options && this.data.options['return'])
				{
					LiveOrderModel.returnLine(id);
				}
				else
				{
					LiveOrderModel.updateLine(id, this.data);
				}
				return LiveOrderModel.get() || {};
			}

			// @method delete The call to LiveOrder.Line.Service.ss with http method 'delete' is managed by this function
			// @return {LiveOrder.Model.Data || Object} Returns a LiveOrder object or an empty object
		,	delete: function()
			{
				var id = this.request.getParameter('internalid');
				LiveOrderModel.removeLine(id);
				return LiveOrderModel.get() || {};
			}
		});
	}
);