/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PickupInStore
define('PickupInStore.StoreSelector.View'
,   [
		'pickup_in_store_store_selector.tpl'

	,	'StoreLocator.Search.View'
	,	'PickupInStore.StoreSelector.List.View'
	,	'StoreLocator.Collection'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Profile.Model'
	,	'Utils'
	]
,   function (
		pickup_in_store_store_selector_tpl

	,	StoreLocatorSearchView
	,	PickupInStoreStoreSelectorListView
	,	StoreLocatorCollection

	,   Backbone
	,	BackboneCompositeView
	,	ProfileModel
	,	Utils
	)
{
	'use strict';

	// @class PickupInStore.StoreSelector.View @extends Backbone.View
	return Backbone.View.extend(
	{
			// @property {Function} template
			template: pickup_in_store_store_selector_tpl

			//@property {String} title
		,	title: Utils.translate('Select Store')

			// @method initialize
			// @param {PickupInStore.StoreSelector.View.InitializeParameters} options
		,   initialize: function initialize (options)
			{

				Backbone.View.prototype.initialize.apply(this, arguments);

				BackboneCompositeView.add(this);

				this.model = options.model;
				this.application = options.application;
				this.item = this.model.getItem();
				this.item_pickup_in_store_locations = this.item.get('_quantityavailableforstorepickup_detail');
				this.source = options.source;

				this.reference_map = this.options.reference_map;
				this.store_collection = new StoreLocatorCollection();
			}

			// @property {method} focusFirstInput
		,	focusFirstInput: function focusFirstInput ()
			{
				return !this.store_collection.length;
			}

			// @property {ChildViews} childViews
		,	childViews:
			{
					'StoreSearch': function ()
					{
						return new StoreLocatorSearchView({
							collection : this.store_collection
						,	application: this.application
						,	reference_map: this.reference_map
						,	profileModel: ProfileModel.getInstance()
						,	alwaysVisible: !Utils.isPhoneDevice()
						,	useGeolocation: window.location.protocol === 'https:'
						});
					}

				,	'StoreList': function ()
					{
						return new PickupInStoreStoreSelectorListView({
							store_collection : this.store_collection
						,	application: this.application
						,	reference_map: this.reference_map
						,	profileModel: ProfileModel.getInstance()
						,	model: this.model
						,	source: this.source
						});
					}
			}
		}
	);
});
