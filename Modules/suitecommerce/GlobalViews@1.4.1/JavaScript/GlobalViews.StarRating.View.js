/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.StarRating.View'
,	[
		'SC.Configuration'

	,	'global_views_star_rating.tpl'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function(
		Configuration

	,	global_views_star_rating_tpl

	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class GlobalViews.StarRating.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_star_rating_tpl

	,	initialize: function ()
		{
			if (!this.model)
			{
				return;
			}

			this.options.value = this.model.get('_rating') || this.model.get('rating') || 0;
			this.options.ratingCount = this.model.get('_ratingsCount') || 0;
			this.options.label = this.model.get('label') || '';
			this.options.name = this.model.get('name');
		}

		// @method getContext
		// @returns {GlobalViews.StarRating.View.Context}
	,	getContext: function ()
		{
			var fill_value = Math.round(this.options.value * 2) / 2
			,	max_value = this.options.max || Configuration.get('productReviews.maxRate', 5);

			//@class GlobalViews.StarRating.View.Context
			return {
				//@property {Boolean} showLabelRating
				showLabelRating: this.options.showLabelRating || false
				//@property {Boolean} showLabel
			,	showLabel: !!(this.options.label)
				//@property {String} label
			,	label: this.options.label || ''
				//@property {String} name
			,	name: this.options.name || ''
				//@property {Number} maxValue
			,	maxValue: max_value
				//@property {Number} value
			,	value: this.options.value
				//@property {Number} fillValue
			,	fillValue: fill_value
				//@property {Number} filledBy
			,	filledBy: fill_value * 100 / max_value
				//@property {Boolean} isWritable
			,	isWritable: !!this.options.isWritable
				//@property {Array<Number>} buttons
			,	buttons: _.range(max_value)
				//@property {Boolean} showValue
			,	showValue: !!this.options.showValue
				//@property {Boolean} showRatingCount
			,	showRatingCount: !!this.options.showRatingCount
				//@property {Number} ratingCount
			,	ratingCount: this.options.ratingCount
				//@property {String} className
			,	className: this.options.className ? '-' + this.options.className : ''
				//@property {Boolean} ratingCountGreaterThan0
			,	ratingCountGreaterThan0: this.options.ratingCount > 0
				//@property {Boolean} hasOneReview
			,	hasOneReview: this.options.ratingCount === 1
			};
		}
	});
});
