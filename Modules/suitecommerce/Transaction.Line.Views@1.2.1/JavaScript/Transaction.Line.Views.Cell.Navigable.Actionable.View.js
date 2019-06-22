/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Transaction.Line.Views
define('Transaction.Line.Views.Cell.Navigable.Actionable.View'
,	[
		'Transaction.Line.Views.Options.Selected.View'
	,	'ProductLine.Sku.View'
	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'

	,	'transaction_line_views_cell_navigable_actionable.tpl'

	,	'Backbone'
	,	'Utils'
	]
,	function (
		TransactionLineViewsOptionsSelectedView
	,	ProductLineSkuView
	,	BackboneCollectionView
	,	BackboneCompositeView

	,	transaction_line_views_cell_navigable_actionable_tpl

	,	Backbone
	)
{
	'use strict';

	//@class Transaction.Line.Views.Navigable.View @extend Backbone.View
	return Backbone.View.extend({

		template: transaction_line_views_cell_navigable_actionable_tpl

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.model = options.model;

			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'Item.Options': function ()
			{
				return new TransactionLineViewsOptionsSelectedView({
					model: this.model
				});
			}
		,	'Item.Sku': function ()
			{
				return new ProductLineSkuView({
					model: this.model
				});
		}
		}

		//@method getContext
		//@return {Transaction.Line.Views.Navigable.View.Context}
	,	getContext: function ()
		{
			var item = this.model.get('item')
			,	line = this.model;

			//@class Transaction.Line.Views.Navigable.View.Context
			return {
					//@property {String} itemId
					itemId: item.get('internalid')
					//@property {String} itemName
				,	itemName: item.get('_name')
					//@property {String} cellClassName
				,	cellClassName: this.options.cellClassName
					//@property {Boolean} isNavigable
				,	isNavigable: !!this.options.navigable && !!item.get('_isPurchasable')
					//@property {String} rateFormatted
				,	rateFormatted: line.get('rate_formatted')
					//@property {Boolean} showOptions
				,	showOptions: !!(line.get('options') && line.get('options').length)
					//@property {String} itemURLAttributes
				,	itemURLAttributes: this.model.getFullLink({quantity:null,location:null,fulfillmentChoice:null})
					//@property {Number} quantity
				,	quantity: line.get('quantity')
					//@property {Boolean} showDetail2Title
				,	showDetail2Title: !!this.options.detail2Title
					//@property {String} detail2Title
				,	detail2Title: this.options.detail2Title
					//@property {String} detail2
				,	detail2: line.get(this.options.detail2)
					//@property {Boolean} showDetail3Title
				,	showDetail3Title: !!this.options.detail3Title
					//@property {String} detail3Title
				,	detail3Title: this.options.detail3Title
					//@property {String} detail3
				,	detail3: line.get(this.options.detail3)
					//@property {Boolean} showComparePrice
				,	showComparePrice: line.get('amount') > line.get('total')
					//@property {String} comparePriceFormatted
				,	comparePriceFormatted: line.get('amount_formatted')
					// @property {ImageContainer} thumbnail
				,	thumbnail: this.model.getThumbnail()
			};
			//@class Transaction.Line.Views.Navigable.View
		}
	});
});

