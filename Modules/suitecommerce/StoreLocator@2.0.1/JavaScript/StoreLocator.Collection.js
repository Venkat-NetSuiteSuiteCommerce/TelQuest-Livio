/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Collection'
,	[
		'Location.Collection'
	,	'StoreLocator.Model'
	,	'underscore'
	,	'Utils'
	]
,	function (
		LocationCollection
	,	StoreLocatorModel
	,	_
	,	Utils
	)
{
	'use strict';

	//@class StoreLocator.Collection @extend Backbone.Collection
	return LocationCollection.extend({

		//@property {StoreLocator.Model} model
		model: StoreLocatorModel

		//@property {String} url
	,	url: Utils.getAbsoluteUrl('services/StoreLocator.Service.ss')

	});
});