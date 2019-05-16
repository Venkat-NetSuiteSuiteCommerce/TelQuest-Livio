/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
// @class ProductListItem
// Handles creating, fetching and updating Product List Items @extends SCModel
define(
	'ProductList.Item.Model'
,	[
		'SC.Model'
	,	'SC.Models.Init'
	,	'Application'
	,	'Utils'
	,	'ProductList.Model'
	,	'ProductList.Item.Search'
	,	'Configuration'

	,	'underscore'
	]
,	function (
			SCModel
		,	ModelsInit
		,	Application
		,	Utils
		,	ProductList
		,	Search
		,	Configuration

		,	_)
{
	'use strict';
	return SCModel.extend({

		name: 'ProductList.Item'

		// @property {Configuration.ProductList} configuration General settings
	,	configuration: Configuration.productList

		// @method verifySession @throws {unauthorizedError}it if the user has not the appropriate session for accessing product lists.
	,	verifySession: function()
		{
			if (this.configuration.loginRequired && !ModelsInit.session.isLoggedIn2())
			{
				throw unauthorizedError;
			}
		}

		// Returns a product list item based on a given id
	,	get: function (user, id)
		{
			this.verifySession();

			var filters = [
					new nlobjSearchFilter('internalid', null, 'is', id)
				,	new nlobjSearchFilter('isinactive', null, 'is', 'F')
				,	new nlobjSearchFilter('custrecord_ns_pl_pl_owner', 'custrecord_ns_pl_pli_productlist', 'is', user)
				]
			,	sort_column = 'custrecord_ns_pl_pli_item'
			,	sort_direction = 'ASC'
			,	productlist_items = Search.searchHelper(filters, sort_column, sort_direction, true);

			if (productlist_items.length >= 1)
			{
				return productlist_items[0];
			}
			else
			{
				throw notFoundError;
			}
		}

	,	delete: function (user, id)
		{
			this.verifySession();

			var product_list_item = nlapiLoadRecord('customrecord_ns_pl_productlistitem', id)
			,	parent_product_list = ProductList.get(user, product_list_item.getFieldValue('custrecord_ns_pl_pli_productlist'));

			if (parseInt(parent_product_list.owner.id, 10) !== user)
			{
				throw unauthorizedError;
			}

			product_list_item.setFieldValue('isinactive', 'T');

			return nlapiSubmitRecord(product_list_item);
		}

		// Sanitize html input
	,	sanitize: function (text)
		{
			return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
		}

	,	parseLineOptionsToProductList: function (options_array)
		{
			// option.value comes undefined in the case of
			// optional transaction item options that do not have a value
			var result = {};
			_.each(options_array, function (option)
			{
				result[option.cartOptionId] = {
					value: option.value && option.value.internalid
				,	displayvalue: option.value && option.value.label
				,	itemOptionId: option.itemOptionId
				,	label: option.label
				,	type: option.type
				,	values: option.values
				};
			});

			return result;
		}

		// Creates a new Product List Item record
	,	create: function (user, data)
		{
			this.verifySession();

			if (!(data.productList && data.productList.id))
			{
				throw notFoundError;
			}

			var parent_product_list = ProductList.get(user, data.productList.id);

			if (parseInt(parent_product_list.owner.id, 10) !== user)
			{
				throw unauthorizedError;
			}

			var productListItem = nlapiCreateRecord('customrecord_ns_pl_productlistitem');

			data.description && productListItem.setFieldValue('custrecord_ns_pl_pli_description', this.sanitize(data.description));

			if (data.options)
			{
				data.options && productListItem.setFieldValue('custrecord_ns_pl_pli_options', JSON.stringify(this.parseLineOptionsToProductList(data.options || {})));
			}

			data.quantity && productListItem.setFieldValue('custrecord_ns_pl_pli_quantity', data.quantity);
			data.item && data.item.internalid && productListItem.setFieldValue('custrecord_ns_pl_pli_item', data.item.internalid);
			data.priority && data.priority.id && productListItem.setFieldValue('custrecord_ns_pl_pli_priority', data.priority.id);
			productListItem.setFieldValue('custrecord_ns_pl_pli_productlist', data.productList.id);

			data.internalid = nlapiSubmitRecord(productListItem);

			return data;
		}

		// Updates a given Product List Item given its id
	,	update: function (user, id, data)
		{
			this.verifySession();

			var product_list_item = nlapiLoadRecord('customrecord_ns_pl_productlistitem', id)
			,	parent_product_list = ProductList.get(user, product_list_item.getFieldValue('custrecord_ns_pl_pli_productlist'));

			if (parseInt(parent_product_list.owner.id, 10) !== user)
			{
				throw unauthorizedError;
			}

			product_list_item.setFieldValue('custrecord_ns_pl_pli_description', this.sanitize(data.description));
			data.options && product_list_item.setFieldValue('custrecord_ns_pl_pli_options', JSON.stringify(this.parseLineOptionsToProductList(data.options || {})));
			data.quantity && product_list_item.setFieldValue('custrecord_ns_pl_pli_quantity', data.quantity);

			data.item && (data.item.id || data.item.internalid) && product_list_item.setFieldValue('custrecord_ns_pl_pli_item', (data.item.id || data.item.internalid));

			if (data.priority)
			{
				if (_.isObject(data.priority))
				{
					data.priority.id && product_list_item.setFieldValue('custrecord_ns_pl_pli_priority', data.priority.id);
				}
				else
				{
					product_list_item.setFieldValue('custrecord_ns_pl_pli_priority', data.priority);
				}
			}

			data.productList && data.productList.id && product_list_item.setFieldValue('custrecord_ns_pl_pli_productlist', data.productList.id);

			nlapiSubmitRecord(product_list_item);
		}

		// Retrieves all Product List Items related to the given Product List Id
	,	search: function (user, product_list_id, include_store_item, sort_and_paging_data)
		{
			this.verifySession();
			return Search.search(user, product_list_id, include_store_item, sort_and_paging_data);
		}

	});
});