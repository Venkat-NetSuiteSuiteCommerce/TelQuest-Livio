/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('Cart.Item.Actions.View'
,	[	'Backbone.CompositeView'
	,	'SC.Configuration'

	,	'cart_item_actions.tpl'

	,	'Backbone'
	,	'Utils'
	]
,	function (
		BackboneCompositeView
	,	Configuration

	,	cart_item_actions_tpl

	,	Backbone
	,	Utils
	)
{
	'use strict';

	//@class Cart.Item.Actions.View @extend Backbone.View
	return Backbone.View.extend({

		template: cart_item_actions_tpl

	,	initialize: function ()
		{
			this.application = this.options.application;

			BackboneCompositeView.add(this);
		}

		//@method getContext @return Cart.Item.Actions.View.Context
	,	getContext: function ()
		{
			//@class Cart.Item.Actions.View.Context
			return {
				//@property {Model} line
				line: this.model
				//@property {Item.Model} item
			,	item: this.model.get('item')
				//@property {String} editUrl
			,	editUrl: Utils.addParamsToUrl(this.model.generateURL(), {'source': 'cart', 'internalid': this.model.get('internalid')})
				//@property {Boolean} isAdvanced
			,	isAdvanced: Configuration.siteSettings.sitetype !== 'STANDARD'
				//@property {Boolean} showSaveForLateButton
			,	showSaveForLateButton: this.application.ProductListModule && this.application.ProductListModule.Utils.isProductListEnabled() && Configuration.currentTouchpoint === 'home'
				//@property {String} lineId
			,	lineId: this.model.get('internalid')
				//@property {Boolean} showQuantity
			,	showQuantity: this.model.get('item').get('_itemType') === 'GiftCert'
			};
			//@class Cart.Item.Actions.View
		}
	});
});