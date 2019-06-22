/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	'OrderWizard.Module.MultiShipTo.Shipmethod.Package.View'
,	[	'Backbone.CompositeView'
	,	'Address.Details.View'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Navigable.View'

	,	'order_wizard_msr_shipmethod_package.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	AddressDetailsView
	,	BackboneCollectionView
	,	TransactionLineViewsCellNavigableView

	,	order_wizard_msr_shipmethod_package_tpl

	,	Backbone
	,	_

	)
{
	'use strict';

	return Backbone.View.extend(
	{
		template: order_wizard_msr_shipmethod_package_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	childViews: {
				'Shipping.Address': function ()
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
							collection: this.model.get('lines')
						,	childView: TransactionLineViewsCellNavigableView
						,	viewsPerRow: 1
						,	childViewOptions: {
								navigable: !this.options.hide_item_link

							,	detail1Title: _('Qty:').translate()
							,	detail1: 'quantity'

							,	detail2Title: _('Unit price').translate()
							,	detail2: 'rate_formatted'

							,	detail3Title: _('Amount:').translate()
							,	detail3: 'total_formatted'
							}
					});
				}
		}

	,	getContext: function ()
		{

			/*var packages = view.getPackages()
			,	non_shippable_lines = view.wizard.model.getNonShippableLines()
			,	general_collapse_elements =  view.getDefaultCollapseItem()
			,	show_edit_address_url = !!view.options.show_edit_address_url
			,	show_combo = view.options.show_combo
			,	is_read_only = view.is_read_only
			,	hide_accordion = view.options.hide_accordion
			,	show_items = !view.options.hide_items
			,	application = view.wizard.application;

			var items = package.lines
			,	selected_address = package.address
			,	delivery_methods = package.deliveryMethods
			,	collapse_elements = _.isUndefined(package.collapse_elements) ? general_collapse_elements : package.collapse_elements;
			*/

			var shipping_methods = this.model.get('deliveryMethods').map(function (shipmethod)
				{
					return {
							name: shipmethod.get('name')
						,	rate_formatted: shipmethod.get('rate_formatted')
						,	internalid: shipmethod.get('internalid')
						,	isActive: shipmethod.get('check')
					};
				})
			,	selected_shipmethod = _.findWhere(shipping_methods, {isActive: true})
			,	lines = this.model.get('lines')
			,	total_items = _.countItems(lines);

			return {
					//@property {String} addressId
					addressId: this.model.get('address').get('internalid')
					//@property {Boolean} showEditButton
				,	showEditAddressButton: !!this.options.show_edit_address_url
					//@property {String} editUrl
				,	editUrl: this.options.edit_url
					//@property {Boolean} showDeliveryMethods
				,	showDeliveryMethods: !!shipping_methods.length
					//@property {Boolean} showCombo
				,	showCombo: this.options.show_combo
					//@property {Array} shippingMethods
				,	shippingMethods: shipping_methods
					//@property {Object} selectedShipmethod
				,	selectedShipmethod: selected_shipmethod
					//@property {Boolean} showSelectedShipmethod
				,	showSelectedShipmethod: !!selected_shipmethod
					//@property {Boolean} showActions
				,	showActions: !this.options.is_read_only
					//@property {Boolean} showAccordion
				,	showAccordion: !this.options.hide_accordion
					//@property {Boolean} showItems
				,	showItems: !this.options.hide_items
					//@property {Boolean} showLines
				,	showLines: !!lines.length
					//@property {Orderline.Collection} lines
				,	lines: lines
					//@property {Number} totalItems
				,	totalItems: total_items
					//@property {Boolean} linesLengthGreaterThan1
				,	totalItemsGreaterThan1: total_items > 1
					//@property {Boolean} collapseElements
				,	collapseElements: _.isUndefined(this.model.get('collapse_elements')) ? !!this.options.general_collapse_elements : !!this.model.get('collapse_elements')
					//@property {Boolean} showEditShipment
				,	showEditShipmentButton: !!this.options.edit_shipment_url
					//@property {String} editShipmentUrl
				,	editShipmentUrl: this.options.edit_shipment_url
			};
		}
	});
});
