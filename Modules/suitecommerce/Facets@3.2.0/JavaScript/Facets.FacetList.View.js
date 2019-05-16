/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.FacetList.View'
,	[
		'Backbone.CollectionView'
	,	'Facets.FacetValue.View'

	,	'facets_facet_list.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	]
,	function(
		BackboneCollectionView
	,	FacetsFacetValueView

	,	facets_facet_list_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	// @class Facets.FacetList.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_facet_list_tpl

	,	initialize: function (options) 
		{
			BackboneCompositeView.add(this);

			this.translator = options.translator;
			this.facet = options.facet;
			this.config = options.config;

			var selected = this.translator.getFacetValue(this.facet.id) || []
			,	facet_values = this.facet.values;

			this.selected = _.isArray(selected) ? selected : [selected];
			this.values = _.reject((_.isArray(facet_values) ? facet_values : [facet_values]), function (filter) {
				return filter.url === '';
			});
		}

	,	childViews: {
			'Facets.FacetValue.Values': function()
			{
				return new BackboneCollectionView({ 
					childView: FacetsFacetValueView
				,	collection: _.first(this.values, this.config.max)
				,	childViewOptions: {
						selected: this.selected
					,	translator: this.translator
					,	facetId: this.facet.id
					,	isActiveByLabel: false
					}  
				});
			}

		,	'Facets.FacetValue.Extra': function()
			{
				var self = this;

				return new BackboneCollectionView({ 
					childView: FacetsFacetValueView
				,	collection: _.rest(self.values, this.config.max)
				,	childViewOptions: {
						selected: this.selected
					,	translator: this.translator
					,	facetId: this.facet.id
					,	isActiveByLabel: true
					}
				});
			}
		}

		// @method getContext @returns {Facets.FacetList.View.Context}
	,	getContext: function ()
		{
			var facet_html_id = _.uniqueId('facetList_')
			,	config_max = this.config.max || this.values.length;			

			// @class Facets.FacetList.View.Context
			return {
				// @property {String} facetUrl
				facetUrl: this.translator.cloneWithoutFacetId(this.facet.id).getUrl()

				// @property {String} facetName
			,	facetName: this.config.name || this.facet.id

				// @property {Boolean} hasValues
			,	hasValues: !!(this.values && this.values.length)

				// @property {Boolean} showHeading
			,	showHeading: !this.config.hideHeading

				// @property {Boolean} unCollapsible
			,	unCollapsible: this.config.uncollapsible

				// @property {Boolean} facetSelected
			,	facetSelected: this.translator.getFacetValue(this.facet.id) || []

				// @property {String} facetHtmlId
			,	facetHtmlId: facet_html_id

				// @property {String} facetHtmlId
			,	facetId: this.facet.id

				// @property {Boolean} facetHtmlId
			,	hasSelectedFacetValues: !!this.selected.length

				// @property {Integer} configMax
			,	configMax: config_max

				// @property {Boolean} hasMoreValuesThanConfigMax
			,	hasMoreValuesThanConfigMax: this.values.length > config_max

				// @property {Boolean} isCollapsed
			,	isCollapsed: !this.config.uncollapsible && this.config.collapsed
			};
			// @class Facets.FacetList.View
		}
	});
});