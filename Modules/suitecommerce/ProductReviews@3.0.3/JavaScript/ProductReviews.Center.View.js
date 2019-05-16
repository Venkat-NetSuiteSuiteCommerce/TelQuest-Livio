/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductReviews
define('ProductReviews.Center.View'
,	[
		'SC.Configuration'
	,	'ListHeader.View'
	,	'ProductReviews.Collection'
	,	'ProductReviews.Review.View'
	,	'GlobalViews.StarRating.View'
	,	'GlobalViews.RatingByStar.View'
	,	'GlobalViews.Pagination.View'

	,	'product_reviews_center.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Utils'
	,	'jQuery.scPush'
	]
, function (
		Configuration
	,	ListHeaderView
	,	ProductReviewsCollection
	,	ProductReviewsReviewView
	,	GlobalViewsStarRatingView
	,	GlobalViewsRatingByStarView
	,	GlobalViewsPaginationView

	,	product_reviews_center
	,	_
	,	jQuery
	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	Utils
	)
{
	'use strict';

	// @class ProductReviews.Center.View
	// This view is shown when listing the reviews of an item contains event handlers for voting helpfulness and flaging a review
	// @extends Backbone.View
	return Backbone.View.extend({

		template: product_reviews_center

	,	attributes: {
			'id': 'item-product-reviews'
		,	'class': 'item-product-reviews item-detailed-reviews'
		}

	,	initialize: function (options)
		{
			BackboneCompositeView.add(this);

			this.item = options.item;
			this.baseUrl = 'product/' + options.item.get('internalid');

			this.queryOptions = Utils.parseUrlOptions(location.href);
			this.application = options.application;

			this.collection = new ProductReviewsCollection();
			this.collection.itemid = this.item.get('internalid');

			var self = this
			,	reviews_params = this.collection.getReviewParams(this.queryOptions);

			reviews_params.itemid = this.item.get('internalid');

			// return the fetch 'promise'
			this.collection.fetch(
			{
				data: reviews_params
			,	killerId: this.killerId
			}).done(function ()
			{
				self.updateCannonicalLinks();

				// append and render the view
				// $placeholder.empty().append(this.$el);
				self.render();

				self.collection.on('reset', function ()
				{
					self.render();
				});
			});
		}

	,	render: function ()
		{
			this._render();
			this.$('[data-action="pushable"]').scPush();
		}

		// @method getRelPrev
		// @return {String?}
	,	getRelPrev: function ()
		{
			var current_page = this.queryOptions && parseInt(this.queryOptions.page) || 1;

			if (current_page > 1)
			{
				if (current_page === 2)
				{
					return this.baseUrl;
				}

				if (current_page > 2)
				{
					return this.baseUrl + '?page=' + (current_page - 1);
				}
			}

			return null;
		}

		// @method getRelNext
		// @return {String}
	,	getRelNext: function ()
		{
			var current_page = this.queryOptions && this.queryOptions.page || 1;

			if (current_page < this.collection.totalPages)
			{
				return this.baseUrl += '?page='+ (current_page + 1);
			}

			return null;
		}

		// @method getUrlForOption creates a new url based on a new filter or sorting options
		// @param {filter:String,sort:String} option
	,	getUrlForOption: function (option)
		{
			var options = {}
			,	sort = option && option.sort || this.queryOptions.sort
			,	filter = option && option.filter || this.queryOptions.filter;

			if (filter)
			{
				options.filter = filter;
			}

			if (sort)
			{
				options.sort = sort;
			}

			return this.baseUrl +'?'+ jQuery.param(options);
		}

		// @method setupListHeader @param {Backbone.Collection} collection
	,   setupListHeader: function (collection)
		{
			var sorts = _(Configuration.get('productReviews.sortOptions')).map(function(sort)
			{
				sort.value = sort.id;
				return sort;
			});
			var filters = _(Configuration.get('productReviews.filterOptions')).map(function(filter)
			{
				filter.value = filter.id;
				return filter;
			});

			return {
				view: this
			,	application: this.application
			,	collection: collection
			,	sorts: sorts
			,	filters: filters
			,   avoidFirstFetch: true
			,   totalCount: this.item.get('_ratingsCount')
			,	customFilterHandler: this.filterOptionsHandler
			};
		}

		// @method updateCannonicalLinks
	,   updateCannonicalLinks: function ()
		{
			var $head = jQuery('head')
			,   previous_page = this.getRelPrev()
			,   next_page = this.getRelNext();

			$head.find('link[rel="next"], link[rel="prev"]').remove();

			if (previous_page)
			{
				jQuery('<link/>', {
					rel: 'prev'
				,	href: previous_page
				}).appendTo($head);
			}

			if (next_page)
			{
				jQuery('<link/>', {
					rel: 'next'
				,	href: next_page
				}).appendTo($head);
			}
		}

	,	filterOptionsHandler: function(element, elem_sort)
		{
			if (element.id !== 'all')
			{
				elem_sort.find('option[value="date"]').prop('selected', true);
				elem_sort.prop('disabled', true);
			}
			else
			{
				elem_sort.prop('disabled', false);
			}
		}
	,	childViews: {
			'ProductReviews.Review': function ()
			{
				return new BackboneCollectionView({
					collection: this.collection
				,	childView: ProductReviewsReviewView
				,	childViewOptions: _.extend(
						{
							showActionButtons: true
						,	collection: this.collection
						}
					, 	Configuration.get('productReviews')
					)
				,	viewsPerRow: 1
				});
			}

		,	'Global.StarRating': function()
			{
				return new GlobalViewsStarRatingView({
					model: this.item
				,	showRatingCount: false
				,	showValue: true
				});
			}

		,	'Global.RatingByStar': function()
			{
				return new GlobalViewsRatingByStarView({
					model: this.item
				,	queryOptions: this.queryOptions
				,	baseUrl: this.baseUrl
				,	showPercentage: true
				,	showCount: true
				});
			}

		,	'GlobalViews.Pagination': function()
			{
				return new GlobalViewsPaginationView(_.extend({
					currentPage: this.collection.page || 0
				,	totalPages: this.collection.totalPages || 0
				,	pager: function (page)
					{
						return '/'+ (page > 1 ? _.setUrlParameter(Backbone.history.fragment, 'page', page) : _.removeUrlParameter(Backbone.history.fragment, 'page'));
					}
				,	extraClass: 'pull-right no-margin-top no-margin-bottom'
				},	Configuration.get('defaultPaginationSettings')));
			}

		,	'ListHeader.View': function()
			{
				return new ListHeaderView(this.setupListHeader(this.collection));
			}
		}

		//@method getContext
		//@returns {ProductReviews.Center.View.Context}
	,	getContext: function ()
		{
			//@class ProductReviews.Center.View.Context
			return {
				//@property {Number} itemCount
				itemCount: this.item.get('_ratingsCount')
				//@property {Boolean} hasOneReview
			,	hasOneReview: this.item.get('_ratingsCount') === 1
				//@property {String} itemUrl
			,	itemUrl: this.item.get('_url')
				//@property {String} pageHeader
			,	pageHeader: this.page_header
				//@property {Number} totalRecords
			,	totalRecords: this.collection.totalRecordsFound
			};
			//@class ProductReviews.Center.View
		}
	});
});
