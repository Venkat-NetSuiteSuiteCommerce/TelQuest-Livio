/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Item
define('Item.Option.Model'
,	[
		'ProductLine.Option.Model'
	]
,	function (
		ProductLineOptionModel
	)
{

	'use strict';

	//@class Item.Option.Model @extend ProductLine.Option.Model
	return ProductLineOptionModel.extend({
	});
});
