/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.ItemListShowSelector.View'
,	[
		'facets_item_list_show_selector.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		facets_item_list_show_selector_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Facets.ItemListShowSelector.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_item_list_show_selector_tpl

		// @method getContext @returns {Facets.ItemListShowSelector.View.Context}
	,	getContext: function ()
		{
			var option_items = this.options.options
			,	translator = this.options.translator
			,	processed_option_items = [];

			_.each(option_items, function(option_item) {
				var processed_option_item = {
					configOptionUrl: translator.cloneForOptions({show: option_item.items, page: 1}).getUrl()
				,	isSelected: parseInt(translator.getOptionValue('show'), 10) === option_item.items
				,	name: _(option_item.name).translate(option_item.items)
				,	className: option_item.items
				};

				processed_option_items.push(processed_option_item);
			});

			// @class Facets.ItemListShowSelector.View.Context
			return {
				// @property {Array} options
				options: processed_option_items
			};
		}
	});
});