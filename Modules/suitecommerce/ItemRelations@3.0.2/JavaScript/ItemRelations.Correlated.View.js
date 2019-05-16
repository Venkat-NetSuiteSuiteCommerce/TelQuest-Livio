/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ItemRelations
define('ItemRelations.Correlated.View'
,	[	'Backbone.CollectionView'
	,	'ItemRelations.RelatedItem.View'
	,	'ItemRelations.Correlated.Collection'
	,	'Tracker'

	,	'item_relations_correlated.tpl'
	,	'item_relations_row.tpl'
	,	'item_relations_cell.tpl'

	,	'SC.Configuration'
	,	'Backbone'
	,	'underscore'
	,	'Utils'

	]
,	function (
		BackboneCollectionView
	,	ItemRelationsRelatedItemView
	,	ItemRelationsCorrelatedCollection
	,	Tracker

	,	item_relations_correlated_tpl
	,	item_relations_row_tpl
	,	item_relations_cell_tpl

	,	Configuration
	,	Backbone
	,	_
	)
{
	'use strict';

	// @class ItemRelations.Correlated.View @extends Backbone.CollectionView
	return BackboneCollectionView.extend({

		initialize: function ()
		{
			var is_sca_advanced = Configuration.get('siteSettings.sitetype') === 'ADVANCED'
			,	collection = is_sca_advanced ? new ItemRelationsCorrelatedCollection({itemsIds: this.options.itemsIds}) : new Backbone.Collection()
			,	layout = this.options.application.getLayout()
			,	self = this;

			BackboneCollectionView.prototype.initialize.call(this, {
				collection: collection
			,	viewsPerRow: Infinity
			,	cellTemplate: item_relations_cell_tpl
			,	rowTemplate: item_relations_row_tpl
			,	childView: ItemRelationsRelatedItemView
			,	template: item_relations_correlated_tpl
			});

			if (is_sca_advanced)
			{
				layout.once('afterAppendView', self.loadRelatedItems, self);
				layout.currentView && layout.currentView.once('afterCompositeViewRender', self.loadRelatedItems, self);
			}
		}

	,	loadRelatedItems: function loadRelatedItems ()
		{
			var self = this;

			self.collection.fetchItems().done(function()
			{
				Tracker.getInstance().trackProductList(self.collection, 'Correlated Items');
				self.render();

				var carousel = self.$el.find('[data-type="carousel-items"]');

				if (_.isPhoneDevice() === false && self.options.application.getConfig('siteSettings.imagesizes'))
				{
					var img_min_height = _.where(self.options.application.getConfig('siteSettings.imagesizes'), {name: self.options.application.getConfig('imageSizeMapping.thumbnail')})[0].maxheight;

					carousel.find('.item-relations-related-item-thumbnail').css('minHeight', img_min_height);
				}

				_.initBxSlider(carousel, Configuration.bxSliderDefaults);
			});
		}

	,	destroy: function destroy ()
		{
			this._destroy();

			var	layout = this.options.application.getLayout();

			layout.off('afterAppendView', this.loadRelatedItems, this);
			layout.currentView && layout.currentView.off('afterCompositeViewRender', this.loadRelatedItems, this);
		}
	});
});
