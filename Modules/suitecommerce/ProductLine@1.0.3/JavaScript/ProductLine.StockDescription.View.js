/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductLine
define(
	'ProductLine.StockDescription.View'
,	[
		'product_line_stock_description.tpl'

	,	'Backbone'
	]
,	function(
		product_line_stock_description_tpl

	,	Backbone
	)
{
	'use strict';

	// @class ProductLine.StockDescription.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_line_stock_description_tpl

		//@method initialize Override default method to attach model's change event to re-render
	,	initialize: function ()
		{
			this.model.on('change', this.render, this);
		}

		//@method getContext
		//@return {ProductLine.StockDescription.View.Context}
	,	getContext: function ()
		{
			this.stock_info = this.model.getStockInfo();

			//@class ProductLine.Stock.View.Context
			return {
				//@property {Boolean} showStockDescription
				showStockDescription: !!(this.stock_info.showStockDescription && this.stock_info.stockDescription)
				//@property {Item.Model.StockInfo} stockInfo
			,	stockInfo: this.stock_info
			};
			//@class ProductLine.StockDescription.View
		}
	});
});

//@class ProductLine.StockDescription.View.Initialize.options
