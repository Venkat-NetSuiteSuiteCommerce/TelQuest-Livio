/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuantityPricing
define(
	'QuantityPricing.View'
,	[
		'QuantityPricing.Utils'
	,	'SC.Configuration'
	,	'Profile.Model'

	,	'quantity_pricing.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (

		QuantityPricingUtils
	,	Configuration
	,	ProfileModel

	,	quantity_pricing_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class QuantityPricing.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: quantity_pricing_tpl

		//@property {Object} events
	,	events: {
			'click [data-action="toggle"]': 'toggleAccordion'
		}

		//@method initialize
		//@param {QuantityPricing.Initialize.Options} options
		//@return {Void}
	,	initialize: function ()
		{

			this.profileModel = ProfileModel.getInstance();

			this._isEnabled = !(Configuration.getRegistrationType() !== 'disabled' && SC.getSessionInfo('loginToSeePrices') && this.profileModel.get('isLoggedIn') !== 'T');

			this.price_schedule = QuantityPricingUtils.rearrangeQuantitySchedule(this.model.get('item'), _.isFunction(this.model.getSelectedMatrixChilds) ? this.model.getSelectedMatrixChilds() : []);

			this.model.on('change', function ()
			{
				var new_price_schedule =  QuantityPricingUtils.rearrangeQuantitySchedule(this.model.get('item'), _.isFunction(this.model.getSelectedMatrixChilds) ? this.model.getSelectedMatrixChilds() : []);

				if (!_.isEqual(this.price_schedule, new_price_schedule))
				{
					this.price_schedule = new_price_schedule;
					this.render();
				}
			}, this);

			this.item_key = this.model.get('item').id + '' + (new Date()).getMilliseconds();
		}

		//@property {Boolean} _isEnabled Boolean flag that shows if we are able to show this view
	,	_isEnabled: false

		//@property {Boolean} _isOpen Boolean flag about if accordion is open or not.
	,	_isOpen: false

		//@method toggleAccordion Toggle the _isOpen internal flag
		//@return {Void}
	,	toggleAccordion: function ()
		{
			this._isOpen = !this._isOpen;
		}

		//@method getContext
		//@return {QuantityPricing.View.Context}
	,	getContext: function ()
		{
			//@class QuantityPricing.View.Context
			return {
				// @property {Boolean} isAccordion
				isAccordion: !this.options.notUseAccordion
				// @property {Boolean} showContent
			,	showContent: this._isEnabled && !!this.price_schedule
				//@property {Boolean} priceSchedule
			,	priceSchedule: this.price_schedule
				//@property {Boolean} isOpen
			,	isOpen: this._isOpen
				//@property {Boolean} isModal
			,	isModal: this.options.isModal
				//@property {String} itemKey
			,	itemKey: this.item_key
			};
			//@class QuantityPricing.View
		}
	});
});

// @class QuantityPricing.Initialize.Options
// @property {Product.Model | Transaction.Line.Model} model
// @property {Boolean} notUseAccordion