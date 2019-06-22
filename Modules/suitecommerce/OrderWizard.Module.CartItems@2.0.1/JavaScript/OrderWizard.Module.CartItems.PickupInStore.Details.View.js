/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.CartItems
define(
	'OrderWizard.Module.CartItems.PickupInStore.Details.View'
,	[	
		'Location.VenueDetails.View'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'OrderWizard.Module.CartItems.PickupInStore.Package.View'
	,	'SC.Configuration'

	,	'order_wizard_cartitems_pickup_in_store_details.tpl'

	,	'Utils'
	]
,	function (
		LocationVenueDetailsView
	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	OrderWizardModuleCartItemsPickupInStorePackageView
	,	Configuration

	,	order_wizard_cartitems_pickup_in_store_details

	)
{
	'use strict';

	//@class OrderWizard.Module.CartItems.PickupInStore.Details @extends Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: order_wizard_cartitems_pickup_in_store_details
		//@method initialize
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
				return new OrderWizardModuleCartItemsPickupInStorePackageView({
					model: this.model
				,	hide_location: true
				,	show_opened_accordion: this.options.show_opened_accordion
				,	is_accordion_primary: this.options.is_accordion_primary
				,	show_edit_cart_button: this.options.show_edit_cart_button
				,	show_headers: this.options.show_headers
				,	show_mobile: this.options.show_mobile
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
		//@method getContext @return OrderWizard.Module.CartItems.PickupInStore.Details.View.Context
	,	getContext: function () 
		{
			//@class OrderWizard.Module.CartItems.PickupInStore.Details.View.Context
			return {
				//@property {Boolean} showLocation
				showLocation: !!this.location.get('name')
				//@property {StoreLocation.Model} location
			,	location: this.location
			};
		}
	});
});
