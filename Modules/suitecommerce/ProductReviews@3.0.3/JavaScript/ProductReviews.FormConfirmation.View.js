/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module PProductReviews
define('ProductReviews.FormConfirmation.View'
,	[
		'Facets.ItemCell.View'
	,	'GlobalViews.StarRating.View'

	,	'product_reviews_form_confirmation.tpl'

	,	'underscore'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Utils'
	]
, function(
		FacetsItemCellView
	,	GlobalViewsStarRatingView

	,	product_reviews_form_confirmation

	,	_
	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	)
{
	'use strict';

	// @class ProductReviews.FormConfirmation.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_reviews_form_confirmation

	,	attributes: {
			'id': 'product-review-form-confirmation'
		,	'class': 'product-review-form-confirmation'
		}

	,	title: _('Confirmation').translate()

	,	confirmation_message: _('<h2>Thank You!</h2><p>Your review has been submitted.</p>').translate()

	,	initialize: function (options)
		{
			BackboneCompositeView.add(this);

			this.product = options.product;
			this.item = this.product.get('item');
		}

		//@method getBreadcrumb
	,	getBreadcrumb: function ()
		{
			var result = this.item.get('_breadcrumb').slice(0);

			// we add the new element to the breadcrumb array
			result.push({
				href: this.item.get('_url') +'/reviews'
			,	text: _('Reviews').translate()
			});

			result.push({
				href: this.item.get('_url') + '/reviews/new'
			,	text: _('Thank you').translate()
			});

			return result;
		}

	,	childViews: {
			'Global.StarRating': function()
			{
				return new GlobalViewsStarRatingView({
					model: this.model
				,	showRatingCount: false
				,	showLabelRating: true
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
		,	'Facets.ItemCell': function ()
			{
				return new FacetsItemCellView({
					model: this.product
				,	itemIsNavigable: false
				});
			}
		}

		//@method getContext
		//@returns {ProductReviews.FormConfirmation.View.Context}
	,	getContext: function ()
		{
			//@class ProductReviews.FormConfirmation.View.Context
			return {
				//@property {String} header
				header: this.title
				//@property {String} confirmationMessage
			,	confirmationMessage: this.confirmation_message
				//@property {String} productTitle
			,	productTitle: this.item.get('_name')
				//@property {String} itemUrl
			,	itemUrl: this.item.get('_url')
				//@property {String} reviewCreatedOn
			,	reviewCreatedOn: this.model.get('created_on') || (new Date()).toDateString()
				//@property {String} reviewTitle
			,	reviewTitle: this.model.get('title')
				//@property {String} reviewAuthor
			,	reviewAuthor: (this.model.get('writer').name || _('anonymous').translate())
				//@property {Boolean} isReviewVerified
			,	isReviewVerified: !!this.model.get('isVerified')
				//@property {String} reviewText
			,	reviewText: this.model.get('text')
			};
			//@class ProductReviews.FormConfirmation.View
		}
	});
});
