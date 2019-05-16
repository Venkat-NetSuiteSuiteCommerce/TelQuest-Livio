/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Main.View',
	[
		'Profile.Model'
	,   'StoreLocator.Map.View'
	,	'StoreLocator.Search.View'
	,   'StoreLocator.Results.View'
	,	'SC.Configuration'
	,   'store_locator_main.tpl'
	,   'underscore'
	,   'Backbone.CompositeView'
	,   'Backbone'
	]
,   function
	(
		ProfileModel
	,   StoreLocatorMapView
	,	StoreLocatorSearchView
	,   StoreLocatorResultsView
	,	Configuration
	,   store_locator_main_tpl
	,   _
	,   BackboneCompositeView
	,   Backbone
	)
{
	'use strict';

	return Backbone.View.extend({

		template: store_locator_main_tpl

	,	events: {
			'click [data-action="refine-search"]': 'refineSearch'
		}

		//@method initialize
		//@param options
	,	initialize: function initialize (options)
		{
			this.application = options.application;
			
			this.reference_map = options.reference_map;
			
			this.reference_map.collection = this.collection;

			this.profileModel = ProfileModel.getInstance();

			this.title = this.reference_map.configuration.title();

			BackboneCompositeView.add(this);
		}

		//@method destory
	,	destroy: function destroy ()
		{
			//clear profile model
			if (Backbone.history.getFragment().split('/')[1] !== 'details')
			{
				this.profileModel.unset('storeLocator_last_search');
			}

			this._destroy();
		}

		//@property {Object} childViews
	,	childViews: {

			'StoreLocatorMap': function ()
			{
				return new StoreLocatorMapView({
					collection : this.collection
				,   application: this.application
				,   reference_map: this.reference_map
				});
			}

		,   'StoreLocatorResults': function ()
			{
				return new StoreLocatorResultsView({
					collection : this.collection
				,	application: this.application
				,	reference_map: this.reference_map
				,	profileModel: this.profileModel
				});
			}

		,   'StoreLocatorSearch': function ()
			{
				return new StoreLocatorSearchView({
					collection : this.collection
				,	application: this.application
				,	reference_map: this.reference_map
				,	profileModel: this.profileModel
				,	useGeolocation: window.location.protocol === 'https:'
				});
			}
		
		}
		//@method getContext
		//@returns StoreLocator.Main.View.Context
	,	getContext: function getContext ()
		{
			//@class StoreLocator.Main.View.Context
			return {
				//@property {String} title
				title: this.reference_map.configuration.title
				//@property {String} touchpoint
			,	touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
			};
		}
	});
});