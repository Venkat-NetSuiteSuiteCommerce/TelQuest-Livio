/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.BulkActions.View'
	,	[
			'product_list_bulk_actions.tpl'

		,	'Backbone'
		]
	,	function(
			product_list_bulk_actions_tpl

		,	Backbone
		)
{
	'use strict';

	// @class ProductList.BulkActions.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_bulk_actions_tpl

		// @method getContext @return ProductList.BulkActions.View.Context
	,	getContext: function()
		{
			var model = this.options.model
			,	isAtLeastOneItemChecked = model.someCheckedItemsExist();
			return {
				// @property {Boolean} isAtLeastOneItemChecked
				isAtLeastOneItemChecked: isAtLeastOneItemChecked
				// @property {Boolean} hasItems
			,	hasItems: model.get('items').length
				// @property {Boolean} isAddToCartEnabled
			,	isAddToCartEnabled: isAtLeastOneItemChecked && model.canBeAddedToCart(true)
				// @property {Boolean} isTypePredefined
			,	isTypePredefined: model.get('typeName') === 'predefined'
			};
		}
	});
});