/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module StoreLocatorReferenceMapsImplementation
define(
	'ReferenceMap.Configuration'
,	[]
,	function ()
{
	'use strict';

	var configuration = {
		//@method mapOptions
		//@returns {Object} with default center location, zoom, mapType and mapTypeControl
		mapOptions: function() {}
		//@method mapOptions
		//@returns {Object} with Store icon, position icon and autocomplete input
	,	iconOptions: function() {}
		//@method zoomInDetails
		//@return {Number} zoom to be applied in Store.Locator.Details.View
	,	zoomInDetails: function() {}
		//@method title
		//@retrun {String} to be applied in Main and Header
	,	title: function() {}
		//@method isEnabled
		//@return {Boolean} define if application is enabled or disabled
	,	isEnabled: function() {}
		//@method getUrl
		//@return {String} url to be loaded
	,	getUrl: function() {}
		//@method getApiKey
		//@return {String} map provider api key
	,	getApiKey: function() {}
		//@method getExtraData
		//@return {Array} with {Object} _internalid, name, servicehours
	,	getExtraData: function() {}
		//@method getRadius
		//@return {Number} radius used in search
	,	getRadius: function() {}
		//@method openPopupOnMouseOver define if popup appears when scroll on the list
		//@return {Boolean}
	,	openPopupOnMouseOver: function() {}
		//@method showLocalizationMap
		//@return {Boolean} map appears when search in mobile
	,	showLocalizationMap: function() {}
		//@method showAllStoresRecordsPerPage
		//@return {Number} total of records per page in StoreLocator.List.View.All
	,	showAllStoresRecordsPerPage: function() {}
	};

	return configuration;
});
