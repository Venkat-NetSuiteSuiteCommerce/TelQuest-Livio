/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReorderItems
define('ReorderItems.Model'
,	[	'Item.Model'
	,	'Transaction.Line.Model'
	,	'underscore'
	]
,	function (
		ItemModel
	,	TransactionLineModel
	,	_
	)
{
	'use strict';

	//@class ReorderItems.Model @extend Backbone.Model
	return TransactionLineModel.extend({

		//@property {String} urlRoot
		urlRoot: 'services/ReorderItems.Service.ss'

		//@property {Object} validation
	,	validation: {}

		//@method parse
		//@param {Object} record
		//@return {Object}
	,	parse: function parse (record)
		{
			if (record.item)
			{
				var item_options = _.filter(record.options, function (option)
				{
					return option.value !== '';
				});

				record.internalid = record.item.internalid +'|'+ JSON.stringify(item_options).replace(/"/g, '\'');
			}
			return record;
		}
	});
});
