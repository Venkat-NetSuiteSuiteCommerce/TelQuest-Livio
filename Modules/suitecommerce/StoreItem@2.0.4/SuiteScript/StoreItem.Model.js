/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global invalidItemsFieldsAdvancedName */
// StoreItem.js
// ----------
// Handles the fetching of items information for a collection of order items
// If you want to fetch multiple items please use preloadItems before/instead calling get() multiple times.

/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https:// groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
define(
	'StoreItem.Model'
,	[	'SC.Model'
	,	'SC.Models.Init'
	,	'underscore'
	]
,	function (
		SCModel
	,	ModelsInit

	,	_
	)
{
	'use strict';
	return SCModel.extend({
		name: 'StoreItem'

		// Returns a collection of items with the items iformation
		// the 'items' parameter is an array of objects {id,type}
		// fieldset_name allows to specify an alternative fieldset distinct
		// from the one specified in the configuration.
	,	preloadItems: function (items, fieldset_name)
		{
			var self = this
			,	items_by_id = {}
			,	parents_by_id = {}
			,	fieldKeys = SC.Configuration.fieldKeys
			,	itemsFieldsStandardKeys = fieldKeys && fieldKeys.itemsFieldsStandardKeys || [];

			if(!itemsFieldsStandardKeys.length)
			{
				return {};
			}

			items = items || [];

			this.preloadedItems = this.preloadedItems || {};

			items.forEach(function (item)
			{
				if (!item.id || !item.type || item.type === 'Discount' || item.type === 'OthCharge' || item.type === 'Markup')
				{
					return;
				}

				if (!self.getPreloadedItem(item.id, fieldset_name))
				{
					items_by_id[item.id] = {
						internalid: new String(item.id).toString()
					,	itemtype: item.type
					,	itemfields: itemsFieldsStandardKeys
					};
				}
			});

			if (!_.size(items_by_id))
			{
				return this.preloadedItems;
			}

			var items_details = this.getItemFieldValues(items_by_id, fieldset_name);

			// Generates a map by id for easy access. Notice that for disabled items the array element can be null
			_.each(items_details, function (item)
			{
				if (item && typeof item.itemid !== 'undefined')
				{
					if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
					{
						parents_by_id[item.itemoptions_detail.parentid] = {
							internalid: new String(item.itemoptions_detail.parentid).toString()
						,	itemtype: item.itemtype
						,	itemfields:itemsFieldsStandardKeys
						};
					}

					self.setPreloadedItem(item.internalid, item, fieldset_name);
				}
			});

			if (_.size(parents_by_id))
			{
				var parents_details = this.getItemFieldValues(parents_by_id, fieldset_name);

				_.each(parents_details, function (item)
				{
					if (item && typeof item.itemid !== 'undefined')
					{
						self.setPreloadedItem(item.internalid, item, fieldset_name);
					}
				});
			}

			// Adds the parent information to the child
			_.each(this.preloadedItems, function (item)
			{
				if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
				{
					item.matrix_parent = self.getPreloadedItem(item.itemoptions_detail.parentid, fieldset_name);
				}
			});

			return this.preloadedItems;
		}

	,	getItemFieldValues: function (items_by_id, fieldset_name)
		{
			var	item_ids = _.values(items_by_id)
			,	is_advanced = ModelsInit.session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED';

			// Check if we have access to fieldset
			if (is_advanced)
			{
				try
				{
					fieldset_name = _.isUndefined(fieldset_name) ? SC.Configuration.fieldKeys.itemsFieldsAdvancedName : fieldset_name;

					// SuiteCommerce Advanced website have fieldsets
					return ModelsInit.session.getItemFieldValues(fieldset_name, _.pluck(item_ids, 'internalid')).items;
				}
				catch (e)
				{
					throw invalidItemsFieldsAdvancedName;
				}
			}
			else
			{
				// Sitebuilder website version doesn't have fieldsets
				return ModelsInit.session.getItemFieldValues(item_ids);
			}
		}

		// Return the information for the given item
	,	get: function (id, type, fieldset_name)
		{
			this.preloadedItems = this.preloadedItems || {};

			if (!this.getPreloadedItem(id, fieldset_name))
			{
				this.preloadItems([{
					id: id
				,	type: type
				}]
				,	fieldset_name);
			}

			return this.getPreloadedItem(id, fieldset_name);
		}

	,	getPreloadedItem: function (id, fieldset_name)
		{
			return this.preloadedItems[this.getItemKey(id, fieldset_name)];
		}

	,	setPreloadedItem: function (id, item, fieldset_name)
		{
			this.preloadedItems[this.getItemKey(id, fieldset_name)] = item;
		}

	,	getItemKey: function (id, fieldset_name)
		{
			fieldset_name = _.isUndefined(fieldset_name) && SC.Configuration.fieldKeys ? SC.Configuration.fieldKeys.itemsFieldsAdvancedName : fieldset_name;

			return id + '#' + fieldset_name;
		}

	,	set: function (item, fieldset_name)
		{
			this.preloadedItems = this.preloadedItems || {};

			if (item.internalid)
			{
				this.setPreloadedItem(item.internalid, item, fieldset_name);
			}
		}
	});
});