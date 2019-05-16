/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('Pos.ProductList.Item.View'
	,	[
			'pos_product_list_item.tpl'

		,	'Backbone'
		,	'Utils'
		]
	,	function(
			pos_product_list_item_tpl

		,	Backbone
		,	Utils
		)
{
	'use strict';

	// @class Pos.ProductList.Item.View @extends Backbone.View
	return Backbone.View.extend({

		template: pos_product_list_item_tpl

		// @method getContext @return Pos.ProductList.Item.View.Context
	,	getContext: function()
		{
			var item = this.options.item
			,	thumbnail = item.getThumbnail()
			,	itemtype = item.get('item').get('itemtype');

			return {
				// @property {Boolean} isGiftCertificate
				isGiftCertificate: itemtype === 'giftcert'
				// @property {String} url
			,	url: item.get('itemDetails').get('_url')
				// @property {String} thumbnailResized
			,	thumbnailResized: this.options.application.resizeImage(thumbnail.url, 'tinythumb')
				// @property {String} thumbnailAltImageText
			,	thumbnailAltImageText: thumbnail.altimagetext
				// @property {String} itemDetailsName
			,	itemDetailsName: item.get('itemDetails').get('_name')
				// @property {String} itemDetailsUpcCode
			,	itemDetailsUpcCode: item.get('itemDetails').get('upccode')
				// @property {Boolean} hasQuantity
			,	hasQuantity: !!item.get('quantity')
				// @property {Integer} absoluteQuantity
			,	absoluteQuantity: Math.abs(item.get('quantity'))
				// @property {Boolean } hasItemDetailsPriceFormatted
			,	hasItemDetailsPriceFormatted: !!item.get('itemDetails').get('pricelevel1_formatted')
				// @property {String} itemDetailsPriceFormattedCurrency
			,	itemDetailsPriceFormattedCurrency: Utils.formatCurrency(item.get('itemDetails').get('pricelevel1'))
				// @property {String} itemId
			,	itemId: item.get('internalid')
			};
		}
	});
});