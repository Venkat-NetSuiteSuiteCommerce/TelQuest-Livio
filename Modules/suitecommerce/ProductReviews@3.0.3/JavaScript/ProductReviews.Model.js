/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductReview
define('ProductReviews.Model'
,	[
		'Backbone.CachedModel'

	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function(
		BackboneCachedModel

	,	_
	,	jQuery
	)
{
	'use strict';

	// @class ProductReviews.Model It returns a new instance of a Backbone CachedModel
	// initializes writer and rating per attribute if null or undefined
	// @extends Backbone.CachedModel
	return BackboneCachedModel.extend({
		urlRoot: _.getAbsoluteUrl('services/ProductReviews.Service.ss')
		// conditions for each of the fields to be valid
		// [Backbone.Validation](https://github.com/thedersen/backbone.validation)
	,	validation: {
			rating: {
				required: true
			,	msg: _('Rating is required').translate()
			}
		,	title: {
				fn: function (value)
				{
					if (!value)
					{
						return _('Title is required').translate();
					}

					if (value.length >= 199)
					{
						return _('The field name cannot contain more than the maximum number (199) of characters allowed.').translate();
					}
				}
			}
		,	text: {
				fn: function (value)
				{
					if (!value)
					{
						return _('Text is required').translate();
					}

					if (value.length > 1000)
					{
						return _('The review field cannot contain more than the maximum number (1000) of characters allowed.').translate();
					}
				}
			}
		,	writerName: {
				required: true
			,	msg: _('Writer is required').translate()
			}
		}

	,	parse: function (response)
		{
			response.rated = JSON.parse(jQuery.cookie('votedReviewsId') || '{}')[response.internalid];
			return response;
		}
	});
});