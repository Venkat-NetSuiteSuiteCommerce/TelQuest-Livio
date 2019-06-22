/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ProductLine
define('ProductLine.Option.Collection'
,	[
		'ProductLine.Option.Model'

	,	'Backbone'
	]
,	function
	(
		ProductLineOptionModel

	,	Backbone
	)
{
	'use strict';

	//@class ProdctLine.Option.Collection Base collection class used to manage the common parts of Product, Item and Transaction.Line options
	//@extend Backbone.Collection
	return Backbone.Collection.extend({
		//@property {ProdctLine.Option.Model}
		model: ProductLineOptionModel
	});
});