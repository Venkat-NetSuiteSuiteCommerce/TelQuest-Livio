/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('Cart.Confirmation.View'
,	[
		'Transaction.Line.Views.Price.View'
	,	'Backbone.CompositeView'
	,	'Transaction.Line.Views.Options.Selected.View'
	,	'ProductLine.Sku.View'

	,	'cart_confirmation_modal.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		TransactionLineViewsPriceView
	,	BackboneCompositeView
	,	TransactionLineViewsOptionsSelectedView
	,	ProductLineSkuView

	,	cart_confirmation_modal_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Cart.Confirmation.View Cart Confirmation view @extends Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: cart_confirmation_modal_tpl

		// @property {String} title
	,	title: _('Added to Cart').translate()

	,	modalClass: 'global-views-modal-large'

		// @property {String} page_header
	,	page_header: _('Added to Cart').translate()

		// @property {Object} attributes
	,	attributes: {
			'id': 'Cart.Confirmation.View'
		,	'class': 'add-to-cart-confirmation-modal shopping-cart-modal'
		}

		// @method initialize
	,	initialize: function ()
		{
			this.model.on('change', this.render, this);

			BackboneCompositeView.add(this);
		}

	,	destroy: function destroy ()
		{
			this.model.off('change', this.render, this);
			this._destroy();
		}

		// @property {Object} childViews
	,	childViews: {
				'Line.Price': function ()
				{
					return new TransactionLineViewsPriceView({
						model: this.model
					});
				}
			,	'Line.SelectedOptions': function ()
				{
					return new TransactionLineViewsOptionsSelectedView({
						model: this.model
					});
				}
			,	'Line.Sku': function ()
				{
					return new ProductLineSkuView({
						model: this.model
					});
				}
		}

		// @method getContext
		// @return {Cart.Confirmation.View.Context}
	,	getContext: function()
		{
			var item = this.model.get('item');

			// @class Cart.Confirmation.View.Context
			return {
				// @property {LiveOrder.Line.Model} model
				model: this.model
				// @property {ImageContainer} thumbnail
			,	thumbnail: this.model.getThumbnail()
				// @property {Boolean} showQuantity
			,	showQuantity: (item.get('_itemType') !== 'GiftCert') && (this.model.get('quantity') > 0)
				// @property {String} itemName
			,	itemName: item.get('_name', true)
			};
		}

		// @class Cart.Confirmation.View
	});

});
