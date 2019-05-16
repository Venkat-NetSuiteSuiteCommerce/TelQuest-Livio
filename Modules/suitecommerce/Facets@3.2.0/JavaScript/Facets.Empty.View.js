/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.Empty.View'
,	[
		'SC.Configuration'
	,	'facets_empty.tpl'

	,	'Utils'

	,	'Backbone'
	]
,	function(
		Configuration
	,	facets_empty_tpl

	,	Utils

	,	Backbone
	)
{
	'use strict';

	// @class Facets.Empty.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_empty_tpl

		// @method getContext @returns {Facets.Empty.View.Context}
	,	getContext: function ()
		{
			//@class Facets.Empty.View.Context
			return {
				// @property {String} keywords
				keywords: this.options.keywords
			};
			//@classFacets.Empty.View.View
		}
	});
});