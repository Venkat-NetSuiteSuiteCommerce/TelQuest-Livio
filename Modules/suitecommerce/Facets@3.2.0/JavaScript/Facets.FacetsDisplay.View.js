/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.FacetsDisplay.View'
,	[
		'Backbone.CollectionView'
	,	'facets_facets_display.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		BackboneCollectionView

	,	facets_facets_display_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Facets.FacetsDisplay.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_facets_display_tpl

		// @method getContext @return {Facets.FacetsDisplay.View.Context}
	,	getContext: function ()
		{
			var facets = this.options.facets
			,	translator = this.options.translator;

			_.each(facets, function(facet) {
				facet.value = _.isArray(facet.value) ? facet.value : [facet.value];
			});

			var facet_values = [];

			_.each(facets, function(facet) {
				_.each(facet.value, function(value) {
					var value_data = {
						facetValueIsObject: _.isObject(value)
					,	from: _.isObject(value) ? _.formatCurrency(value.from) : ''
					,	to: _.isObject(value) ? _.formatCurrency(value.to) : ''
					,	valueLabel: translator.getLabelForValue(facet.id, value)
					,	facetValueUrl: translator.cloneForFacetId(facet.id, value).getUrl()
					,	facetValue: facet.value
					};

					facet_values.push(value_data);
				});
			});

			// @class Facets.FacetsDisplay.View.Context
			return {

				// @property {Boolean} hasFacets
				hasFacets: facets.length > 0

				// @property {String} clearAllFacetsLink
			,	clearAllFacetsLink: translator.cloneWithoutFacets().getUrl()

				// @property {Array} values
			,	values: facet_values
			};
			// @class Facets.FacetsDisplay.View
		}
	});
});