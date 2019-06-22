/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.CategoryCellList.View'
,	[
		'Facets.CategoryCell.View'

	,	'facets_category_cell_list.tpl'

	,	'Backbone'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	]
,	function(
		FacetsCategoryCellView

	,	facets_category_cell_list_tpl

	,	Backbone
	,	BackboneCollectionView
	,	BackboneCompositeView
	)
{
	'use strict';

	// @class Facets.CategoryCellList.View @extends Backbone.View
	return Backbone.View.extend({

		initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'Facets.CategoryCells': function()
			{
				return new BackboneCollectionView({
					childView: FacetsCategoryCellView
				,	collection: this.model.values.values
				});
			}
		}

		// @method getContext @return Facets.CategoryCellList.View.Context
	,	getContext: function ()
		{
			//@class Facets.CategoryCellList.View.Context
			return {
				// @property {String} hasTwoOrMoreFacets
				hasTwoOrMoreFacets: this.options.hasTwoOrMoreFacets

				// @property {String} name
			,	name: this.model.name

				// @property {String} url
			,	url: this.model.url
			};
		}
	});
});