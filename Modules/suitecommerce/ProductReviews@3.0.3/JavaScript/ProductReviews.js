/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductReviews
// Defines the ProductReviews module (Model, Collection, Views, Router)
// Mount to App also handles rendering of the reviews
// if the current view has any placeholder for them
define('ProductReviews'
,	[
		'ProductReviews.Router'
	,	'ProductReviews.Center.View'
	,	'GlobalViews.StarRating.View'
	,	'ProductDetails.Full.View'
	]
,	function(
		Router
	,	ProductReviewsCenterView
	,	GlobalViewsStarRatingView
	,	ProductDetailsFullView
	)
{
	'use strict';

	// @class ProductReviews @extends ApplicationModule
	var ProductReviewsModule =
	{
		mountToApp: function (application)
		{
			if (SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled)
			{
				ProductDetailsFullView.addChildViews({
					'ProductReviews.Center': function wrapperFunction (options)
					{
						return function ()
						{
							return new ProductReviewsCenterView({
								item: options.model.get('item')
							,	application: options.application
							});
						};
					}
				});

				ProductDetailsFullView.addChildViews({
					'Global.StarRating': function wrapperFunction (options)
					{
						return function ()
						{
							return new GlobalViewsStarRatingView({
								model: options.model.get('item')
							,	showRatingCount: true
							,	showSchemaInfo: true
							});
						};
					}
				});
			}

			// default behavior for mount to app
			return new Router(application);
		}
	};

	return ProductReviewsModule;
});
