/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('RecentlyViewedItems.View'
,	[	'Backbone.CollectionView'
	,	'ItemRelations.RelatedItem.View'
	,	'RecentlyViewedItems.Collection'
	,	'SC.Configuration'
	,	'Tracker'

	,	'recently_viewed_items.tpl'
	,	'recently_viewed_row.tpl'
	,	'recently_viewed_cell.tpl'

	,	'jQuery'
	,	'Backbone'
	,	'underscore'
	,	'Utils'

	]
,	function (
		BackboneCollectionView
	,	ItemRelationsRelatedItemView
	,	RecentlyViewedItemsCollection
	,	Configuration
	,	Tracker

	,	recently_viewed_items_tpl
	,	recently_viewed_row_tpl
	,	recently_viewed_cell_tpl

	,	jQuery
	,	Backbone
	,	_
	)
{
	'use strict';

	return BackboneCollectionView.extend({

		initialize: function ()
		{
			var application = this.options.application
			, layout = application.getLayout()
			, collection = application.getConfig('siteSettings.sitetype') === 'ADVANCED' ? RecentlyViewedItemsCollection.getInstance() : new Backbone.Collection()
			, self = this;

			BackboneCollectionView.prototype.initialize.call(this, {
				collection: collection
			,	viewsPerRow: Infinity
			,	cellTemplate: recently_viewed_cell_tpl
			,	rowTemplate: recently_viewed_row_tpl
			,	childView: ItemRelationsRelatedItemView
			,	template: recently_viewed_items_tpl
			});

			layout.once('afterAppendView', self.loadRecentlyViewedItem, self);

		}
		,	loadRecentlyViewedItem: function loadRecentlyViewedItem ()
			{
				var self = this;
				
				this.collection.promise && this.collection.promise.done(function()
				{
					var application = self.options.application
					, number_of_items_displayed = application.getConfig('recentlyViewedItems.numberOfItemsDisplayed');

					Tracker.getInstance().trackProductList(self.collection, 'Recently Viewed Items');
					self.collection = self.collection.first(number_of_items_displayed);
					self.render();

					var carousel = self.$el.find('[data-type="carousel-items"]');

					if(_.isPhoneDevice() === false && application.getConfig('siteSettings.imagesizes'))
					{
						var img_min_height = _.where(application.getConfig('siteSettings.imagesizes'), {name: application.getConfig('imageSizeMapping.thumbnail')})[0].maxheight;

						carousel.find('.item-relations-related-item-thumbnail').css('minHeight', img_min_height);
					}

					_.initBxSlider(carousel, Configuration.bxSliderDefaults);
				});
			}
		});
	});
