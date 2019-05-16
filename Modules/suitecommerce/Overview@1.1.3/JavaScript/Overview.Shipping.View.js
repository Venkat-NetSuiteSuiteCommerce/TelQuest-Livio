/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Overview.Shipping.View.js
// -----------------------

define('Overview.Shipping.View'
,	[
		'SC.Configuration'
	,	'Address.Details.View'

	,	'overview_shipping.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Utils'
	]
,	function(
		Configuration
	,	AddressDetailsView

	,	overview_shipping_tpl

	,	Backbone
	,	BackboneCompositeView
	)
{
	'use strict';

	// home page view
	return Backbone.View.extend({

		template: overview_shipping_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'Address.Details': function()
			{
				return new AddressDetailsView({
					hideDefaults: true
				,	hideActions: true
				,	model: this.model
				});
			}
		}

		//@method getContext @returns {Overview.Shipping.View.Context}
	,	getContext: function()
		{
			//@class Overview.Shipping.View.Context
			return {
				//@property {Boolean} hasDefaultShippingAddress
				hasDefaultShippingAddress: !!this.model
				//@property {String} shippingAddressInternalid
			,	shippingAddressInternalid: this.model && this.model.get('internalid')
			};
		}
	});
});