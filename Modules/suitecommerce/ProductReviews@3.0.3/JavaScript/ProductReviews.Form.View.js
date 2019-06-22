/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductReviews
define('ProductReviews.Form.View'
,	[
		'SC.Configuration'
	,	'Profile.Model'
	,	'ProductReviews.FormPreview.View'
	,	'ProductReviews.FormConfirmation.View'
	,	'Facets.ItemCell.View'
	,	'GlobalViews.StarRating.View'

	,	'product_reviews_form.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Backbone.FormView'
	,	'Utils'
	]
, function(
		Configuration
	,	ProfileModel
	,	ProductReviewsFormPreviewView
	,	ProductReviewsFormConfirmationView
	,	FacetsItemCellView
	,	GlobalViewsStarRatingView

	,	product_reviews_form

	,	_
	,	jQuery
	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	BackboneFormView
	)
{
	'use strict';

	// @class ProductReviews.Form.View
	// This view is used to render the Product Review form. It handles the rating and submission of the review
	// @extends Backbone.View
	var ProductReviewsFormView = Backbone.View.extend({

		template: product_reviews_form

	,	attributes: {
			'id': 'product-review-form'
		,	'class': 'product-review-form'
		}

	,	title: _('Write your Review').translate()

	,	page_header: _('Write your Review').translate()

	,	events: {
			'submit form': 'customSaveForm'
		,	'rate [data-toggle="rater"]': 'rate'
		,	'click [data-action="preview"]': 'preview'
		}

	,	bindings: {
			'[name="text"]': 'text'
		,	'[name="title"]': 'title'
		,	'[name="writerName"]': 'writerName'
		}

	,	initialize: function (options)
		{
			BackboneCompositeView.add(this);

			this.product = options.product;
			this.item = this.product.get('item');
			this.tmpRatingPerAtribute = {};

			this.application = options.application;
			this.profileModel = ProfileModel.getInstance();

			// we let the view know if the customer is logged in
			// as this might be required to add a review
			this.isLoggedIn = this.profileModel.get('isLoggedIn') === 'T';

			this.updateMetaTags();

			// if the user is logged in and this is the first time we're initializing the view we preload the nickname
			if (this.isLoggedIn && !(this.model.get('writer') && this.model.get('writer').name))
			{
				var writer_name = this.profileModel.get('firstname');

				this.model.set('writerName', writer_name);
				this.model.set('writer', { name: writer_name });
			}

			BackboneFormView.add(this);
		}

	,	initializeDynamicFields: function ()
		{
			if (_.isEmpty(this.model.get('rating_per_attribute')))
			{
				_.each(this.item.get('_attributesToRateOn'), _.bind(function (attributes)
				{
					this.model.set(attributes, 0);
				}, this));
			}
		}

	,	addDynamicRatingFields: function ()
		{
			var self = this;

			_.each(this.item.get('_attributesToRateOn'), function (dyn_attributes)
			{
				self.model.validation[dyn_attributes] = function (value)
				{
					if (value === 0)
					{
						return _('Attribute is required').translate();
					}
				};
			});
		}

	,	showContent: function ()
		{
			var self = this;

			if (this.model.get('text'))
			{
				// if the model contains text (if comming from a Preview View)
				// we need to parse all html line breaks into regular ones
				this.model.set('text', this.model.get('text').replace(/<br>/g, '\n'));
			}

			this.initializeDynamicFields();
			this.addDynamicRatingFields();
			this.application.getLayout().showContent(this).done(function ()
			{
				// we initialize our custom plugin for rating
				// (file: Bootstrap.Rate.js)
				self.$('[data-toggle="rater"]').rater();
			});
		}

		// @method rate sets the rating of an attribute in the model
		// @param {HTMLEvent} e
		// @param {name:String,value:String} rater
	,	rate: function (e, rater)
		{
			var attributes_to_rate_on = this.item.get('_attributesToRateOn');

			// if the name is not in attributes_to_rate_on
			if (~_.indexOf(attributes_to_rate_on, rater.name))
			{
				this.tmpRatingPerAtribute[rater.name] = rater.value;
				this.model.set(rater.name, rater.value);
			}
			else if (rater.name === '__overall__')
			{
				this.tmpRating = rater.value;

				// rate touched is a flag to prevent auto computing the overall rating
				this.rateTouched = true;
				this.model.set('rating', this.tmpRating);
			}

			if (!this.rateTouched && Configuration.get('productReviews.computeOverall'))
			{
				// auto compute the overall rating
				var average = Math.round(_.reduce(_.values(this.tmpRatingPerAtribute), function (memo, num) {return memo+num; }, 0) / attributes_to_rate_on.length);

				this.$('[data-toggle="rater"][data-name="__overall__"]').data('rater').setValue(average, true);
				this.model.set('rating', average);
			}
		}

		// @method sanitize method to parse html tags into text @param {String} text
	,	sanitize: function (text)
		{
			return jQuery.trim(text).replace(/</g, '&lt;').replace(/\>/g, '&gt;');
		}

		// @method preview When the Preview button is clicked
	,	preview: function (e)
		{
			e && e.preventDefault();

			this.prepareItem();

			Backbone.Validation.bind(this, {selector: 'id'});

			// Then we show the FormPreview using the same Model
			// Notice: the Model contains the selected rate for the different attributes
			// plus the text, title and writer that were set up right above this comment
			this.$savingForm = jQuery(e.target).closest('form');

			if (this.model.isValid(true))
			{
				new ProductReviewsFormPreviewView({
					formView: new ProductReviewsFormView({
						product: this.product
					,	application: this.application
					,	model: this.model
					})
				,	product: this.product
				,	application: this.application
				,	model: this.model
			}).showContent();
			}
		}

		// @method prepareItem
	,	prepareItem: function ()
		{
			var sanitized_writer_name = this.sanitize(this.$('#writerName').val());

			// it sets the Model's text, title and writer
			this.model.set({
				title: this.sanitize(this.$('#title').val())
			,	rating: this.tmpRating || this.model.get('rating')
			,	rating_per_attribute: this.tmpRatingPerAtribute || this.model.get('rating_per_attribute')
			,	writer: { name: sanitized_writer_name }
			,	writerName: sanitized_writer_name
			,	text: this.sanitize(this.$('#text').val())
			});
		}

		//@method customSaveForm Dispatch the user 'save' action. IIt will validate the form and then show the review preview
	,	customSaveForm: function (e)
		{
			e && e.preventDefault();

			this.prepareItem();
			this.model.set('itemid', this.item.get('internalid'));

			//use id as selector because rating's div doesn't have name.
			//This selector is used to show validations' errors 
			this.selector = 'id';
			
			var promise = BackboneFormView.saveForm.apply(this, arguments)
			,	self = this;

			promise && promise.done(function ()
			{
				// Once the review is submited, we show the Confirmation View
				var preview_review = new ProductReviewsFormConfirmationView({
					model: self.model
				,	product: self.product
				,	application: self.application
				});

				preview_review.showContent();
			});

			return promise;
		}

		//@method updateMetaTags
	,   updateMetaTags: function ()
		{
			var $head = jQuery('head');

			jQuery('<meta/>', {
					name: 'robots'
				,	content: 'noindex, nofollow'
				}).appendTo($head);
		}

	,	childViews: {
			'Facets.ItemCell': function()
			{
				return new FacetsItemCellView(
				{
					model: this.product.get('item')
					,	itemIsNavigable: false
					,	showStarRating: false
				});
			}
		,	'Global.StarRatingAttribute': function ()
			{
				var self = this
				,	collection = new Backbone.Collection(_.map(this.item.get('_attributesToRateOn'), function (value)
					{
						return {
							label: value
						,	name: value
						,	rating: !_.isUndefined(self.model.get('rating_per_attribute')) ? self.model.get('rating_per_attribute')[value] : 0
						};
					}));

				return new BackboneCollectionView({
					collection: collection
				,	childView: GlobalViewsStarRatingView
				,	childViewOptions:
					{
						showRatingCount: false
					,	className: 'pegs'
					,	isWritable: true
					}
				,	viewsPerRow: 1
				});
			}
		,	'Global.StarRating': function ()
			{
				this.model.set('label', 'Overall');
				this.model.set('name', '__overall__');

				return new GlobalViewsStarRatingView({
					showRatingCount: false
				,	isWritable: true
				,	value: this.model.get('_rating') || this.model.get('rating') || 0
				,	ratingCount: this.model.get('_ratingsCount')
				,	label: this.model.get('label')
				,	name: this.model.get('name')
				});
			}
		}

		//@method getContext
		//@returns {ProductReviews.Form.View.Context}
	,	getContext: function()
		{
			//@class ProductReviews.Form.View.Context
			return {
				//@property {String} header
				header: this.page_header
				//@property {Boolean} isLoginRequiredAndIsNotLoggedIn
			,	isLoginRequiredAndIsNotLoggedIn: Configuration.get('productReviews.loginRequired') && !this.isLoggedIn
				//@property {String} writer
			,	writer: this.model.get('writer') && this.model.get('writer').name || ''
				//@property {String} title
			,	title: this.model.get('title') || ''
				//@property {String} text
			,	text: this.model.get('text') || ''
				//@property {String} itemUrl
			,	itemUrl: this.item.get('_url')
				//@property {Boolean} showStarRatingAttributes
			,	showStarRatingAttributes: !!this.item.get('_attributesToRateOn').length
			};
		}
	});

	return ProductReviewsFormView;
});
