/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PickupInStore
define('PickupInStore.FulfillmentOptions.View'
,   [
		'pickup_in_store_fulfillment_options.tpl'

	,   'Backbone.CompositeView'
	,   'Backbone'

	]
,   function (
		pickup_in_store_fulfillment_options_tpl

	,   BackboneCompositeView
	,   Backbone
	)
{
	'use strict';

	//@class PickupInStore.FulfillmentOptions.View @extend Backbone.View
	return Backbone.View.extend(
	{
			// @property {Function} template
			template: pickup_in_store_fulfillment_options_tpl

			// @method initialize
		,	initialize: function initialize (options)
			{
				BackboneCompositeView.add(this);

				this.model = options.model;

			}

			// @method getContext
		,   getContext: function getContext ()
			{
				this.item = this.model;

				var stock_information = this.model.getStockInfo()
				,	is_available_for_ship = this.item.get('_isBackorderable') || this.item.get('_isInStock');

				return {
					//@property {Boolean} isAvailableForShip
					isAvailableForShip: is_available_for_ship
					//@property {Boolean} isAvailableForPickup
				,	isAvailableForPickup: stock_information.isAvailableForPickup
				};
			}
		}
	);
});
