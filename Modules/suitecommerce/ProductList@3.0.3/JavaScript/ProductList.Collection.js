/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.Collection'
,	[	'ProductList.Model'

	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		ProductListModel

	,	_
	,	Backbone
	)
{
	'use strict';

	// @class ProductList.Collection @extends Backbone.Collection
	return Backbone.Collection.extend({

		url: _.getAbsoluteUrl('services/ProductList.Service.ss')

	,	model: ProductListModel

		// Filter based on the iterator and return a collection of the same type
	,	filtered: function(iterator)
		{
			return new this.constructor(this.filter(iterator));
		}
	});
});