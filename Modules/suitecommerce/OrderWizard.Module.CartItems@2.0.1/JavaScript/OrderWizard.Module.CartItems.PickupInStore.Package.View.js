/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.CartItems
define(
	'OrderWizard.Module.CartItems.PickupInStore.Package.View'
,	[	
		'Location.VenueDetails.View'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Navigable.View'
	,	'SC.Configuration'

	,	'order_wizard_cartitems_module_pickup_in_store_package.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		LocationVenueDetailsView
	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	TransactionLineViewsCellNavigableView
	,	Configuration

	,	order_wizard_cartitems_module_pickup_in_store_package_tpl

	,	_
	)
{
	'use strict';

	//@class OrderWizard.Module.CartItems.PickupInStore.Package @extends Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: order_wizard_cartitems_module_pickup_in_store_package_tpl

	,	initialize: function (options)
		{
			this.model = options.model;
			this.lines = options.model.get('lines');
			this.location = this.lines[0].get('location');

			BackboneCompositeView.add(this);

			this.location.on('change', this.render, this);


		}

		//@property {Object} childViews
	,	childViews: {
			'Items.Collection': function ()
			{
				return new BackboneCollectionView({
						collection: this.lines
					,	childView: TransactionLineViewsCellNavigableView
					,	viewsPerRow: 1
					,	childViewOptions: {
							navigable: false

						,	detail1Title: _('Qty:').translate()
						,	detail1: 'quantity'

						,	detail2Title: _('Unit price:').translate()
						,	detail2: 'rate_formatted'

						,	detail3Title: _('Amount:').translate()
						,	detail3: 'total_formatted'
						}
				});
			}

		,	'PickupInStore.StoreLocationInfo': function ()
			{
				return new LocationVenueDetailsView({
					model: this.location
				,   application: this.application
				,   showAddress: true
				});
			}

		}

		//@method getContext @returns {OrderWizard.Module.CartItems.Context}
	,	getContext: function ()
		{
			var lines = this.lines
			,	item_count = _.countItems(lines);
			//@class OrderWizard.Module.CartItems.Context
			return {
					//@property {LiveOrder.Model} model
					model: this.model
					//@property {Boolean} itemCountGreaterThan1
				,	itemCountGreaterThan1: item_count > 1
					//@property {Number} itemCount
				,	itemCount: item_count
					//@property {Boolean} showOpenedAccordion
				,	showOpenedAccordion: !!this.options.show_opened_accordion
					//@property {Boolean} isAccordionPrimary
				,	isAccordionPrimary: !!this.options.is_accordion_primary
					//@property {Boolean} showEditCartButton
				,	showEditCartButton: !!this.options.show_edit_cart_button
					//@property {Boolean} showHeaders
				,	showHeaders: !!this.options.show_headers
					//@property {Boolean} showMobile
				,	showMobile: !!this.options.show_mobile
					//@property {StoreLocation.Model} location
				,	location: this.location
					//@property {Boolean} showLocation
				,	showLocation: !!this.location.get('name') && !this.options.hide_location
			};
		}
	});
});
