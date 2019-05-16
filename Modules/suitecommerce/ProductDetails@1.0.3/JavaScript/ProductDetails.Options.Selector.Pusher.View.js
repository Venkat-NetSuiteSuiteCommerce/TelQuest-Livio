/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetails
define('ProductDetails.Options.Selector.Pusher.View'
,	[
		'product_details_options_selector_pusher.tpl'

	,	'Backbone'
	]
,	function (
		product_details_options_selector_pusher_tpl

	,	Backbone
	)
{
	'use strict';

	//@class ProductDetails.Options.Selector.Pusher.View
	return Backbone.View.extend({

			//@property {Function} template
			template: product_details_options_selector_pusher_tpl

			//@property {Function} initialize
		,	initialize: function ()
			{
				Backbone.View.prototype.initialize.apply(this, arguments);
				this.model.on('change', this.render, this);
			}
			//@method getContext
			//@return {ProductDetails.Options.Selector.View.Context}
		,	getContext: function ()
			{
				var selected_options = this.model.getSelectedOptions();

				//@class ProductDetails.Options.Selector.View.Context
				return {
						//@property {ProductModel} model
						model: this.model
						//@property {Boolean} isSelectionCompleted Indicate if at least all required options are properly set
					,	isSelectionCompleted: this.model.isSelectionComplete()
						//@property {Boolean} hasSelectedOptions Indicate if the current line has options selected
					,	hasSelectedOptions: !!selected_options.length
						//@property {Array<String>} selectedOptions List of selected values
					,	selectedOptions: selected_options
				};
				//@class ProductDetails.Options.Selector.View
			}

	});
});