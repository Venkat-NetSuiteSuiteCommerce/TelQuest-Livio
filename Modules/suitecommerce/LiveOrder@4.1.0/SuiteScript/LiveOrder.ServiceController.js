/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// LiveOrder.ServiceController.js
// ----------------
// Service to manage cart items requests
define(
	'LiveOrder.ServiceController'
,	[
		'ServiceController'
	,	'LiveOrder.Model'
	,	'SiteSettings.Model'
	]
,	function(
		ServiceController
	,	LiveOrderModel
	,	SiteSettings
	)
	{
		'use strict';

		// @class LiveOrder.ServiceController Manage cart items requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'LiveOrder.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				put: {
					checkLoggedInCheckout : true
				}
			,	post: {
					checkLoggedInCheckout : true
				}
			}

			// @method get The call to LiveOrder.Service.ss with http method 'get' is managed by this function
			// @return {LiveOrder.Model.Data}
		,	get: function()
			{
				return LiveOrderModel.get();
			}

			// @method post The call to LiveOrder.Service.ss with http method 'post' is managed by this function
			// @return {LiveOrder.Model.Data}
		,	post: function()
			{
				// Updates the order with the passed in data
				LiveOrderModel.update(this.data);

				// Submit the order
				var confirmation = LiveOrderModel.submit()
				// Get the new order
				,	order_info = LiveOrderModel.get();

				// Set the confirmation
				order_info.confirmation = confirmation;

				// Update touchpoints after submit order
				order_info.touchpoints = SiteSettings.getTouchPoints();

				return order_info;
			}

			// @method put The call to LiveOrder.Service.ss with http method 'put' is managed by this function
			// @return {LiveOrder.Model.Data}
		,	put: function()
			{
				LiveOrderModel.update(this.data);
				return LiveOrderModel.get();
			}
		});
	}
);
