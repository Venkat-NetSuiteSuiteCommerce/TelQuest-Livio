/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductLine
define(
	'ProductLine.Common'
,	[
		'ProductLine.Common.Url'
	, 	'ProductLine.Common.Image'
	,	'SC.Configuration'
	,	'underscore'
	]
,	function(
		ProductLineCommonUrl
	,	ProductLineCommonImage
	,	Configuration
	,	_
	)
{
	'use strict';

	// @class ProductLine.Common
	var ProductLineCommon = {

		//@method getSku Gets the SKU for the current line or product based on the current item
		//@return {String}
		getSku: function getSku ()
		{
			return this.getItem().getSku();
		}

		// @method getOption
		// Returns an item option
		// @param {String} cart_option_id
		// @return {Item.Option.Model}
	,	getOption: function getOption (cart_option_id)
		{
			return this.get('options').findWhere({cartOptionId: cart_option_id});
		}
		//@method getVisibleOptions If the property ItemOptions.showOnlyTheListedOptions is true return only the
		//transactions item options and transaction column fields models configured in the property ItemOptions.optionsConfiguration,
		//otherwise return all of them. The array is going to be ordered by "index"
		//@return {Array<Product.Model|Transaction.Line.Model>}
	,	getVisibleOptions: function getVisibleOptions()
		{
			var collection;
			if(Configuration.get('ItemOptions.showOnlyTheListedOptions'))
			{
				collection = this.get('options')
					.filter(function(option)
					{
						return _.find(Configuration.get('ItemOptions.optionsConfiguration'), function(optionConfiguration)
							{									
								return optionConfiguration.cartOptionId === option.get('cartOptionId');
							});
					});
			}
			else
			{
				collection = this.get('options').models;
			}

			return _.sortBy(collection, function(option){return option.get('index');});

		}
		//@method extendOptionsFromItem Extend the options in the product or line passed in based on the option from the item.
		//Notice that is the item who read from the configuration
		//@param {Item.Model} item
		//@param {Product.Model|Transaction.Line.Model} productline
		//@return {void}
	,	extendOptionsFromItem: function extendOptionsFromItem (item, productline)
		{
			// Here we make sure that the options collection of the line always
			// (event when the line is loaded from an already created transaction via SuiteScript) have all the properties
			item.get('options').each(function (item_option)
			{
				//IMPORTANT: The comparison here is done in lowercase because both the LiveOrder.Model and the Transaction.Model in
				// the back-end send their option in lower case. However the search API returns some option (Gift certificate ones) in
				// Uppercase and this case is require to be preserved so the Commerce API actually add the item into the cart.
				var item_option_cartId = item_option.get('cartOptionId').toLowerCase()
				,	productline_option = productline.get('options').find(function (product_option)
					{
						return product_option.get('cartOptionId').toLowerCase() === item_option_cartId;
					});

				if (productline_option)
				{
					productline_option.attributes = _.extend({}, productline_option.attributes, item_option.attributes);
				}
			});

		}

		//@method toJSON Override default method to send only require data to the back-end
		//@return {Transaction.Line.Model.JSON}
	,	toJSON: function toJSON ()
		{
			//@class Transaction.Line.Model.JSON Class used to send a transaction line representation to the back-end
			//without sending all the heavy weight JSON that is not totally needed by the back-end
			return {
				//@property {Transaction.Line.Model.JSON.Item} item
				//@class Transaction.Line.Model.JSON.Item
				item: {
					//@property {String} internalid
					internalid: this.getItemId()
					//@property {String} type
				,	type: this.attributes.item.get('itemtype')
				}
				//@class Transaction.Line.Model.JSON
				//@property {Number} quantity
			,	quantity: this.attributes.quantity
				//@property {String} internalid
			,	internalid: this.attributes.internalid
				//@property {Array<ProductLine.Option.Model.JSON>} options
			,	options: this.get('options').toJSON()
				//@property {Number} shipaddress
			,	shipaddress: this.attributes.shipaddress
				//@property {Number} shipmethod
			,	shipmethod: this.attributes.shipmethod
				//@property {Object} location
			,	location: this.attributes.location && this.attributes.location.attributes && this.attributes.location.attributes.internalid || ''
				//@property {Object} fulfillmentChoice
			,	fulfillmentChoice: this.attributes.fulfillmentChoice || 'ship'
			};
			//@class Transaction.Line.Model
		}

	};

	return _.extend(ProductLineCommon, ProductLineCommonUrl, ProductLineCommonImage);
});