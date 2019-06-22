/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module StoreLocatorReferenceMapsImplementation
// @class ReferenceMap 
// This class implemented a facade that is used to separate application and map engine and provide an easy way to implement any maps engine. 
// For changing current maps engine re-implement the operations below.
define(
	'ReferenceMap'
,   [
		'ReferenceMap.Configuration'
	,   'underscore'
	,   'Backbone'
	,   'jQuery'
	,   'Utils'
	]
,   function (
		ReferenceMapConfiguration
	,   _
	,   Backbone
	,   jQuery
	)
{
	'use strict';

	var ReferenceMap = function ReferenceMap () {
		this.configuration = ReferenceMapConfiguration;
		//Stores instance of the map created in showMap method
		this.map = null;
		//Handles markers created in showPoint() method
		this.points = [];
		//{Object} containing latitude, longitude and address
		this.myposition = {};
	};

	//@method load
	//@return Promise object which observes maps library loading
	ReferenceMap.prototype.load = function load () {};

	//@method isInitialized
	//@return {Boolean} If true, library has been initialized. Otherwise false.
	ReferenceMap.prototype.isInitialize = function isInitialized () {};

	//@method showMap has the responsability of showing the map in a container and set an instance of map in this.map
	//@param {Object} element. HTML element that will be used for rendering the map
	//@return {Void}
	ReferenceMap.prototype.showMap = function showMap () {};

	//@method centerMapToDefault
	ReferenceMap.prototype.centerMapToDefault = function centerMapToDefault () {};

	//@method showPoint creates a point for showing in the map
	//@return {Object} point
	ReferenceMap.prototype.showPoint = function showPoint () {};

	//@method removePoint removed a point from the map
	//@param {Object} point to remove
	//@return {Void}
	ReferenceMap.prototype.removePoint = function removePoint () {};

	//@method showAutoCompleteInput shows an initialize the automcomplete feature
	//@param {Object} input html input
	//@return {Object} autocomplete object
	ReferenceMap.prototype.showAutoCompleteInput = function showAutoCompleteInput () {};

	//@method autoCompleteChange executed when the autoComplete input value changes and sets {Object} this.myposition with latitude, longitude and address
	ReferenceMap.prototype.autoCompleteChange = function autoCompleteChange () {};

	//@method showMyPosition show current position in the map
	//@param {Object} position
	ReferenceMap.prototype.showPosition = function showPosition () {};

	//@method showPointList iterates on a list of Store.Locator.Model objects and shows the points in the map.
	ReferenceMap.prototype.showPointList = function showPointList (list, map)
	{
		var self = this;
	
		list.each(function(point)
		{
			self.points.push(self.showPoint(point, map));
		});
	};

	//@method showPointWithoutInfoWindow shows the point the map without rendering the Location details tooltip
	//@param {StoreLocator.Model}
	ReferenceMap.prototype.showPointWithoutInfoWindow = function showPointWithoutInfoWindow () {};

	//@method getInfoWindow current instance of the view which shows the Location details tooltip
	//@return {Object}
	ReferenceMap.prototype.getInfoWindow = function getInfoWindow () {};

	//@method getTooltip returns an instance of StoreLocator.Tooltip.View
	//@param {StoreLocator.Model} model
	//@param {Integer} index
	//@return {StoreLocator.Tooltip.View}
	ReferenceMap.prototype.getTooltip = function getTooltip () {};

	//@method showInfoWindow renders StoreLocator.Tooltip.View into getInfoWindow for showing the information in the map
	//@param {Object} marker
	//@param {StoreLocator.Model} model
	//@param {Integer} index
	ReferenceMap.prototype.showInfoWindow = function showInfoWindow () {};

	//@method showInfoWindowOnClick obtain the point of a collection and passing parameters to showInfoWindow
	//@param {Object} point
	ReferenceMap.prototype.showInfoWindowOnClick = function showInfoWindowOnClick () {};

	//@method clearPointList remove all points from map and this.points
	ReferenceMap.prototype.clearPointList = function clearPointList ()
	{
		var self = this;
		_.each(this.points, function(point)
		{
			 self.removePoint(point);
		});

		this.points = [];
	};

	//@method fitBounds centers and zooms the map for making all the points fit.
	ReferenceMap.prototype.fitBounds = function fitBounds () {};

	//@method getCityGeoCode retrieves an address from latitude and longitude and saves the result in this.myposition.address
	ReferenceMap.prototype.getCityGeoCode = function getCityGeoCode () {};

	//@method zoomToPoint centers the map in one specific point
	//@param {Object} point
	ReferenceMap.prototype.zoomToPoint = function zoomToPoint () {};

	//@method getDirectionsUrl 
	//@param {Object} source
	//@param {Object} destination
	//@returns {String}
	ReferenceMap.prototype.getDirectionsUrl = function getDirectionsUrl (source, destination)
	{
		source;
		destination;
	};

	//@method getCurrentPositionGeolocation @return {jQuery.Deferred}
	ReferenceMap.prototype.getCurrentPositionGeolocation = function getCurrentPositionGeolocation ()
	{
		var promise = jQuery.Deferred()
		,	self = this;

		navigator.geolocation.getCurrentPosition(function (position)
			{

				self.setPosition({
					latitude: position.coords.latitude
				,   longitude: position.coords.longitude
				,   address: ''
				});

				promise.resolveWith(self, [self.myposition]);
			}
		,	function ()
			{
				promise.rejectWith(self, arguments);
			}
		);

		return promise;
	};

	ReferenceMap.prototype.setPosition = function (position)
	{

		this.myposition = position ? position : {refineSearch: true};

		this.trigger('change:position', this.myposition);
	};

	ReferenceMap.prototype.getPosition = function ()
	{
		return this.myposition || {};
	};

	_.extend(ReferenceMap.prototype, Backbone.Events);

	return ReferenceMap;
});