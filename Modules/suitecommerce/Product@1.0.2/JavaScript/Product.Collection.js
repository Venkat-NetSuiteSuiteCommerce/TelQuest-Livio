/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Product
define('Product.Collection'
,	[	'Product.Model'

	,	'Backbone'
	]
,	function (
		ProductModel

	,	Backbone
	)
{
	'use strict';

	// @class Product.Collection @extends Backbone.Collection
	return Backbone.Collection.extend({
		// @property {Product.Model} model
		model: ProductModel
	});
});