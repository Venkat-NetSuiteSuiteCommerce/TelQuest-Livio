/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define(
	'OrderWizard.Module.MultiShipTo.Package.Details.Quantity'
,	[	'Backbone'

	,	'order_wizard_msr_package_details_quantity.tpl'
	]
,	function (
		Backbone

	,	order_wizard_msr_package_details_quantity_tpl
	)
{
	'use strict';

	//@class OrderWizard.Module.MultiShipTo.Package.Details.Quantity @extend Backbone.View
	return Backbone.View.extend(
	{
		template: order_wizard_msr_package_details_quantity_tpl

		//@method getContext @return {OrderWizard.Module.MultiShipTo.Package.Details.Quantity.Context}
	,	getContext: function ()
		{
			//@class OrderWizard.Module.MultiShipTo.Package.Details.Quantity.Context
			return {
				//@property {Number} lineQuantity
				lineQuantity: this.model.get('quantity')
				//@property {String} lineTotalFormatted
			,	lineTotalFormatted: this.model.get('total_formatted')
				//@property {String} lineAmountFormatted
			,	lineAmountFormatted: this.model.get('amount_formatted')
				//@property {Boolean} isAmountGreaterThanTotal
			,	isAmountGreaterThanTotal: this.model.get('amount') > this.model.get('total')
			};
		}
	});
});