/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module RequestQuoteWizard
define('RequestQuoteWizard.Module.Items.Line.Quantity.View'
,	[
		'requestquote_wizard_module_items_line_quantity.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	]
,	function (
		requestquote_wizard_module_items_line_quantity_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	//@class RequestQuoteWizard.Module.Items.Line.Quantity.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: requestquote_wizard_module_items_line_quantity_tpl

		//@property {Object} events
	,	events: {
			'click [data-action="plus"]': 'addQuantity'
		,	'click [data-action="minus"]': 'subQuantity'
		,	'change [data-type="quantity-input"]': 'changeQuantity'
		,	'keypress [data-type="quantity-input"]': 'submitOnEnter'
		}

		// @method initialize
		//@return {Void}
	,	initialize: function ()
		{
			//Make this view is a composite view
			BackboneCompositeView.add(this);
		}

		//@method prevent redirect to the account overview on Submit the form when user presses enter in the quantity input text
		//@param {jQuery.Event} e
		//@return {Void}
	,	submitOnEnter: function (e)
		{
			if (e.keyCode === 13)
			{
				e.preventDefault(e);
			}
		}

		//@method addQuantity Add 1 the current to quantity-input field
		//@param {jQuery.Event} e
		//@return {Void}
	,	addQuantity: function (e)
		{
			e.preventDefault();

			var newQuantity = parseInt(this.$('[data-type="quantity-input"]').val(), 10) + 1;

			this.$('[data-type="quantity-input"]').val(newQuantity);

			this.setQuantity();
		}

		//@method subQuantity Subtracts 1 from quantity-input field
		//@param {jQuery.Event} e
		//@return {Void}
	,	subQuantity: function (e)
		{
			e.preventDefault();

			var newQuantity = parseInt(this.$('[data-type="quantity-input"]').val(), 10) - 1;

			if (newQuantity)
			{
				this.$('[data-type="quantity-input"]').val(newQuantity);

				this.setQuantity();
			}
		}

		//@method changeQuantity Debounce callings to setQuantity function to prevent losing focus
		//@param {jQuery.Event} e
		//@return {Void}
	,	changeQuantity: _.debounce(function ()
		{
			this.setQuantity();
		}, 500)

		//@method setQuantity Updates the model quantity and the input field.
		//@return {Void}
	,	setQuantity: function ()
		{
			var str_quantity = this.$('[data-type="quantity-input"]').val()
			,	line_pricing
			,	quantity = parseInt(str_quantity, 10);

			if (!_.isNaN(quantity) && _.isNumber(quantity))
			{
				quantity < this.model.get('item').get('_minimumQuantity', true) &&
					(quantity = this.model.get('item').get('_minimumQuantity', true), this.$('[data-type="quantity-input"]').val(quantity));

				//In order to properly render prices for items with quantity pricing
				//1) we set the quantity silent which avoids the re-render of the entire list of item
				this.model.set('quantity',  quantity, {silent: true});
				//2) with obtain the new pricing with the quantity set
				line_pricing = this.model.getPrice();
				//3) We set the new rate_formatted which will trigger a change and so a re-render
				this.model.set('rate_formatted', line_pricing.price_formatted);
				//Please notice that the same is being done in the cart confirmation

				//add attr disabled!!
				quantity > 1 ? this.$('[data-action="minus"]').removeAttr('disabled') : this.$('[data-action="minus"]').attr('disabled', true);
			}
			else
			{
				this.render();
			}
		}

		//@method getContext
		//@return {RequestQuoteWizard.Module.Items.Line.Quantity.View.Context}
	,	getContext: function ()
		{
			var minimum_quantity = this.model.get('item').get('_minimumQuantity', true);

			//@class RequestQuoteWizard.Module.Items.Line.Quantity.View.Context
			return {
				//@property {Transaction.Line.Model} model
				model: this.model
				//@property {String} lineId
			,	lineId: this.model.get('internalid')
				//@property {Boolean} isMinusButtonDisabled
			,	isMinusButtonDisabled: (this.model.get('quantity') <= minimum_quantity) || this.model.get('quantity') === 1
				//@property {Boolean} showMinimumQuantity
			,	showMinimumQuantity: minimum_quantity > 1
				//@property {Integer} minimumQuantity
			,	minimumQuantity: minimum_quantity
			};
			//@class RequestQuoteWizard.Module.Items.Line.Quantity.View
		}
	});
});