/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard.Module.CartItems
define(
	'OrderWizard.Module.CartItems.PickupInStore.List'
,	[	'Wizard.Module'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'OrderWizard.Module.CartItems.PickupInStore.Details.View'
	,	'SC.Configuration'

	,	'order_wizard_cartitems_pickup_in_store_list.tpl'

	,	'underscore'
	,	'Utils'
	]
,	function (
		WizardModule
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	OrderWizardModuleCartItemsPickupInStoreDetailsView
	,	Configuration

	,	order_wizard_cartitems_pickup_in_store_list

	,	_
	)
{
	'use strict';

	//@class OrderWizard.Module.CartItems.PickupInStore.List @extends Wizard.Module
	return WizardModule.extend({

		//@property {Function} template
		template: order_wizard_cartitems_pickup_in_store_list
		//@method initialize
	,	initialize: function ()
		{
			var self = this;

			WizardModule.prototype.initialize.apply(this, arguments);
			this.wizard.model.on('ismultishiptoUpdated', function ()
			{
				self.render();
			});

			this.wizard.model.on('promocodeUpdated', function ()
			{
				self.render();
			});

			this.lines = this.model.getPickupInStoreLines();

			this.model.on('change', function ()
			{
				self.lines = self.model.getPickupInStoreLines();
			});

			BackboneCompositeView.add(this);
		}
		//@property {Boolean} isActive
	,	isActive: function isActive ()
		{
			return Configuration.get('siteSettings.isPickupInStoreEnabled') && this.lines.length;
		}

		//@property {Object} childViews
	,	childViews:
		{
			'Packages.Collection': function ()
			{
				var lines_for_pickup = this.lines
				,	lines_by_location = _.groupBy(lines_for_pickup, function (line)
				{
					return line.get('location');
				});

				lines_by_location = _.map(lines_by_location, function (lines, location_id)
				{
					return {
						lines: lines
					,	location: location_id
					};
				});

				return new BackboneCollectionView({
						collection: lines_by_location
					,	childView: OrderWizardModuleCartItemsPickupInStoreDetailsView
					,	viewsPerRow: 1
					,	childViewOptions: {
							show_opened_accordion: this.options.show_opened_accordion
						,	is_accordion_primary: this.options.is_accordion_primary
						,	show_edit_cart_button: this.options.show_edit_cart_button
						,	show_headers: this.options.show_headers
						,	show_mobile: this.options.show_mobile
						}
				});
			}
		}

		//@method render
	,	render: function ()
		{
			this.application = this.wizard.application;
			this.profile = this.wizard.options.profile;
			this.options.application = this.wizard.application;

			if (this.isActive())
			{
				this._render();
			}
		}
	});
});
