/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction
define('Transaction.Line.Model'
,	[	'Item.Model'
	,	'Transaction.Line.Option.Collection'
	,	'ProductLine.Common'
	,	'SC.Configuration'

	,	'underscore'
	,	'Backbone'
	]
,	function (
		ItemModel
	,	TransactionLineOptionCollection
	,	ProductLineCommon
	,	Configuration

	,	_
	,	Backbone
	)
{
	'use strict';

	// @class Transaction.Line.Model Model for showing information about a line in the order @extends Backbone.Model
	var TransactionLineModel = Backbone.Model.extend(
		{

			//@method initialize Override default initialize method to assure the correct data structure
			//@param {Transaction.Model.Get.Line} attributes
			//@return {Void}
			initialize: function initialize (attributes)
			{
				Backbone.Model.prototype.initialize.apply(this, arguments);

				var self = this;
				this.on('change:item', function (model, item)
				{
					model.set('item', item instanceof ItemModel ? item.clone() : new ItemModel(item), {silent: true});

					var item_options = model.get('item').get('options')
					,	options = model.get('options') || item_options.toJSON();

					model.set('options', options instanceof TransactionLineOptionCollection ? options : new TransactionLineOptionCollection(options), {silent:true});

					self.extendOptionsFromItem(model.get('item'), self);

				});
				this.trigger('change:item', this, attributes && attributes.item || {});

				// Extend the model with Backbone.Validation.mixin to validate it without a View
				_.extend(this, Backbone.Validation.mixin);
			}

		,	moduleName: 'Transaction.Line.Model'

			//@method getItem Returns the current selected item. This method exists to share a common interface with the Product
			//@return {Item.Model}
		,	getItem: function getItem ()
			{
				return this.get('item');
			}

			//@method getStockInfo Get the stock information of the current item. Indicate if any stock message should be shown or not, and if the current item is valid to be purchased
			//@return {Item.StockInfo}
		,	getStockInfo: function getStockInfo ()
			{
				return this.get('item').getStockInfo();
			}

			//@method getPrice Returns the object specifying the price of the current selection
			//@return {ItemPrice}
		,	getPrice: function getPrice ()
					{
				return this.getItem().getPrice(this.get('quantity'), []);
			}

			//@method getItemId Returns the id of the current selected item. This method exists to share a common interface with the Product
			//@return {String}
		,	getItemId: function getItemId ()
			{
				return this.get('item').id;
			}

			//@method isEqual
			//@param {Transaction.Line.Model} other_line
			//@return {Boolean}
		,	isEqual: function isEqual (other_line)
			{
				return !!(other_line && this.getItemId() === other_line.getItemId() && _.isEqual(this.get('options').toJSON(), other_line.get('options').toJSON()) );
			}
		}
	,	{
			//@method createFromProduct Convert a Product.Model (ProductList.Item.Model) into a Transaction.Line.Model
			//@param {Product.Model} product
			//@return {Transaction.Line.Model}
			createFromProduct: function createFromProduct (product)
			{
				var line = new TransactionLineModel(product.toJSON())
				,	item = product.get('item')
				,	item_images_detail = item.get('itemimages_detail')
				,	is_matrix_item = !!item.get('_matrixChilds').length;

				if (_.isEqual(item_images_detail, {}) && item.get('_matrixParent').get('internalid') && item.get('_matrixParent').get('itemimages_detail'))
				{
					item_images_detail = item.get('_matrixParent').get('itemimages_detail');
				}

				line.set('item', product.getItem().clone(), {silent:true});
				line.get('item').set('itemimages_detail', item_images_detail, {silent:true});
				line.get('item').set('itemid', item.get('itemid'), {silent:true});

				line.set('minimumquantity', product.get('item').minimumquantity);
				
				if (is_matrix_item)
				{
					line.get('item').set('matrix_parent', product.get('item'));
				}
				
				var	price = product.getPrice();
				line.set('rate', price.price, {silent:true});
				line.set('rate_formatted', price.price_formatted, {silent:true});

				product.get('options').each(function (product_option)
				{
					var line_option = line.get('options').findWhere({cartOptionId: product_option.get('cartOptionId')});
					line_option.attributes = _.extend({}, product_option.attributes, line_option.attributes);
				});

				return line;
			}
		}
	);

	TransactionLineModel.prototype = _.extend(TransactionLineModel.prototype, ProductLineCommon);

	return TransactionLineModel;
});
