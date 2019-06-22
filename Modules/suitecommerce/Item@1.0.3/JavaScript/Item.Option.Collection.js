/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Item
define('Item.Option.Collection'
,	[
		'Item.Option.Model'

	,	'ProductLine.Option.Collection'
	]
,	function (
		ItemOptionModel

	,	ProductLineOptionCollection
	)
{
	'use strict';

	//@class Item.Option.Collection @extend ProductLine.Option.Collection
	return ProductLineOptionCollection.extend({
		//@property {Item.Option.Model} model
		model: ItemOptionModel
	});
});