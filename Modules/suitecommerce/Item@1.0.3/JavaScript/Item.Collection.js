/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Item
define(
	'Item.Collection'
,	[
		'Backbone.CachedCollection'
	,	'Item.Model'
	,	'Session'
	,	'Profile.Model'

	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCachedCollection
	,	ItemModel
	,	Session
	,	ProfileModel

	,	_
	)
{
	'use strict';

	//@class Item.Collection @extends Backbone.BackboneCachedCollection
	return BackboneCachedCollection.extend({

		url: function()
		{
			var profile = ProfileModel.getInstance()
			,	url = _.addParamsToUrl(
				profile.getSearchApiUrl()
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			,	profile.isAvoidingDoubleRedirect()
			);

			return url;
		}

	,	model: ItemModel

		// http://backbonejs.org/#Model-parse
	,	parse: function (response)
		{
			// NOTE: Compact is used to filter null values from response
			return _.compact(response.items) || null;
		}
	});
});
