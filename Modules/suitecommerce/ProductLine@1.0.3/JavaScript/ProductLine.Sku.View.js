/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductLine
define(
	'ProductLine.Sku.View'
,	[
		'product_line_sku.tpl'

	,	'Backbone'
	]
,	function (
		product_line_sku_tpl

	,	Backbone
	)
{
	'use strict';

	// @class ProductLine.Sku.View @extends Backbone.View
	return Backbone.View.extend(
	{
		//@property {Function} template
		template: product_line_sku_tpl

		//@method initialize Override default method to attach model's change event to re-render
		//@param {ProductLine.Sku.View.Initialize.options} options
		//@return {Void}
	,	initialize: function ()
		{
			this.model.on('change', this.render, this);
		}

		//@method destroy Override default method to detach from model's change event
		//@return {Void}
	,	destroy: function destroy ()
		{
			Backbone.View.prototype.destroy.apply(this, arguments);
			this.model.off('change', this.render, this);
		}

		// @method getContext
		// @returns {ProductLine.Sku.View.Context}
	,	getContext: function ()
		{
			//@class ProductLine.Sku.View.Context
			return {
				//@property {Product.Model|Transaction.Line.Model|Item.Model} model
				model: this.model
				//@property {String} sku
			,	sku : this.model.getSku()
			};
			//@class ProductLine.Sku.View
		}
	});

});

//@class ProductLine.Sku.View.Initialize.options
//@property {Transaction.Line.Model|Item.Model|Product.Model} model
