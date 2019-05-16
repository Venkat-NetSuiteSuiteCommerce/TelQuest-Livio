/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @class ProductReviews.Review.View This view is shown when listing the reviews of an item contains event handlers for voting helpfulness and flaging a review @extend {BackboneView}
define('ProductReviews.Review.View'
,	[
		'GlobalViews.StarRating.View'
	,	'GlobalViews.Message.View'

	,	'product_reviews_review.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Utils'
	]
, function (
		GlobalViewsStarRatingView
	,	GlobalViewsMessageView

	,	product_reviews_review

	,	_
	,	jQuery
	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	)
{
	'use strict';

	return Backbone.View.extend({

		template: product_reviews_review

	,	events: {
			'click button[data-action="vote"]': 'markReview'
		}

	,	initialize: function (options)
		{
			BackboneCompositeView.add(this);
			this.collection = options.collection;
			this.showActionButtons = options.showActionButtons;
			this.voted = false;
		}

		//@method handleMarkSuccess Handle async logic after marking a review as useful or not useful
		//@param {Number} review_id
		//@param {string} action Indicate if the action was marking the review as useful or not
		//@param {ProductReviews.Model} review Review Model
		//@param {jQuery.Element} $container jQuery element containing the review
	,	handleMarkSuccess: function (review_id, action, review, $container)
		{
			var currentReviewedItems = JSON.parse(jQuery.cookie('votedReviewsId') || '{}')
			,	target_button = $container.context;

			// this should be always false because you cannot mark an already marked review
			if (!currentReviewedItems[review_id])
			{
				currentReviewedItems[review_id] = {};
				currentReviewedItems[review_id][action] = true;
				jQuery.cookie('votedReviewsId', JSON.stringify(currentReviewedItems));

				var rated = {};
				rated[action] = true;
				rated.voted = true;
				review.set('rated', rated);
			}

			this.model = review;

			var global_view_message = new GlobalViewsMessageView({
					message: _('<strong>Thank You!</strong> We love your feedback.').translate()
				,	type: 'success'
				,	closable: true
			});

			target_button.innerText = (action === 'mark-as-useful') ?  _('Yes ($(0))').translate(this.model.get('useful_count')) : _('No ($(0))').translate(this.model.get('not_useful_count'));

			this.$el.find(target_button).addClass('product-reviews-review-voted');

			this.$el.find('[data-type="alert-placeholder"]').html(global_view_message.render().$el.html());
		}

		//@method handleMarkError Handle the logic after marking a review as useful or not useful in the case the synchronization with the back-end
		// produce an error
		//@param {jQuery} $container jQuery element containing the review
	,	handleMarkError: function ($container)
		{
			var global_view_message = new GlobalViewsMessageView({
					message: _('<b>We are sorry!</b> There has been an error, please try again later.').translate()
				,	type: 'warning'
				,	closable: true
			});

			// otherwise we show an error message
			$container
				.find('[data-action="vote"]').removeClass('disabled').end()
				.find('[data-type="alert-placeholder"]').html(global_view_message.render().$el.html());
		}

		//@method markReview Handles the ajax call to vote or flag a review //@param {Event} e
	,	markReview: function (e)
		{
			var $element = jQuery(e.target);

			if (!$element.hasClass('disabled') && (!this.voted))
			{
				var	rated = {}
				,	proxy = jQuery.proxy

				,	action = $element.data('type')
				,	$container = $element.closest('.review-container')

					// we get the review from the collection
				,	review_id = $element.data('review-id')
				,	review = this.collection.get(review_id);

				$element.addClass('disabled');

				//lock buttons reviews
				this.voted = true;

				// we set the action that we are going to call
				review.set({
					action: action
				,	rated: rated
				});

				// and then we do the save the review
				review.save().then(
					proxy(this.handleMarkSuccess, this, review_id, action, review, $container)
				,	proxy(this.handleMarkError, this, $container)
				);
			}
		}

	,	childViews: {
			'ProductReview.Review.Global.StarRating': function()
			{
				return new GlobalViewsStarRatingView({
					model: this.model
				,	showRatingCount: false
				});
			}
		,	'Global.StarRatingAttribute': function()
			{
				var collection = new Backbone.Collection(_.map(this.model.get('rating_per_attribute'), function (value, key)
					{
						return {
							label: key
						,	rating: value
						};
					}));

				return new BackboneCollectionView({
					collection: collection
				,	childView: GlobalViewsStarRatingView
				,	childViewOptions: {
						showRatingCount: false
					,	className: 'pegs text-center'
					}
				,	viewsPerRow: 1
				});

			}
		}

		// @method getContext @returns {ProductReviews.Review.View.Context}
	,	getContext: function ()
		{
			var rated = this.model.get('rated') || {};
			rated.voted = this.voted;

			//@class ProductReviews.Review.View.Context
			return {
				//@property {String} reviewCreatedOn
				reviewCreatedOn: this.model.get('created_on') || (new Date()).toDateString()
				//@property {String} reviewTitle
			,	reviewTitle: this.model.get('title')
				//@property {String} reviewAuthor
			,	reviewAuthor: (this.model.get('writer').name || _('anonymous').translate())
				//@property {Boolean} isReviewVerified
			,	isReviewVerified: !!this.model.get('isVerified')
				//@property {String} reviewText
			,	reviewText: this.model.get('text')
				//@property {Boolean} isReviewRatingPerAttributesLegthGreaterThan0
			,	isReviewRatingPerAttributesLegthGreaterThan0: !!_.values(this.model.get('rating_per_attribute')).length
				//@property {Boolean} showActionButtons
			,	showActionButtons: this.showActionButtons
				//@property {String} usefulButtonClass
			,	usefulButtonClass: rated.voted ? 'disabled'+ (rated['mark-as-useful'] ? ' btn-success' : '') : ''
				//@property {Number} reviewId
			,	reviewId: this.model.get('internalid')
				//@property {Boolean} usefulCountGreaterThan0
			,	usefulCountGreaterThan0: this.model.get('useful_count') > 0
				//@property {Number} usefulCount
			,	usefulCount: this.model.get('useful_count')
				//@property {String} notUsefulButtonClass
			,	notUsefulButtonClass: rated.voted ? 'disabled'+ (rated['mark-as-not-useful'] ? ' btn-success' : '') : ''
				//@property {Boolean} notusefulCountGreater
			,	notusefulCountGreater: this.model.get('not_useful_count') > 0
				//@property {Number} notUsefulCount
			,	notUsefulCount: this.model.get('not_useful_count')
			};
		}
	});
});
