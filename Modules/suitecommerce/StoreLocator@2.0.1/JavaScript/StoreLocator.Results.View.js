/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Results.View', [
		
		'store_locator_results.tpl'
	,   'StoreLocator.List.View'
	,	'StoreLocator.Map.View'
	,   'AjaxRequestsKiller'
	,	'SC.Configuration'
	,   'underscore'
	,   'Backbone'
	,   'Backbone.CompositeView'
	,   'Backbone.CollectionView'
	,	'jQuery'
	,	'jQuery.scPush'
]
,   function (

		store_locator_results_tpl
	,   StoreLocatorListView
	,	StoreLocatorMapView
	,   AjaxRequestsKiller
	,	Configuration
	,   _
	,   Backbone
	,   BackboneCompositeView
	,   BackboneCollectionView
	,	jQuery
	)
{
	'use strict';

	return Backbone.View.extend({
	
		template: store_locator_results_tpl

	,   events: {
			'click [data-action="show-map"]': 'toggleView'
		,	'click [data-action="show-list"]': 'toggleView'
		,	'click [data-action="sc-pusher-dismiss"]': 'refineSearch'
		}

		//@method initialize
		//@param {Object} options
	,   initialize: function initialize (options)
		{
			this.application = options.application;
			this.reference_map = options.reference_map;

			this.collection = options.collection;
			
			this.isDevice = !! _.isPhoneDevice() || _.isTabletDevice();

			BackboneCompositeView.add(this);

			this.collection.on('reset', this.render, this);
			this.collection.on('reset', this.showPush, this);
		}

		//@method refineSearch
		//@param {Object} e
	,	refineSearch: function refineSearch (e)
		{
			e.preventDefault();
			
			this.collection.reset();
			//this.profileModel.unset('storeLocator_last_search');
			this.reference_map.setPosition(null);
		}

	,	showPush: function showPush ()
		{
			this.render();

			if (this.isDevice)
			{
				
				if (this.collection.length)
				{
					this.$el.trigger('open');
				}
				else
				{
					this.$el.trigger('close');
				}
			}
		}

		//@method render
	,	render: function render ()
		{
			if (this.collection.length)
			{
				this._render();

				if (this.isDevice)
				{
					this.$el.scPush();
					this.toggleView();
				}
			}
			else
			{
				this.$el.empty();
			}

		}

		//@method toggleView
		//@param {Object} e
	,   toggleView: function toggleView (e)
		{
			var $list_view = this.$('[data-type="list-view"]')
			,   $map_view = this.$('[data-type="map-view"]')
			,	$target = e && this.$(e.target);

			if ($target && $target.data('action') === 'show-map')
			{
				$list_view.hide();
				$map_view.show();
				
				this.$('[data-action="show-list"]').removeClass('active');
				this.$('[data-action="show-map"]').addClass('active');

				this.mapViewInstance.render();

				var $map = this.mapViewInstance.$('[data-type="map"]');

				$map.css('height',  jQuery(window).innerHeight() - $map.position().top);
			}
			else
			{
				$map_view.hide();
				$list_view.show();
				
				this.$('[data-action="show-map"]').removeClass('active');
				this.$('[data-action="show-list"]').addClass('active');
			}
		}

        //@property {Object} childViews
	,   childViews: {
			
		   'LocatorList': function ()
			{
				return new BackboneCollectionView({
					collection: this.collection
				,   childView: StoreLocatorListView
				,   childViewOptions: {
						reference_map: this.reference_map
					,	isDevice : this.isDevice
					}
				});
			}
		,	'ResultStoreLocatorMap': function ()
			{
				this.mapViewInstance = new StoreLocatorMapView({
					collection : this.collection
				,   application: this.application
				,   reference_map: this.reference_map
				});

				return this.mapViewInstance;
			}
		}



		//@method getContext
		//@return StoreLocator.Location.View.Context
	,   getContext: function getContext ()
		{
			var position = this.reference_map.getPosition();
			//@Class StoreLocator.Location.View.Context
			return {
				//@property {Boolean} myposition
				myposition: position && position.address ? position.address : ''
				//@property {Number} totalStores
			,	totalStores: this.collection.length
				//@property {Boolean} showLocalizationMap
			,	showLocalizationMap: this.isDevice && this.reference_map.configuration.showLocalizationMap()
				//@property {Boolean} showMap
			,	showMap: this.isDevice
				//@property {String} touchpoint
			,	touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
			};
		}
	});
});