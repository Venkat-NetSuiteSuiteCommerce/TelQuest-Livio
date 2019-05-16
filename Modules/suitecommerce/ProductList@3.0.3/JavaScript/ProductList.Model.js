/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.Model'
,	[	'ProductList.Item.Collection'

	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		ProductListItemCollection

	,	_
	,	Backbone
	)
{
	'use strict';

	function validateLength (value, name)
	{
		var max_length = 300;

		if (value && value.length > max_length)
		{
			return _('$(0) must be at most $(1) characters').translate(name, max_length);
		}
	}

	function validateName (value, name)
	{
		if (!value)
		{
			return _('Name is required').translate();
		}

		return validateLength(value, name);
	}

	// @class ProductList.Model Model for handling Product Lists (CRUD) @extends Backbone.Model
	return Backbone.Model.extend(
	{
		urlRoot: _.getAbsoluteUrl('services/ProductList.Service.ss')

	,	defaults : {
			name: ''
		,	description: ''
		,	items : new ProductListItemCollection()
		,	scopeId: '2'
		,	scopeName: 'private'
		,	typeId: '1'
		,	typeName: 'default'
		}

	,	validation:
		{
			name: { fn: validateName }

		,	description: { fn: validateLength }
		}

		// redefine url to avoid possible cache problems from browser
	,	url: function()
		{
			var base_url = Backbone.Model.prototype.url.apply(this, arguments)
			,	url_params = { t: new Date().getTime() };

			return _.addParamsToUrl(base_url, url_params);
		}

	,	initialize: function (attributes)
		{
			this.on('change:items', function (model, items)
			{
				if (model.previous('items') instanceof ProductListItemCollection)
				{
					model.set('items', model.previous('items'), {silent: true});
					model.get('items').reset(items);
				}
				else
				{
					model.set('items', new ProductListItemCollection(items), {silent: true});
				}
			});


			this.trigger('change:items', this, attributes && attributes.items || []);
		}

		// @method checked Returns true if an item with id: pli_to_add_id and options: pli_to_add_options is already in this product list. Options could be empty. @param {String} item_to_add_id @param {Object}item_to_add_options
	,	checked: function (line)
		{
			return !!this.get('items').find(function (product_list_line)
			{
				return product_list_line.isEqual(line);
			});
		}

		// @method getOutOfStockItems Returns all the items which are out of stock.
		// @param {ProductList.Item.Collection} items_to_check
		// @returns {ProductList.Item.Collection}
	,	getOutOfStockItems: function(items_to_check)
		{
			var items = !_.isUndefined(items_to_check) ? items_to_check : this.get('items');

			return items.filter(function(product_list_item)
			{
				return !product_list_item.get('item').get('_isPurchasable');
			});
		}

		// @method getNotPurchasableItemsDueToMinimumQuantity @param {ProductList.Item.Collection} items_to_check @returns {ProductList.Item.Collection} Returns all the items which do not fulfill minimum quantity requirements.
	,	getNotPurchasableItemsDueToMinimumQuantity: function(items_to_check)
		{
			var items = !_.isUndefined(items_to_check) ? items_to_check : this.get('items');

			return items.filter(function(product_list_item)
			{
				return !product_list_item.fulfillsMinimumQuantityRequirement();
			});
		}

		// @method someCheckedItemsExist Returns true if at least one item is checked. @return{Boolean}
	,	someCheckedItemsExist: function()
		{
			return this.get('items').some(function(product_list_item)
			{
				return product_list_item.get('checked');
			});
		}

		// @method canBeAddedToCart Returns true if the the items in the product list can be added to the cart by the following conditions:
		// 1.- Items > 0
		// 2.- No out of stock items
		// 3.- No items which do not fulfill minimum quantity items
		// only_checked_items determines if we are considering only checked items.
		// @param {Boolean} only_checked_items @return {Boolean}
	,	canBeAddedToCart: function(only_checked_items)
		{
			var items = !_.isUndefined(only_checked_items) ?
				new Backbone.Collection(this.get('items').filter(function (product_list_item)
				{
					return product_list_item.get('checked');
				})) :
				this.get('items');

			return items.length && this.getOutOfStockItems(items).length === 0 && this.getNotPurchasableItemsDueToMinimumQuantity(items).length === 0;
		}

	});
});