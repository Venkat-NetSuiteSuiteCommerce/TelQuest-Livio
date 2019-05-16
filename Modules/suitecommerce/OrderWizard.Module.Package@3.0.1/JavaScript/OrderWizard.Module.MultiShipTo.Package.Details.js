/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define(
	'OrderWizard.Module.MultiShipTo.Package.Details'
,	[	'Wizard.Module'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Address.Details.View'
	,	'Transaction.Line.Views.Cell.Actionable.View'
	,	'OrderWizard.Module.MultiShipTo.Package.Details.Quantity'
	,	'OrderWizard.Module.MultiShipTo.Package.Details.Actions'

	,	'order_wizard_msr_package_details.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		WizardModule
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	AddressDetailsView
	,	TransactionLineViewsCellActionableView
	,	OrderWizardModuleMultiShipToPackageDetailsQuantity
	,	OrderWizardModuleMultiShipToPackageDetailsActions

	,	order_wizard_msr_package_details_tpl

	,	_
	)
{
	'use strict';

	//@class OrderWizard.Module.MultiShipTo.Package.Details @extend Wizard.Module
	return WizardModule.extend(
	{
		template: order_wizard_msr_package_details_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'Address.Details': function ()
			{
				return new AddressDetailsView({
					model: this.model.get('address')
				,	hideActions: true
				,	hideDefaults: true
				,	manage: 'shipaddress'
				});
			}
		,	'Items.Collection': function ()
			{
				return new BackboneCollectionView({
					childView: TransactionLineViewsCellActionableView
				,	viewsPerRow: 1
				,	collection: this.model.get('lines')
				,	childViewOptions: {
						navigable: false
					// ,	useLinePrice: true
					,	application: this.options.application
					,	SummaryView: OrderWizardModuleMultiShipToPackageDetailsQuantity
					,	ActionsView: OrderWizardModuleMultiShipToPackageDetailsActions
					}
				});
			}
		}

		//@method getContext @return {OrderWizard.Module.MultiShipTo.Package.Details.Context}
	,	getContext: function ()
		{
			var item_count = _.countItems(this.model.get('lines'));

			//@class OrderWizard.Module.MultiShipTo.Package.Details.Context
			return {
				//@property {String} packageTitle
				packageTitle: this.model.get('packageTitle')
				//@property {Boolean} totalItemsGreaterThan1
			,	itemCountGreaterThan1: item_count > 1
				//@property {Number} totalItems
			,	itemCount: item_count
				//@property {Boolean} isPackageExpanded
			,	isPackageExpanded: !!this.model.get('isPackageExpanded')
				//@property {String} addressId
			,	addressId: this.model.get('address').id
				//@property {String} addressName
			,	addressName: this.model.get('address').get('fullname')
				//@property {String} address
			,	address: this.model.get('address').get('addr1')
			};
		}
	});
});