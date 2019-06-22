/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ItemsSearcher
define('ItemsSearcher.Collection'
,	[
		'SC.Configuration'
	,	'Item.Collection'

	,	'underscore'

	,	'Utils'
	,	'typeahead'
	]
,	function (
		Configuration
	,	ItemCollection

	,	_
	)
{
	'use strict';

	// @class ItemsSearcher.Collection Connects to the search api to get the minimal information of the items to show on the typeahead of the search
	// A Model Contains a Collection of items and the list of facet groups with its values
	// @extends Item.Collection
	return ItemCollection.extend({

		// @class ItemsSearcher.View.Options.Collection.Option
		defaultOptions: {
			//@property {String} searcherAPIConfiguration
			searcherAPIConfiguration: 'searchApiMasterOptions.typeAhead'
		}
		// @class ItemsSearcher.Collection

		//@method initialize
		//@param {Array<Item.Model>?} collection
		//@param {ItemsSearcher.View.Options.Collection.Option?} options
		//@return {Void}
	,	initialize: function (collection, options)
		{
			this.options = _.defaults(options || {}, this.defaultOptions);
			this.searchApiMasterOptions = Configuration.get(this.options.searcherAPIConfiguration);

			ItemCollection.prototype.initialize.apply(this, arguments);

		}

		//@method fetch We need to make sure that the cache is set to true, so we wrap it
		//@param {Object} options
		//@return {jQuery.Proxy}
	,	fetch: function (options)
		{
			options = options || {};
			options.cache = true;

			return ItemCollection.prototype.fetch.apply(this, arguments);
		}
	});
});