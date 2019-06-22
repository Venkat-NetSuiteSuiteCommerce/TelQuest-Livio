/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuickAdd
define('QuickAdd.ItemsSearcher.Plugins'
,	[
		'Item.Model'
	,	'Product.Model'
	,	'Product.Collection'

	,	'underscore'
	]
,	function (
		ItemModel
	,	ProductModel
	,	ProductCollection

	,	_
	)
{
	'use strict';

	//@class QuickAdd.ItemsSearcher.Plugins
	return {
		//@property {QuickAdd.ItemsSearcher.Pluguns.flatItemsMatrixResult} flatItemsMatrixResult
		//@class QuickAdd.ItemsSearcher.Pluguns.flatItemsMatrixResult @extend Plugin
		flatItemsMatrixResult: {
			name: 'flatItemsMatrixResult'
		,	priotity: 10
			//@method execute
			//@param {ItemsSearcher.Collection} collection
			//@param {ItemsSearcher.View.Options} configuration
			//@return {ItemsSearcher.Collection}
		,	execute: function (collection, configuration)
			{
				//Current item that is begin processed
				var products = []
				//Variable that contains the new product created from all parent matrix items to generated one items per child
				//We do this to flat the list of items in the collection
				,	new_product
				//List of option for the current child item
				,	item_options
				//Counter used to emulate the ids of the new products. This is required so the ItemSearcher can identify selected products in the result list
				,	internalid_counter = 1;
				collection.each(function (item)
				{
					if(item.get('isinstock') || (item.get('isbackorderable') || configuration.showBackorderables))
					{
						if (item.get('_matrixChilds') && item.get('_matrixChilds').length)
						{
							item_options = item.get('options').where({isMatrixDimension:true});

							item.get('_matrixChilds').each(function (child_item)
							{
								new_product = new ProductModel({
									item: new ItemModel(_.extend({}, item.attributes))
								});

								_.each(item_options, function (option)
								{
									var selected_child_item_option_label = child_item.get(option.get('itemOptionId'))
									,	selected_option_value_object = _.findWhere(option.get('values'), {label: selected_child_item_option_label});

									new_product.setOption(option.get('cartOptionId'), selected_option_value_object.internalid);
								});

								//Give than the behavior to extract thumbnail images is based on the current selected item (thought for lines)
								//we provide all children with the image object
								new_product.getItem().set('itemimages_detail', item.get('itemimages_detail'));

								new_product.set('isfulfillable', item.get('isfulfillable'));
								new_product.set('internalid', internalid_counter++);

								products.push(new_product);
							});
						}
						else
						{
							products.push(new ProductModel({
									item: item
								,	internalid: internalid_counter++
								})
							);
						}
					}
				});

				products = _.filter(products, function (product)
				{
					var query_on_sku = (product.getSku() ? product.getSku().toUpperCase() : '').indexOf(configuration.query.toUpperCase()) >= 0
					,	query_on_name = (product.get('item').get('_name') ? product.get('item').get('_name').toUpperCase() : '').indexOf(configuration.query.toUpperCase()) >= 0
					,	item_not_gift_certificate = product.get('item').get('itemtype') !== 'GiftCert';

					return item_not_gift_certificate && (query_on_name || query_on_sku);
				});

				return new ProductCollection(_.first(products, configuration.limit));
			}
		}
		//@class QuickAdd.ItemsSearcher.Plugins
	};
});