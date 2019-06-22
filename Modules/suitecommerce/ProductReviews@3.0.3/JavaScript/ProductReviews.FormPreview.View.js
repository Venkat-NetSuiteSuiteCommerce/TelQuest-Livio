/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductReview
define('ProductReviews.FormPreview.View'
,	[
		'ProductReviews.FormConfirmation.View'
	,	'ProductReviews.Preview.View'
	,	'Facets.ItemCell.View'

	,	'product_reviews_form_preview.tpl'

	,	'underscore'
	,	'Backbone'
	,	'Backbone.CompositeView'
	]
, function(
		ProductReviewsFormConfirmationView
	,	ProductReviewsPreview
	,	FacetsItemCellView

	,	product_reviews_form_preview

	,	_
	,	Backbone
	,	BackboneCompositeView
	)
{
	'use strict';

	// @class ProductReviews.FormPreview.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_reviews_form_preview

	,	attributes: {
			'id': 'product-review-form-preview'
		,	'class': 'product-review-form-preview'
		}

	,	title: _('Submit your Review').translate()

	,	page_header: _('Submit your Review').translate()

	,	events: {
			'click [data-action="edit"]': 'edit'
		,	'click [data-action="save"]': 'save'
		}

	,	initialize: function (options)
		{
			BackboneCompositeView.add(this);

			this.product = options.product;
			this.item = this.product.get('item');
			this.formView = options.formView;
		}

	,	childViews: {
			'Facets.ItemCell': function()
			{
				return new FacetsItemCellView({
					model: this.product
				,	itemIsNavigable: false
				});
			}
		,	'ProductReviews.Preview': function()
			{
				return new ProductReviewsPreview({
					model: this.model
				});
			}
		}

		// @method edit when the edit button is clicked, we show the Form view
	,	edit: function ()
		{
			this.formView.showContent();
		}

		// @method save dispatch when the user saves a new review
	,	save: function (e)
		{
			e && e.preventDefault();

			var self = this;

			this.model.set('itemid', this.item.get('internalid')).save(null, {
				statusCode: {
					'401': function ()
					{
						// If login is required from the server side
						// we need to handle it here
					}
				}
			}).done(function ()
			{
				// Once the review is submited, we show the Confirmation View
				var preview_review = new ProductReviewsFormConfirmationView({
					model: self.model
				,	product: self.product
				,	application: self.options.application
				});
				preview_review.showContent();
			});
		}

		//@method getContext @returns {ProductReviews.FormPreview.View.Context}
	,	getContext: function()
		{
			//@class ProductReviews.FormPreview.View.Context
			return {
				//@property {String} header
				header: this.page_header
				//@property {String} itemUrl
			,	itemUrl: this.item.get('_url')
			};
		}
	});
});
