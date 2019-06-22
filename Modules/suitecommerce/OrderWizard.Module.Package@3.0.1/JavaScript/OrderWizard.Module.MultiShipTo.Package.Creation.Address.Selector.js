/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define(
	'OrderWizard.Module.MultiShipTo.Package.Creation.Address.Selector'
,	[	'order_wizard_msr_package_creation_address_selector.tpl'

	,	'Backbone'
	]
,	function (
		order_wizard_msr_package_creation_address_selector_tpl

	,	Backbone
	)
{
	'use strict';

	//@class OrderWizard.Module.MultiShipTo.Package.Creation.Address.Selector @extend Backbone.View
	return Backbone.View.extend(
	{
		template: order_wizard_msr_package_creation_address_selector_tpl

		//@method getContext @return {OrderWizard.Module.MultiShipTo.Package.Creation.OPC.Context}
	,	getContext: function ()
		{
			var ship_address_id = this.model.get('shipaddress')
			,	addresses = this.options.addresses.map(function (address)
				{
					//@class OrderWizard.Module.MultiShipTo.Package.Creation.Address.Selector.Address
					return {
						//@property {String} addressId
						addressId: address.get('internalid')
						//@property {Boolean} isSelected
					,	isSelected: address.get('internalid') === ship_address_id
						//@property {String} title
					,	title: address.get('fullname') + ' - ' + address.get('addr1')
					};
				});

			//@class OrderWizard.Module.MultiShipTo.Package.Creation.OPC.Context
			return {
				//@property {String} lineId
				lineId: this.model.id
				//@property {Boolean} areAddressesToShow
			,	areAddressesToShow: !!(addresses && addresses.length)
				//@property {Array<OrderWizard.Module.MultiShipTo.Package.Creation.Address.Selector.Address>} addresses
			,	addresses: addresses
			};
		}
	});
});