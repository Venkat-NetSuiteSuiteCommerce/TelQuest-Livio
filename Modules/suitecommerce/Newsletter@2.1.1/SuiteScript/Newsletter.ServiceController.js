/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Newsletter.ServiceController.js
// ----------------
// Service to register an email as a newsletter subscriptor
define(
	'Newsletter.ServiceController'
,	[
		'ServiceController'
	,	'Newsletter.Model'
	]
,	function(
		ServiceController
	,	NewsletterModel
	)
	{
		'use strict';

		// @class Newsletter.ServiceController
		// Supports newsletter subscription process
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name:'Newsletter.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requirePermissions: {
						list: [
							'lists.listCustJob.3'
						]
					}
				}
			}

			// @method post Callling to Newsletter.Service.ss with http method 'post' is managed by this function
			// @return {NewsletterSuscriptionResult} Object with the result of the lead subscribing operation
		,	post: function ()
			{
				return NewsletterModel.subscribe(this.data.email);
			}
		});
	}
);