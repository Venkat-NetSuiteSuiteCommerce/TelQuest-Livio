/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.DetailsLaterMacro.View'
	,	[
			'ProductViews.Price.View'
		,	'ProductLine.Stock.View'
		,	'ProductList.DetailsMinQuantity.View'
		,	'Backbone.CompositeView'
		,	'Backbone.CollectionView'
		,	'Transaction.Line.Views.Options.Selected.View'
		,	'ProductLine.StockDescription.View'

		,	'product_list_details_later_macro.tpl'

		,	'underscore'
		,	'Backbone'
		]
	,	function(
			ProductViewsPriceView
		,	ProductLineStockView
		,	ProductListDetailsMinQuantityView
		,	BackboneCompositeView
		,	BackboneCollectionView
		,	TransactionLineViewsOptionsSelectedView
		,	ProductLineStockDescriptionView

		,	product_list_details_later_macro_tpl

		,	_
		,	Backbone
		)
{
	'use strict';

	// @class ProductList.DetailsLaterMacro.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_details_later_macro_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

	,	childViews: {
			'ItemViews.Price': function ()
			{
				return new ProductViewsPriceView({
					model:this.model
				,	origin: 'PRODUCTLISTDETAILSLATER'
				});
			}
		,	'Item.SelectedOptions': function ()
			{
				return new TransactionLineViewsOptionsSelectedView({
					model: this.model
				});
			}
		,	'ItemViews.Stock': function ()
			{
				return new ProductLineStockView({
					model:this.model
				});
			}
		,	'ProductList.DetailsMinQuantity': function ()
			{
				return new ProductListDetailsMinQuantityView({
					model:this.model
				});
			}
		,	'StockDescription': function ()
			{
				return new ProductLineStockDescriptionView({
					model: this.model
				});
			}
		}

		// @method getContext
		// @return {ProductList.DetailsLaterMacro.View.Context}
	,	getContext: function ()
		{

			var item = this.model.get('item');

			// @class ProductList.DetailsLaterMacro.View.Context
			return {
				// @property {ProductList.Item.Model} model
				model: this.model
				// @property {Integer} quantity
			,	quantity : this.model.get('quantity')
				// @property {String} itemId
			,	itemId : item.get('internalid')
				// @property {Boolean} canBeAddedToCart
			,	canBeAddedToCart : item.get('ispurchasable') && this.model.fulfillsMinimumQuantityRequirement()
				// @property {String} itemDetailsUrl
			,	itemDetailsUrl : this.model.generateURL()
				// @property {Boolean} isGiftCertificate
			,	isGiftCertificate : item.get('itemtype') === 'GiftCert'
				// @property {Boolean} showActions
			,	showActions: !this.options.hide_actions
				// @property {ImageContainer} thumbnail
			,	thumbnail: this.model.getThumbnail()
			};
			// @class ProductList.DetailsLaterMacro.View
		}
	});
});
