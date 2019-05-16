/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ItemViews
define('Transaction.Line.Views.QuantityAmount.View'
,	[	'transaction_line_views_quantity_amount.tpl'

	,	'Backbone'
	]
,	function (
		transaction_line_views_quantity_amount_tpl

	,	Backbone
	)
{
	'use strict';

	//@class ItemViews.Item.QuantityAmount.View @extend Backbone.View
	return Backbone.View.extend({

		template: transaction_line_views_quantity_amount_tpl

		//@method getContext @return {ItemViews.Item.QuantityAmount.View.Context}
	,	getContext: function ()
		{
			//@class ItemViews.Item.QuantityAmount.View.Context
			return {
				//@property {Model} line
				line: this.model
				//@property {String} lineId
			,	lineId: this.model.get('internalid')
				//@property {Boolean} showQuantity
			,	showQuantity: this.model.get('item').get('_itemType') !== 'Discount'
				//@property {Boolean} showDiscount
			,	showDiscount: !!this.model.get('discount')
				//@property {Boolean} showAmount
			,	showAmount: !!this.model.get('amount')
			};
			//@class ItemViews.Item.QuantityAmount.View
		}
	});

});
