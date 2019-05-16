/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// LiveOrder.GiftCertificate.ServiceController.js
// ----------------
// Service to manage gift certificates in the live order
define(
	'LiveOrder.GiftCertificate.ServiceController'
,	[
		'ServiceController'
	,	'LiveOrder.Model'
	]
,	function(
		ServiceController
	,	LiveOrderModel
	)
	{
		'use strict';

		// @class LiveOrder.GiftCertificate.ServiceController Manage gift certificates in the live order
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'LiveOrder.GiftCertificate.ServiceController'

			// @method post The call to LiveOrder.GiftCertificate.Service.ss with http method 'post' is managed by this function
			// @return {LiveOrder.Model.Data || EmptyObject} Returns the live order or an empty object
		,	post: function()
			{
				LiveOrderModel.setGiftCertificates(this.data.giftcertificates);
				return LiveOrderModel.get() || {};
			}
		});
	}
);