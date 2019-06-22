/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.List.View'
,	[
		'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'store_locator_list.tpl'
	,	'Backbone'
	,	'underscore'
	,	'SC.Configuration'
	]
,	function storeLocatorList
	(
		BackboneCompositeView
	,	BackboneCollectionView
	,	store_locator_list_tpl
	,	Backbone
	,	_
	,	Configuration
	)
{
	'use strict';
	// @class StoreLocator.List.View @extend Backbone.View
	return Backbone.View.extend({

		template: store_locator_list_tpl

	,	events: {
			'mouseover li': 'openMapInfoWindow'
		}

		//@method initialize
	,	initialize: function initialize (options)
		{
			this.reference_map = options.reference_map;
			
			this.index = options.index + 1;

			this.events = this.events || {};

			BackboneCompositeView.add(this);
		}

		//@method openMapInfoWindow
		//@return {void}
	,	openMapInfoWindow: function openMapInfoWindow ()
		{
			if (this.reference_map.configuration.openPopupOnMouseOver() && !_.isPhoneDevice() && !_.isTabletDevice())
			{
				var marker = _.findWhere(this.reference_map.points, {store_id: this.model.get('internalid')});
			
				this.reference_map.showInfoWindow(marker, this.model, this.index);
			}
		}

		//@method getContext @returns StoreLocator.List.View.Context
	,	getContext: function getContext ()
		{
			//@Class StoreLocator.List.View.Context
			return {
				//@property {{String}} storeName
				storeName: this.model.get('name')
				//@property {{String}} storeDistance
			,	storeDistance: this.model.get('distance')
				//@property {{String}} distanceUnit
			,	distanceUnit: this.model.get('distanceunit')
				//@property {{String}} storeAddress
			,	storeAddress: this.model.get('address1')
				//@property {{String}} storeId
			,	storeId: this.model.get('internalid')
				//@property {{Number}} index
			,	index: this.index
				//@property {{StoreLocation.Model}} model 
			,	model: this.model
				//@property {String} touchpoint
			,	touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
			};
		}

	});
});