/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Receipt
define('Receipt.Details.Item.Summary.View'
,	[	'receipt_details_item_summary.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		receipt_details_tiem_summary_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class Receipt.Details.Item.Summary.View @extend Backbone.View
	return Backbone.View.extend({

		template: receipt_details_tiem_summary_tpl

		//@method getContext @return Receipt.Details.Item.Summary.View.Context
	,	getContext: function ()
		{
			var line = this.model;

			//@class Receipt.Details.Item.Summary.View.Context
			return {
				//@property {Model} line
				line: line
				//@property {Boolean} isDiscount
			,	isDiscountType: line.get('type') === 'Discount'
				//@property {Number} quantity
			,	quantity: line.get('quantity') || 0
				//@property {Boolean} showAmount
			,	showAmount: !!line.get('amount_formatted')
				//@property {String} amountFormatted
			,	amountFormatted: _.formatCurrency(line.get('amount_formatted'))
				//@property {String} totalFormatted
			,	totalFormatted: _.formatCurrency(line.get('total'))
				//@property {Boolean} hasDiscount
			,	hasDiscount: !!line.get('discount')
				//@property {Boolean} showAmountLabel
			,	showAmountLabel: !!line.get('amount_label')
			};
		}
	});

});