/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SiteSearch
define('SiteSearch.Model'
,	[
		'SC.Configuration'
	,	'ItemDetails.Collection'
	,	'Session'
	,	'underscore'
	,	'Backbone'
	,	'Profile.Model'
	,	'Utils'
	,	'typeahead'
	]
,	function (
		Configuration
	,	ItemDetailsCollection
	,	Session
	,	_
	,	Backbone
	,	ProfileModel
	)
{
	'use strict';

	var original_fetch = Backbone.CachedModel.prototype.fetch;

	// @class SiteSearch.Model Connects to the search api to get the minimal information of the items to show on the typeahead of the search
	// A Model Contains a Collection of items and the list of facet groups with its values
	// @extends Backbone.CachedModel
	return Backbone.CachedModel.extend({

		//@method url
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

		//@method initialize
	,	initialize: function ()
		{
			this.searchApiMasterOptions = _.getPathFromObject(Configuration, 'searchApiMasterOptions.typeAhead');
			// Listen to the change event of the items and converts it to an ItemDetailsCollection
			this.on('change:items', function (model, items)
			{
				if (!(items instanceof ItemDetailsCollection))
				{
					// NOTE: Compact is used to filter null values from response
					model.set('items', new ItemDetailsCollection(_.compact(items)));
				}
			});
		}

		//@method fetch
		//@param {Object} options
		// We need to make sure that the cache is set to true, so we wrap it
	,	fetch: function (options)
		{
			options = options || {};

			options.cache = true;

			return original_fetch.apply(this, arguments);
		}
	});
});