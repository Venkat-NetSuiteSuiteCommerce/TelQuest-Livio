/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.FacetCategoriesList.View'
,	[
	//	'Facets.FacetCategory.View'  was causing circular dependency

		'facets_facet_categories_list.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'

	,	'underscore'
	]
,	function(
		//FacetsFacetCategoryView  was causing circular dependency

		facets_facet_categories_list_tpl

	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView

	,	_
	)
{
	'use strict';

	// @class Facets.FacetCategoriesList.View @extends Backbone.View
	return Backbone.View.extend({

		initialize: function ()
		{
			// We assume this.model is a facet
			BackboneCompositeView.add(this);
		}

		// @method getContext @return Facets.FacetCategoriesList.View.Context
	,	getContext: function ()
		{
			//@class Facets.FacetCategoriesList.View.Context
			return {
				// @property {Boolean} hasListId
				hasListId: !_.isUndefined(this.options.listId)

				// @property {Boolean} listId
			,	listId: this.options.listId

				// @property {Boolean} isCollapsible
			,	isCollapsible: this.options.list_id && this.options.collapsed
			};
			//@class Facets.FacetCategoriesList.Vie
		}

	,	childViews: {
			'Facets.FacetCategoryValues': function()
			{
				return new BackboneCollectionView({
					collection: _.values(this.options.list)
				//,	childView: FacetsFacetCategoryView
				,	childViewOptions: {
						facet: this.options.facet
					,	translator: this.options.translator
					,	selected: this.options.selected
					,	listId: this.options.listId
					}
				});
			}
		}
	});
});