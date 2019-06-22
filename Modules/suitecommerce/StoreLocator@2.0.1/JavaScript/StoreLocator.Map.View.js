/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Map.View'
,   [
		'underscore'
	,   'Backbone'
	,   'store_locator_map.tpl'
	]
,   function (
		_
	,   Backbone
	,   store_locator_map_tpl
	)
{
	'use strict';

	return Backbone.View.extend({

		template: store_locator_map_tpl

		//@method initialize 
	,   initialize: function initialize (options)
		{

			this.application = options.application;

			this.reference_map = options.reference_map;

			//location model (optional)
			this.model = options.model;

			this.collection = options.collection;
		}

	,	destroy: function destroy ()
		{
			if (this.collection)
			{
				this.collection.off('sync, reset', this.updateMap, this);
			}else if (this.model)
			{
				this.model.off('change', this.updateMapDetails, this);
			}
			this.reference_map.off('change:position', this.updateMap, this);
			return this._destroy();
		}
		
		//@method updateMap
		//@return {Void}
	,   updateMap: function updateMap ()
		{
			this.reference_map.clearPointList(this.map);

			var position = this.reference_map.getPosition();

			if (position && _.size(position) && !position.refineSearch)
			{
				this.reference_map.showMyPosition(position, this.map);
			}
			else
			{
				this.reference_map.centerMapToDefault(this.map);
			}

			if (this.collection.length)
			{
				this.reference_map.showPointList(this.collection, this.map);
				this.reference_map.fitBounds(this.map);
			}
			
		}
		//@method updateMapDetails
		//@return {Void}
	,   updateMapDetails: function updateMapDetails ()
		{
			this.reference_map.showPointWithoutInfoWindow(this.model, this.map);
		}

		//@method render
	,   render: function render ()
		{
			if (this.reference_map)
			{
				this._render();
				
				var self = this;

				this.reference_map.load().done(function ()
				{
					self.mapInit();
				});
			}
		}

		//@method mapInit
	,   mapInit: function mapInit ()
		{
			this.map = this.reference_map.showMap(this.$('[data-type="map"]').get(0));

			if (this.model)
			{
				this.model.on('change', this.updateMapDetails, this);
				this.updateMapDetails();
			}
			else if (this.collection)
			{
				this.collection.on('sync, reset', this.updateMap, this);
				this.updateMap();
			}
			this.reference_map.on('change:position', this.updateMap, this);
		}
	});

});
