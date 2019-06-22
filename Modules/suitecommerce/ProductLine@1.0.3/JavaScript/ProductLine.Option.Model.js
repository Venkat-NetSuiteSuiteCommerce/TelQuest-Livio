/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ProductLine
define('ProductLine.Option.Model'
,	[
		'Backbone'
	]
,	function
	(
		Backbone
	)
{
	'use strict';

	//@class ProductLine.Option.Model Base model class used to manage the common parts of Product, Item and Transaction.Line options
	//@extend Backbone.Model
	return Backbone.Model.extend({

		//@method toJSON Override default method to send just the require data to the back-end
		//@return {ProductLine.Option.Model.JSON}
		toJSON: function toJSON ()
		{
			//@class ProductLine.Option.Model.JSON
			return {
				//@property {String} cartOptionId
				cartOptionId: this.get('cartOptionId')
				//@property {String} itemOptionId
			,	itemOptionId: this.get('itemOptionId')
				//@property {String} label
			,	label: this.get('label')
				//@property {String} type
			,	type: this.get('type')
				//@property {ProductLine.Option.Value?} value
			,	value: this.get('value')
			};
			//@class ProductLine.Option.Model
		}
	});
});

//@class ProductLine.Option.Value
//@property {String} internalid
//@property {String} value
