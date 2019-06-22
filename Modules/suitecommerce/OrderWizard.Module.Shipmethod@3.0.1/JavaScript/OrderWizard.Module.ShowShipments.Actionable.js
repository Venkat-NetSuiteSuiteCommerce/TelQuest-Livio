/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.Shipmethod
define(
	'OrderWizard.Module.ShowShipments.Actionable'
,	[	'OrderWizard.Module.ShowShipments'
	,	'Address.Details.View'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Navigable.View'

	,	'order_wizard_showshipments_actionable_module.tpl'
	]
,	function (
		OrderWizardModuleShowShipments
	,	AddressDetailsView
	,	BackboneCollectionView
	,	TransactionLineViewsCellNavigableView

	,	order_wizard_showshipments_actionable_module_tpl
	)
{
	'use strict';

	//@class OrderWizard.Module.ShowShipments.Actionable @extends OrderWizard.Module.ShowShipments
	return OrderWizardModuleShowShipments.extend({

		//@property {Function} template
		template: order_wizard_showshipments_actionable_module_tpl

		//@property {Object} childViews
	,	childViews: {
			'Shipping.Address': function ()
			{
				return new AddressDetailsView({
						hideActions: true
					,	hideDefaults: true
					,	manage: 'shipaddress'
					,	model: this.profile.get('addresses').get(this.model.get('shipaddress'))
				});
			}
		,	'Items.Collection': function ()
			{
				return new BackboneCollectionView({
						collection: this.model.get('lines')
					,	childView: TransactionLineViewsCellNavigableView
					,	viewsPerRow: 1
					,	childViewOptions: {
							navigable: !this.options.hide_item_link
						}
				});
			}
		}
	});
});