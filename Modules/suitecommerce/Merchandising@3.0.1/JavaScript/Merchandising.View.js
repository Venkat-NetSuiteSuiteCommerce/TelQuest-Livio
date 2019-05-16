/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Merchandising
define(
	'Merchandising.View'
,	[	'merchandising_zone.tpl'
	,	'merchandising_zone_cell_template.tpl'
	,	'merchandising_zone_row_template.tpl'

	,	'SC.Configuration'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'ItemRelations.RelatedItem.View'
	,	'underscore'
	,	'Utils'
	,	'jQuery.bxSlider'
	]
,	function (
		merchandising_zone_tpl
	,	merchandising_zone_cell_template_tpl
	,	merchandising_zone_row_template_tpl

	,	Configuration
	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	ItemRelationsRelatedItemView
	,	_
	)
{
	'use strict';

	// @class Merchandising.View Responsible for rendering the list of item requested by a merchandizing
	// rule @extend Backbone.View
	return Backbone.View.extend({

		template: merchandising_zone_tpl

		// @method initialize Creates a new instance of the current view
		// @param {MerchandisingRule.Model} options.model
		// @param {Merchandising.ItemCollection} options.items
	,	initialize: function (options)
		{
			this.model = options.model;
			this.items = options.items;

			Backbone.View.prototype.initialize.apply(this, arguments);
			BackboneCompositeView.add(this);

			var self = this;
			this.on('afterMerchandAppendToDOM', _.bind(this.initSlider, self));
		}

	,	childViews: {
			'Zone.Items': function()
			{
				var itemsCollectionView = new BackboneCollectionView({
					childView: ItemRelationsRelatedItemView
				,	viewsPerRow: Infinity
				,	cellTemplate: merchandising_zone_cell_template_tpl
				,	rowTemplate: merchandising_zone_row_template_tpl
				,	collection: _.first(this.items.models, this.model.get('show'))
				});

				return itemsCollectionView;
			}
		}

		// @method initSlider
	,	initSlider: function ()
		{
			var element = this.$el.find('[data-type="carousel-items"]');
			this.$slider = _.initBxSlider(element, Configuration.bxSliderDefaults);
		}

		// @method getContext @returns {Content.LandingPages.View.Context}
	,	getContext: function ()
		{
			// @class Content.LandingPages.View.Context
			return {
				// @property {String} zoneTitle
				zoneTitle: this.model.get('title')
				// @property {Boolean} isZoneDescription
			,	isZoneDescription: !!this.model.get('description')
				// @property {Stirng} zoneDescription
			,	zoneDescription: this.model.get('description')
			};
		}

	});
});