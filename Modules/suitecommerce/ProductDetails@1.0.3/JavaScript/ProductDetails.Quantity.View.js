/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetails
define(
	'ProductDetails.Quantity.View'
,	[
		'LiveOrder.Model'

	,	'product_details_quantity.tpl'

	,	'Backbone'
	]
,	function (
		LiveOrderModel

	,	product_details_quantity_tpl

	,	Backbone
	)
{
	'use strict';

	// @class ProductDetails.Quantity.View @extends Backbone.View
	return Backbone.View.extend({

			template: product_details_quantity_tpl

		,	events: {
				'click [data-action="updateQuantity"]': 'setQuantity'
			,	'click [data-action="changeQuantity"]': 'setFocus'
            ,   'keyup [data-action="changeQuantity"]': 'disableFocus'
			}

			// @method setQuantity Increase the product's Quantity by 1
			// @param {jQuery.Event} e
			// @return {Void}
		,	setQuantity: function setQuantity (e)
			{
				e.preventDefault();

				var value = parseInt(this.$(e.currentTarget).data('value'), 10)
				,	$input_quantity = this.$('[name="quantity"]')
				,	old_value = parseInt($input_quantity.val(), 10)
				,	new_quantity = old_value + value;

				$input_quantity.val(new_quantity).trigger('blur');
			}

			// @method setFocus sets focus on input when clicked. Needed as FF won't focus if quantity is updated from spinners
			// @return {Void}
		,	setFocus: function setFocus ()
			{
				this.$('[name="quantity"]').focus();
			}

			// @method disableFocus Blur if ENTER/RETURN key is pressed
			// @return {Void}
        ,   disableFocus: function disableFocus(e)
            {
                if (e.keyCode === 13)
                {
                    this.$('[name="quantity"]').blur();
                }
            }

			//@method getContext
			//@return {ProductDetails.Quantity.View.Context}
		,	getContext: function getContext ()
			{
				//@class ProductDetails.Quantity.View.Context
				return {
					//@property {Product.Model} model
					model: this.model
					//@property {Boolean} showQuantity
				,	showQuantity: this.model.get('item').get('_itemType') !== 'GiftCert'
					//@property {Boolean} isMinusButtonDisabled
				,	isMinusButtonDisabled: this.model.get('quantity') <= 1
				};
				//@class ProductDetails.Quantity.View
			}
		});
});
