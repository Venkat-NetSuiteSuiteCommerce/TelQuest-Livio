/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('ProductList.Item.Search'
,	[
		'Application'
	,	'SC.Models.Init'
	,	'Utils'
	,	'Configuration'

	,	'underscore'
	]
,	function (
		Application
	,	ModelsInit
	,	Utils
	,	Configuration

	,	_
	)
{
	'use strict';

	var StoreItem;

	try {
		StoreItem = require('StoreItem.Model');
	}
	catch(e)
	{
	}

	return {

		configuration: Configuration.productList

	,	verifySession: function()
		{
			if (this.configuration.loginRequired && !ModelsInit.session.isLoggedIn2())
			{
				throw unauthorizedError;
			}
		}

	,	getProductName: function (item)
		{
			if (!item)
			{
				return '';
			}

			// If its a matrix child it will use the name of the parent
			if (item && item.matrix_parent && item.matrix_parent.internalid)
			{
				return item.matrix_parent.storedisplayname2 || item.matrix_parent.displayname;
			}

			// Other ways return its own name
			return item.storedisplayname2 || item.displayname;
		}

		// Retrieves all Product List Items related to the given Product List Id
	,	search: function (user, product_list_id, include_store_item, sort_and_paging_data)
		{
			this.verifySession();

			if (!product_list_id)
			{
				return []; //it may happens when target list is a template and don't have a record yet.
			}

			var filters = [
				new nlobjSearchFilter('custrecord_ns_pl_pli_productlist', null, 'is', product_list_id)
			,	new nlobjSearchFilter('isinactive', null, 'is', 'F')
			,	new nlobjSearchFilter('custrecord_ns_pl_pl_owner', 'custrecord_ns_pl_pli_productlist', 'is', user)]
			,	sort_column = sort_and_paging_data.sort
			,	sort_direction = sort_and_paging_data.order;

			if (!sort_column)
			{
				sort_column = 'created';
			}

			if (sort_column === 'priority')
			{
				sort_column = 'priority_value';
			}

			if (!sort_direction)
			{
				sort_direction = '-1';
			}

			var search_lines = this.searchHelper(filters, sort_column, sort_direction === '-1' ? 'DESC' : 'ASC', include_store_item);


			if (include_store_item && sort_column === 'price')
			{
				//-1 for descending, 1 for ascending
				search_lines = this.sortLinesByPrice(search_lines, sort_direction === '-1' ? -1 : 1);
			}

			return search_lines;
		}

		//UX expect the list to be sorted by price considering discounts and bulk pricing
		//this price is not present on data-store, so in memory rules and sorting are required.
	,	sortLinesByPrice: function (lines, sort_direction)
		{
			return _.sortBy(lines, function (line)
			{
				//defaults to price level 1
				var price_detail = line.item.onlinecustomerprice_detail || {}
				,	price = price_detail.onlinecustomerprice || line.item.pricelevel1 || 0
				,	quantity = line.quantity;

				if (quantity && price_detail.priceschedule && price_detail.priceschedule.length)
				{
					var price_schedule = _.find(price_detail.priceschedule, function(price_schedule)
					{
						return	(price_schedule.minimumquantity <= quantity && quantity < price_schedule.maximumquantity) ||
								(price_schedule.minimumquantity <= quantity && !price_schedule.maximumquantity);
					});

					price = price_schedule.price;
				}

				return price * sort_direction;
			});
		}

	,	parseLineOptionsFromProductList: function (options_object)
		{
			var result = [];
			_.each(options_object, function (value, key)
			{
				result.push({
					cartOptionId: key
				,	value: {
						internalid: value.value
					,	label: value.displayvalue
					}
					//new values
				,	itemOptionId: value.itemOptionId
				,	label: value.label
				,	type: value.type
				,	values: value.values
				});
			});

			return result;
		}

	,	searchHelper: function (filters, sort_column, sort_direction, include_store_item)
		{
			// Selects the columns
			var productListItemColumns = {
				internalid: new nlobjSearchColumn('internalid')
			,	name:  new nlobjSearchColumn('formulatext', 'custrecord_ns_pl_pli_item').setFormula('case when LENGTH({custrecord_ns_pl_pli_item.displayname}) > 0 then {custrecord_ns_pl_pli_item.displayname} else {custrecord_ns_pl_pli_item.itemid} end')
			,	sku:  new nlobjSearchColumn('formulatext', 'custrecord_ns_pl_pli_item').setFormula('{custrecord_ns_pl_pli_item.itemid}')
			,	description: new nlobjSearchColumn('custrecord_ns_pl_pli_description')
			,	options: new nlobjSearchColumn('custrecord_ns_pl_pli_options')
			,	quantity: new nlobjSearchColumn('custrecord_ns_pl_pli_quantity')
			,	price: new nlobjSearchColumn('price', 'custrecord_ns_pl_pli_item')
			,	created: new nlobjSearchColumn('created')
			,	item_id: new nlobjSearchColumn('custrecord_ns_pl_pli_item')
			,	item_type: new nlobjSearchColumn('type', 'custrecord_ns_pl_pli_item')
			,	item_matrix_parent: new nlobjSearchColumn('parent', 'custrecord_ns_pl_pli_item')
			,	priority: new nlobjSearchColumn('custrecord_ns_pl_pli_priority')
			,	priority_value: new nlobjSearchColumn('custrecord_ns_pl_plip_value', 'custrecord_ns_pl_pli_priority')
			,	lastmodified: new nlobjSearchColumn('lastmodified')
			};

			productListItemColumns[sort_column] && productListItemColumns[sort_column].setSort(sort_direction === 'DESC');

			// Makes the request and format the response
			var records = Application.getAllSearchResults('customrecord_ns_pl_productlistitem', filters, _.values(productListItemColumns))
			,	productlist_items = []
			,	self = this;

			_(records).each(function (productListItemSearchRecord)
			{
				var itemInternalId = productListItemSearchRecord.getValue('custrecord_ns_pl_pli_item')
				,	itemId = productListItemSearchRecord.getText('custrecord_ns_pl_pli_item')
				,	itemMatrixParent = productListItemSearchRecord.getValue('parent', 'custrecord_ns_pl_pli_item')
				,	created_date = nlapiStringToDate(productListItemSearchRecord.getValue('created'), window.dateformat)
				,	created_date_str = nlapiDateToString(created_date, window.dateformat)
				,	itemType = productListItemSearchRecord.getValue('type', 'custrecord_ns_pl_pli_item')
				,	productListItem = {
						internalid: productListItemSearchRecord.getId()
					,	description: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_description')
					,	options: self.parseLineOptionsFromProductList(JSON.parse(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_options') || '{}'))
					,	quantity: parseInt(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_quantity'), 10)
					,	created: productListItemSearchRecord.getValue('created')
					,	createddate: created_date_str
					,	lastmodified: productListItemSearchRecord.getValue('lastmodified')
					// we temporary store the item reference, after this loop we use StoreItem.preloadItems instead doing multiple StoreItem.get()
					,	store_item_reference: {
							id: itemInternalId
						,	internalid: itemInternalId
						,	type: itemType
						,	matrix_parent: itemMatrixParent
						,	itemid: itemId
						}
					,	priority: {
							id: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_priority')
						,	name: productListItemSearchRecord.getText('custrecord_ns_pl_pli_priority')
						}
					};
				productlist_items.push(productListItem);
			});

			var store_item_references = _(productlist_items).pluck('store_item_reference')
			,	results = [];

			// preload all the store items at once for performance
			StoreItem && StoreItem.preloadItems(store_item_references);

			_(productlist_items).each(function (productlist_item)
			{
				var store_item_reference = productlist_item.store_item_reference
				// get the item - fast because it was preloaded before. Can be null!
				,	store_item = StoreItem ? StoreItem.get(store_item_reference.id, store_item_reference.type) : store_item_reference;

				delete productlist_item.store_item_reference;

				if (!store_item)
				{
					return;
				}

				if (include_store_item || !StoreItem)
				{
					productlist_item.item = store_item;
					//Parse the internalid to number to be SearchAPI complaint
					productlist_item.item.internalid = parseInt(productlist_item.item.internalid,10);
				}
				else
				{
					// only include basic store item data - fix the name to support matrix item names.
					productlist_item.item = {
						internalid: parseInt(store_item_reference.id, 10)
					,	displayname: self.getProductName(store_item)
					,	ispurchasable: store_item.ispurchasable
					,	itemoptions_detail: store_item.itemoptions_detail
					,	minimumquantity: store_item.minimumquantity
					};
				}

				if (!include_store_item && store_item && store_item.matrix_parent)
				{
					productlist_item.item.matrix_parent = store_item.matrix_parent;
				}

				results.push(productlist_item);
			});

			return results;
		}
	};
});