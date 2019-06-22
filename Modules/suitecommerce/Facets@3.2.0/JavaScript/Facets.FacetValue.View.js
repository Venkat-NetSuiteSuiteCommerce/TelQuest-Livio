/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.FacetValue.View'
,	[		
		'facets_facet_value.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		facets_facet_value_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Facets.FacetValue.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_facet_value_tpl
		
		// @method getContext @returns {Facets.FacetValue.View.Context}
	,	getContext: function ()
		{
			// @class Facets.FacetValue.View.Context
			return {
				// @property {Boolean} isActive	
				isActive: _.contains(this.selected, this.options.isActiveByLabel ? this.model.label : this.model.url)

				// @property {String} facetValueUrl
			,	facetValueUrl: this.options.translator.cloneForFacetId(this.options.facetId, this.model.url).getUrl()

				// @property {String} label
			,	label: this.model.label

				// @property {String} formattedLabel
			,	formattedLabel: this.options.model.label || this.model.url || _('(none)').translate()

				// @property {String} value
			,	value: this.model.value

				// @property {String} url
			,	url: this.model.url

				// @property {Boolean} behaviorIsMulti
			,	behaviorIsMulti: this.options.config.behavior === 'multi'		
			};
			// @class Facets.FacetValue.View
		}
	});
});