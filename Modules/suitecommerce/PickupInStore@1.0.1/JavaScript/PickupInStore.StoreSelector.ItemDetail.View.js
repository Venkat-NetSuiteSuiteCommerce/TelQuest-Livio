/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module PickupInStore
define('PickupInStore.StoreSelector.ItemDetail.View'
,	[
		'Transaction.Line.Views.Options.Selected.View'
	,	'Transaction.Line.Views.Price.View'
	,	'ProductLine.Sku.View'

	,	'Backbone.CollectionView'
	,	'Backbone.CompositeView'

	,	'pickup_in_store_store_selector_item_detail.tpl'

	,	'Backbone'
	]
,	function (
		TransactionLineViewsOptionsSelectedView
	,	TransactionLineViewsPriceView
	,	ProductLineSkuView

	,	BackboneCollectionView
	,	BackboneCompositeView

	,	transaction_line_views_cell_navigable_tpl

	,	Backbone
	)
{
	'use strict';

	//@class PickupInStore.StoreSelector.ItemDetail.View @extend Backbone.View
	return Backbone.View.extend({
		// @property {Function} template
		template: transaction_line_views_cell_navigable_tpl

		// @method initialize
		// @param {PickupInStore.StoreSelector.ItemDetail.View.InitializeParameters} options
	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.model = options.model;

			BackboneCompositeView.add(this);
		}

		// @property {ChildViews} childViews
	,	childViews: {
			'Item.Price': function ()
			{
				return new TransactionLineViewsPriceView({
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
		//@return {PickupInStore.StoreSelector.ItemDetail.View.Context}
	,	getContext: function ()
		{
			var item = this.model.get('item');

			//@class PickupInStore.StoreSelector.ItemDetail.View.Context
			return {
				//@property {String} itemName
				itemName: item.get('_name')
				// @property {ImageContainer} thumbnail
			,	thumbnail: this.model.getThumbnail()
			};
		}

	});
});
