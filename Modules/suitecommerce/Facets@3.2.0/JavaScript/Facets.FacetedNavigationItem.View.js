/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.FacetedNavigationItem.View'
,	[	'SC.Configuration'
	,	'facets_faceted_navigation_item.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'underscore'
	,	'jQuery'
	,	'Bootstrap.Slider'
	]
,	function(
		Configuration
	,	facets_faceted_navigation_item_tpl

	,	Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class Facets.FacetedNavigationItem.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_faceted_navigation_item_tpl

	,	events: {
			'click [data-action="see-more"]': 'toggleSeeMoreLess'
		,	'slide div[data-toggle="slider"]': 'updateRangeValues'
		,	'stop div[data-toggle="slider"]': 'updateRangeSelection'
		}

	,	initialize: function ()
		{
			this.facetId = this.model.get('url') || this.model.get('id');
			this.facet_config = this.options.translator.getFacetConfig(this.facetId);

			//this values is configured in the Configuration File (SCA.Shopping.Configuration)
			if (this.facet_config.template)
			{
				this.template = this.facet_config.template;
			}
			this.on('afterViewRender', this.renderFacets, this);
		}

		//@method renderFacets
	,	renderFacets: function ()
		{
			this.sliders = this.$('[data-toggle="slider"]').slider();
			this.$('[data-collapsed="true"]').hide();
		}

	,	destroy: function()
		{
			if(this.sliders.data('slider'))
			{
				this.sliders.data('slider').stopListen();
			}

			Backbone.View.prototype.destroy.apply(this, arguments);
		}

	,	toggleSeeMoreLess: function(event)
		{
			var target = jQuery(event.currentTarget)
			,	target_see_more = target.find('[data-type="see-more"]')
			,	target_see_less = target.find('[data-type="see-less"]')
			,	target_was_expanded = !!target.data('collapsed');

			if (target_was_expanded)
			{
				target_see_more.show();
				target_see_less.hide();
			}
			else
			{
				target_see_more.hide();
				target_see_less.show();
			}

			target.data('collapsed', !target_was_expanded);
		}

		// @method updateRangeValues
		// Talks to the Bootstrap.Slider.js
		// Displays the numbers under the slider while you are slider
	,	updateRangeValues: function (e, slider)
		{
			var parser = this.options.translator.getFacetConfig(this.facetId).parser
			,	start = _.isFunction(parser) ? parser(slider.values.low, true) : slider.values.low
			,	end = _.isFunction(parser) ? parser(slider.values.high, false) : slider.values.high;

			this.$el
				.find('span[data-range-indicator="start"]').html(start).end()
				.find('span[data-range-indicator="end"]').html(end);
		}

		// @method updateRangeSelection
		// Talks to the Bootstrap.Slider.js
		// Once the user releases the Slider controller this takes care of
		// generating a new url and of navigating to it
	,	updateRangeSelection: function (e, slider)
		{
			var translator = this.options.translator
				// the currently selected slider values
			,	slider_values = slider.values
				// currently selected values for that facet
			,	facet_values = translator.getFacetValue(this.facetId)
				// available values for that facet
			,	values = _.map(this.model.get('values'), function (item) {
					return parseFloat(item.url);
				});

			// if the low selected value equals the minimum available value
			// and the high selected value equals the maximum available value
			if (_.min(values) === slider_values.low && _.max(values) === slider_values.high)
			{
				// then we remove the facet from the selection
				Backbone.history.navigate(translator.cloneWithoutFacetId(this.facetId).getUrl(), {trigger: true});
			}
			// else, if there are not values selected OR
			// the selected from value is different than the slider low value OR
			// the selected to value is different than the slider high value
			else if (!facet_values || parseFloat(facet_values.from) !== slider_values.low || parseFloat(facet_values.to) !== slider_values.high)
			{
				// then we navigate to that page
				Backbone.history.navigate(translator.cloneForFacetId(this.facetId, {
					from: slider_values.low.toFixed(2)
				,	to: slider_values.high.toFixed(2)
				}).getUrl(), {trigger: true});
			}
		}

		// @method getContext @return {Facets.FacetedNavigationItem.View.Context}
	,	getContext: function ()
		{
			var facet_id = this.facetId
			,	translator = this.options.translator
			,	facet_config = this.facet_config
			,	values = []
			,	range_min = 0
			,	range_max = 0
			,	range_from = 0
			,	range_from_label = ''
			,	range_to = 0
			,	range_to_label = ''
			,	range_values = []
			,	max_items
			,	display_values
			,	extra_values = []
			,	show_facet
			,	show_remove_link
			// fixes the selected items
			,	selected_values = this.options.translator.getFacetValue(facet_id) || [];

			selected_values = _.isArray(selected_values) ? selected_values : [selected_values];
			show_remove_link = !!selected_values.length;

			// Prepears the values for display
			var original_values = _.isArray(this.model.get('values')) ? this.model.get('values') : [this.model.get('values')];

			if (facet_config.behavior !== 'range')
			{
				_.each(original_values, function(value)
				{
					if (value.url !== '')
					{
						value.isActive = _.contains(selected_values, value.url);
						value.link = translator.cloneForFacetId(facet_id, value.url).getUrl();
						value.displayName = value.label || decodeURIComponent(value.url) || _('(none)').translate();
						value.color = '';
						value.isColorTile = false;
						value.image = {};
						value.isImageTile = false;

						if (facet_config.colors)
						{
							value.color = facet_config.colors[value.label] || facet_config.colors.defaultColor;
							if (_.isObject(value.color))
							{
								value.image = value.color;
								value.color = '';
								value.isImageTile = true;
							}
							else
							{
								value.isColorTile = true;
							}
						}

						values.push(value);
					}
				});

				max_items = facet_config.max || values.length;
				display_values = _.first(values, max_items);
				_(display_values).each(function(value)
				{
					value.isLightColor = _.contains(Configuration.get('layout.lightColors', []), value.label);
				});
				extra_values = _.rest(values, max_items);
				show_facet = !!values.length;
			}
			else //if (facet_config.behavior === 'range')
			{
				range_values = _.map(original_values, function (item) {
					return parseFloat(item.url);
				});

				range_min = _.min(range_values);
				range_max = _.max(range_values);

				show_facet = range_max > range_min;
				show_remove_link = this.model.get('max') !== range_max || this.model.get('min') !== range_min;

				var translator_value = translator.getFacetValue(facet_id) || {from: range_min, to: range_max};
				range_from = translator_value.from;
				range_to = translator_value.to;

				range_to_label = _.isFunction(facet_config.parser) ? facet_config.parser(range_to, false) : range_to;
				range_from_label = _.isFunction(facet_config.parser) ? facet_config.parser(range_from, false) : range_from;
			}

			// @class Facets.FacetedNavigationItem.View.Context
			var context = {
				//@property {String} htmlId
				htmlId: _.uniqueId('facetList_')
				//@property {String} facetId
			,	facetId: facet_id
				//@property {Boolean} showFacet
			,	showFacet: show_facet
				//@property {Boolean} showHeading
			,	showHeading: _.isBoolean(facet_config.showHeading) ? facet_config.showHeading : true
				//@property {Boolean} isUncollapsible
			,	isUncollapsible: !!facet_config.uncollapsible
				//@property {Boolean} isCollapsed
			,	isCollapsed: !this.facet_config.uncollapsible && this.facet_config.collapsed
				//@property {Boolean} isMultiSelect
			,	isMultiSelect: facet_config.behavior === 'multi'
				//@property {Boolean} showRemoveLink
			,	showRemoveLink: show_remove_link
				//@property {String} removeLink
			,	removeLink: translator.cloneWithoutFacetId(facet_id).getUrl()
				//@property {String} facetDisplayName
			,	facetDisplayName: facet_config.name || facet_id
				//@property {Array<Object>} values
			,	values: values
				//@property {Array<Object>} displayValues
			,	displayValues: display_values
				//@property {Array<Object>} extraValues
			,	extraValues: extra_values
				//@property {Boolean} showExtraValues
			,	showExtraValues: !!extra_values.length
				//@property {Boolean} isRange
			,	isRange: facet_config.behavior === 'range'
				//@property {Array<Number>} rangeValues
			,	rangeValues: range_values
				//@property {Number} rangeMin
			,	rangeMin: range_min
				//@property {Number} rangeMax
			,	rangeMax: range_max
				//@property {Number} rangeFrom
			,	rangeFrom: range_from
				//@property {String} rangeFromLabel
			,	rangeFromLabel: range_from_label
				//@property {Number} rangeTo
			,	rangeTo: range_to
				//@property {String} rangeToLabel
			,	rangeToLabel: range_to_label
			};

			// @class Facets.FacetedNavigationItem.View
			return context;
		}
	});
});