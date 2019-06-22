/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Product
define('Product.Option.Collection'
,	[
		'Product.Option.Model'

	,	'ProductLine.Option.Collection'
	]
,	function (
		ProductOptionModel

	,	ProductLineOptionCollection
	)
{
	'use strict';

	//@class Product.Option.Collection @extend ProductLine.Option.Collection
	return ProductLineOptionCollection.extend({

		// @property {Product.Options.Model} model
		model: ProductOptionModel
	});
});