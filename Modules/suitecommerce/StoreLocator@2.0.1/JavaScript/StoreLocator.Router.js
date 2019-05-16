/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Router'
,   [
		'AjaxRequestsKiller'
	,   'Backbone'
	,   'Profile.Model'
	,   'StoreLocator.Model'
	,   'StoreLocator.Collection'
	,   'StoreLocator.Main.View'
	,   'StoreLocator.Details.View'
	,   'StoreLocator.List.All.View'
	,   'StoreLocator.Upgrade.View'
	,	'SC.Configuration'
	,   'ReferenceMap'
	,   'ReferenceMap.Configuration'
	,   'Utils'
	]
,   function (
		AjaxRequestsKiller
	,   Backbone
	,   ProfileModel
	,   StoreLocatorModel
	,   StoreLocatorCollection
	,   StoreLocatorMainView
	,   StoreLocatorDetaisView
	,   StoreLocatorListAllView
	,   StoreLocatorUpgradeView
	,	Configuration
	,   ReferenceMap
	,   ReferenceConfiguration
	,   Utils
	)
{
	'use strict';

	return Backbone.Router.extend({
		//@method routes
		//@return {Object}
		routes: function routes ()
		{
			if (Utils.oldIE(8))
			{
				return {
					'stores' : 'browserUpgrade'
				,   'stores/details/:id' : 'browserUpgrade'
				,   'stores/all' : 'browserUpgrade'
				,   'stores/all?:options' : 'browserUpgrade'
				};
			}
			else
			{
				return {
					'stores' : 'storeLocatorStores'
				,   'stores/details/:id' : 'storeLocatorDetails'
				,   'stores/all' : 'storeLocatorListAll'
				,   'stores/all?:options' : 'storeLocatorListAll'
				};
			}
		}

		//@method initialize
		//@param {Object} application
	,   initialize: function initialize (application)
		{
			this.application = application;
		}

		//@method storeLocatorStores
	,   storeLocatorStores: function storeLocatorStores ()
		{
			var view = new StoreLocatorMainView({
				application: this.application
			,	collection: new StoreLocatorCollection()
			,	reference_map: new ReferenceMap()
			});

			view.showContent();
		}

		//@method storeLocatorListAll
		//@param {Object} options
	,   storeLocatorListAll: function storeLocatorListAll (options)
		{
			options = (options) ? SC.Utils.parseUrlOptions(options) : {page: 1};
			options.page = options.page || 1;

			var collection = new StoreLocatorCollection()
			,	view = new StoreLocatorListAllView({
					application: this.application
				,	collection: collection
				,	configuration: ReferenceConfiguration
				});

			collection.update({
					sort: 'namenohierarchy'
					//@property {String} page
				,	page: options.page

				,	results_per_page: ReferenceConfiguration.showAllStoresRecordsPerPage()
					//@property {Number} killerId
				,	killerId: AjaxRequestsKiller.getKillerId()
					//@property {Boolean} reset
				,	reset: true

				,	locationtype: Configuration.get('storeLocator.defaultTypeLocations')
			});

			view.showContent();
		}

		//@method storeLocatorDetails
		//@param {String} id
	,   storeLocatorDetails: function storeLocatorDetails (id)
		{
			var model = new StoreLocatorModel()
			,   reference_map = new ReferenceMap()
			,   view = new StoreLocatorDetaisView({
					application: this.application
				,   model: model
				,   reference_map: reference_map
				});

			model.fetch({
				data: {
					//@property {String} internalid
					internalid: id
				}
			,	killerId: AjaxRequestsKiller.getKillerId()
			}).done(function ()
			{
				view.showContent();
			});
		}

		//@method browserUpgrade
	,   browserUpgrade: function browserUpgrade ()
		{
			var view = new StoreLocatorUpgradeView({
				application: this.application
			});
			
			view.showContent();
		}

	});
});