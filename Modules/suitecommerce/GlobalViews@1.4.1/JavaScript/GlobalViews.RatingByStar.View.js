/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.RatingByStar.View'
,	[
		'SC.Configuration'

	,	'global_views_rating_by_star.tpl'

	,	'Backbone'
	,	'jQuery'
	]
,	function(
		Configuration

	,	global_views_rating_by_star_tpl

	,	Backbone
	,	jQuery
	)
{
	'use strict';

	// @class GlobalViews.RatingByStar.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_rating_by_star_tpl

	,	initialize: function (options)
		{
			this.showPercentage = options.showPercentage;
			this.showCount = options.showCount;
			this.queryOptions = options.queryOptions;
			this.baseUrl = options.baseUrl;
		}

		// @method getContext @returns {GlobalViews.RatingByStar.View.Context}
	,	getContext: function ()
		{
			var maxRate = Configuration.get('productReviews.maxRate')
			,	ratingsCountsByRate = this.model.get('_ratingsCountsByRate')
			,	count
			,	percentage
			,	rates = [];

			for (var i = maxRate; i > 0; i-- )
			{
				count = ratingsCountsByRate[i] ? ratingsCountsByRate[i] : 0;
				percentage = count * 100 / this.model.get('_ratingsCount');
				rates.push({
					count: count
				,	percentage: percentage
				,	percentageRound: Math.round(percentage)
				,	index: i
				,	showLink: count ? true : false
				,	url: this.getUrlForOption({ filter: i +'star' })
				,	isOneReview: count === '1'
				});
			}

			//@class GlobalViews.RatingByStar.View.Context
			return {
				//@property {Boolean} showCount
				showCount: this.showCount
				//@property {Boolean} showPercentage
			,	showPercentage: this.showPercentage
				//@property {Array} rates
			,	rates: rates
			};
		}

		// creates a new url based on a new filter or sorting options
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
	});
});
