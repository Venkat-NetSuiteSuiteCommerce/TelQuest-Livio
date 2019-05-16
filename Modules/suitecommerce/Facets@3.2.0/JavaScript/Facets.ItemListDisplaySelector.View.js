/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define(
	'Facets.ItemListDisplaySelector.View'
,	[		
		'facets_item_list_display_selector.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function(
		facets_item_list_display_selector_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Facets.ItemListDisplaySelector.View @extends Backbone.View
	return Backbone.View.extend({

		template: facets_item_list_display_selector_tpl

		// @method getContext @returns {Facets.ItemListDisplaySelector.View.Context}
	,	getContext: function ()
		{
			var option_items = this.options.options
			,	translator = this.options.translator
			,	processed_option_items = [];

			_.each(option_items, function(option_item) {
				var processed_option_item = {
					configOptionUrl: translator.cloneForOption('display', option_item.id).getUrl()
				,	isActive: translator.getOptionValue('display') === option_item.id
				,	isGrid: option_item.id === 'grid'
				,	name: option_item.name
				,	icon: option_item.icon
				};

				processed_option_items.push(processed_option_item);
			});

			// @class Facets.ItemListDisplaySelector.View.Context
			return {
				// @property {String} configClasses				
				configClasses: this.options.configClasses

				// @property {Array} options
			,	options: processed_option_items
			};
			// @class Facets.ItemListDisplaySelector.View
		}
	});
});