/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.ItemListSummary.View'
,	[		
		'facets_item_list_summary.tpl'

	,	'Backbone'
	]
,	function(
		facets_item_list_summary_tpl

	,	Backbone
	)
{
	'use strict';

	// @class Facets.ItemListSummary.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_item_list_summary_tpl

		// @method getContext @returns {Facets.ItemListSummary.View.Context}
	,	getContext: function ()
		{
			var configuration = this.options.configuration
			,	range_end = configuration.currentPage * configuration.itemPerPage
			,	total = configuration.totalItems;

			// @class Facets.ItemListSummary.View.Context
			return {
				// @property {Number} rangeEnd				
				rangeEnd: Math.min(range_end, total)

				// @property {Number} rangeStart
			,	rangeStart: range_end - configuration.itemsPerPage + 1

				// @property {total} rangeStart
			,	total: total
			};
		}
	});
});