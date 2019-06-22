/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
// ProductList.Item.Collection.js
// -----------------------
// Product List collection
define('ProductList.Item.Collection'
,	[	'ProductList.Item.Model'
	,	'Product.Collection'

	,	'underscore'
	,	'Utils'
	]
,	function (
		ProductListItemModel
	,	ProductCollection

	,	_
	)
{
	'use strict';

	// @class ProductList.Item.Collection @extends Product.Collection
	return ProductCollection.extend({

		model: ProductListItemModel

	,	url: _.getAbsoluteUrl('services/ProductList.Item.Service.ss')

	,	initialize: function (options)
		{
			ProductCollection.prototype.initialize.apply(this, arguments);
			this.options = options;
		}

		// @method update custom method called by ListHeader view it receives the currently applied filter, currently applied sort and currently applied order
	,	update: function (options)
		{
			this.fetch({
				data: {
					productlistid: this.productListId
				,	internalid: null
				,	sort: options.sort.value
				,	order: options.order
				,	page: options.page
				}
			,	reset: true
			,	killerId: options.killerId
			});
		}
	});
});