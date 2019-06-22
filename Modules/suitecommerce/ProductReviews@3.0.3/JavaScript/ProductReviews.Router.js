/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductReviews
// Handles the rendering of the different views depending on the URL route
define('ProductReviews.Router'
,	[
		'ProductReviews.Model'
	,	'ProductReviews.Collection'
	,	'ProductReviews.Form.View'
	,	'Product.Model'
	,	'AjaxRequestsKiller'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		ProductReviewsModel
	,	Collection
	,	ProductReviewsFormView
	,	ProductModel
	,	AjaxRequestsKiller

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class ProductReviews.Router @extends Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'product/:id/newReview': 'createReviewById'
		,	':url/newReview': 'createReviewByUrl'
		}

	,	initialize: function (Application)
		{
			this.application = Application;
		}

		// @method createReviewByUrl dispatch the create new review by url use case  @param {String} url
	,	createReviewByUrl: function (url)
		{
			// if there are any options in the URL
			if (~url.indexOf('?'))
			{
				url = url.split('?')[0];
			}

			// Now go grab the data and show it
			this.createReview({url: url});
		}

		// @method createReviewById dispatch the create new review by id use case  @param {String} id
	,	createReviewById: function (id)
		{
			this.createReview({id: id});
		}

		// @method createReview main method to dispatch the create review use case.
		// Renders the Product Reviews form @param {Object} api_params the data passed to model.fetch() call
	,	createReview: function (api_params)
		{
			var product = new ProductModel();

			// then we fetch for the data of the item
			// item_details_model.fetch({
			product.get('item').fetch({
				data: api_params
			,	killerId: AjaxRequestsKiller.getKillerId()
			}).done(_.bind(function ()
			{
				var model = new ProductReviewsModel()
				,	view = new ProductReviewsFormView({
						// item: item_details_model
						product: product
					,	model: model
					,	application: this.application
					});

				// and we show the content on success
				view.showContent();
			}, this));
		}
	});
});