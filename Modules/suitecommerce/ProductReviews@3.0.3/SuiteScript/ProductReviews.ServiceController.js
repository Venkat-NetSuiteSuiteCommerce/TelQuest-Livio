/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ProductReviews.ServiceController.js
// ----------------
// Service to manage product review requests
define(
	'ProductReviews.ServiceController'
,	[
		'ServiceController'
	,	'Application'
	,	'ProductReviews.Model'
	]
,	function(
		ServiceController
	,	Application
	,	ProductReviewsModel
	)
	{
		'use strict';

		// @class ProductReviews.ServiceController Manage product review requests
		// @extend ServiceController
		return ServiceController.extend({

			// @property {String} name Mandatory for all ssp-libraries model
			name: 'ProductReviews.ServiceController'

			// @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLoggedInPPS: true
				}
			}

			// @method get The call to ProductReviews.Service.ss with http method 'get' is managed by this function
			// @return {EmptyObject}
		,	get: function()
			{
				var result
				,	id = this.request.getParameter('internalid') ? this.request.getParameter('internalid') : this.data.internalid;
				if (id)
				{
					// we get the review
					result = ProductReviewsModel.get(id);
					// if the review is not approved
					if (result.status !== ProductReviewsModel.approvedStatus || result.isinactive)
					{
						throw notFoundError;
					}
				}
				else
				{
					var params = this.request.getAllParameters()
					,	filters = {};
					
					Object.keys(params).forEach(function(param)
					{
						filters[param] = params[param];
					});
					result = ProductReviewsModel.search(filters, filters.order, filters.page, filters.limit);
				}
				// send either the individual review, or the search result
				this.sendContent(result,{'cache': response.CACHE_DURATION_LONG});
			}

			// @method post The call to ProductReviews.Service.ss with http method 'post' is managed by this function
			// @return {StatusObject}
		,	post: function()
			{
				// Do not return here as we need to output the status 201
				this.sendContent(ProductReviewsModel.create(this.data), {'status': 201});
			}

			// @method put The call to ProductReviews.Service.ss with http method 'put' is managed by this function
			// @return {ProductReview.Model.Item}
		,	put: function()
			{
				var id = this.request.getParameter('internalid') ? this.request.getParameter('internalid') : this.data.internalid;
				// update review with the data
				ProductReviewsModel.update(id, this.data);
				// and send the review itself
				return ProductReviewsModel.get(id);
			}
		});
	}
);