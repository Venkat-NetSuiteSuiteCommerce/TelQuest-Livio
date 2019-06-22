/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ItemRelations
define('ItemRelations.Related.Collection'
,	[	'SC.Configuration'
	,	'Item.Collection'

	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration
	,	ItemCollection

	,	_
	)
{
	'use strict';


	//@class ItemRelations.Related.Collection @extends Item.Collection
	return ItemCollection.extend({

		initialize: function (options)
		{
			this.searchApiMasterOptions = Configuration.searchApiMasterOptions.relatedItems;
			this.itemsIds = _.isArray(options.itemsIds) ? _.sortBy(options.itemsIds, function (id) {return id;}) : [options.itemsIds];
		}


		//@method fetchItems @return {jQuery.Deferred}
	,	fetchItems: function ()
		{
			return this.fetch({data:{id: this.itemsIds.join(',')}});
		}

	,	parse: function (response)
		{
			var original_items = _.compact(response.items);

			if (original_items.length === 0)
			{
				return []; // No items. Return an empty array, nothing else to do here.
			}

			if (original_items.length === 1)
			{
				return original_items[0].relateditems_detail; // Same order is preserved.
			}

			// This is to avoid repeated related items among different items. (Cart page)
			var self = this
			,	items = {};

			_.each(_.pluck(original_items, 'relateditems_detail'), function (related_items)
			{
				_.each(related_items, function (related_item)
				{
					if (!_.contains(self.itemsIds, related_item.internalid) && !items[related_item.internalid])
					{
						items[related_item.internalid] = related_item;
					}
				});
			});

			return _.toArray(items);
		}
	});
});