/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Quote
define(
		'Quote.Model'
,	[	
		'Transaction.Model'
		
	,	'underscore'
	]
,	function (
		TransactionModel

	,	_
	)
{
	'use strict';

	//@class Quote.Model @extends Transaction.Model
	return TransactionModel.extend({

				

		//@property {String} urlRoot
		urlRoot: 'services/Quote.Service.ss?recordtype=estimate'

	,	initialize: function ()
		{			
			TransactionModel.prototype.initialize.apply(this, arguments);			
			//metadata of the attribute options(custom fields)
			if(SC.ENVIRONMENT.customFieldsMetadata && SC.ENVIRONMENT.customFieldsMetadata.estimate)
			{
				this.__customFieldsMetadata = SC.ENVIRONMENT.customFieldsMetadata.estimate;
			}

		}

		//@method submit Method invoked when the user a new quote want to be created
		// @return {jQuery.Deferred}
	,	submit: function ()
		{
			var self = this;
			return this._submit.apply(this, arguments)
				.fail(function (jqXhr)
			{
					jqXhr.preventDefault = true;
				})
				.done(function(){
					self.trigger('submit');
			});
		}

		//@method save Override default save method to validate that independently of the current wizard steps configuration
		//the default quote values are preserve
		//@return {jQuery.XHR|Boolean} jqXHR if validation is successful and false
	,	save: function ()
		{
			var billing_address = parseInt(this.get('billaddress'), 10)
			,	shipping_address = parseInt(this.get('shipaddress'), 10);

			//We don't know if the shipping address module is for sure present, so we add here an extra validation
			//to just save a valid shipping address and not an id that was auto-generated in the back-end
			if (!_.isNumber(shipping_address) || _.isNaN(shipping_address))
			{
				this.unset('shipaddress');
			}

			//We don't know if the billing address module is for sure present, so we add here an extra validation
			//to just save a valid billing address and not an id that was auto-generated in the back-end
			if (!_.isNumber(billing_address) || _.isNaN(billing_address))
			{
				this.unset('billaddress');
			}

			//Fix terms payment method object name
			//This happens because in some cases the back-end returns a payment method already initialized
			//that can be terms depending on the current user.
			//Our Transaction.Model returns the invoice in an object with the property 'paymentterms'
			//but at the time to set the payment method it expect an object with a property 'terms'
			if (this.get('paymentmethods').length)
			{
				var term_paymentMethod = this.get('paymentmethods').find(function (payment_method)
					{
						return !!payment_method.get('paymentterms');
					});

				if (term_paymentMethod)
				{
					term_paymentMethod.set('terms', term_paymentMethod.get('paymentterms'));
					term_paymentMethod.unset('paymentterms');
				}
			}

			return TransactionModel.prototype.save.apply(this, arguments);
		}

		// @method getNonShippableLines Returns the order's line that are NON Shippable
		// @returns {Array<Transaction.Line.Model>}
	,	getNonShippableLines: function ()
		{
			return this.get('lines').filter(function (line)
				{
					return !line.get('item').get('_isfulfillable');
				});
		}

		//@method getIfThereAreDeliverableItems Determines if at least one item is shippable
		//@return {Boolean}
	,	getIfThereAreDeliverableItems: function getIfThereAreDeliverableItems ()
		{
			return this.get('lines').length - this.getNonShippableLines().length - this.getPickupInStoreLines().length > 0;
		}
		// @method getShippableLines
		// @returns {Array<Transaction.Line.Model>} the order's line that are shippable without taking into account if their have or not set a shipaddress
	,	getShippableLines: function getShippableLines ()
		{
			return this.get('lines').filter(function (line)
			{
				return line.get('item').get('_isfulfillable') && line.get('fulfillmentChoice') !== 'pickup';
			});
		}
	,	getPickupInStoreLines: function getPickupInStoreLines()
		{
			var lines = [];
			this.get('lines').each(function (line)
			{
				if (line.get('fulfillmentChoice') === 'pickup')
				{
					lines.push(line);
				}
			});

			return lines;
		}

		//@method shippingAddressIsRequired This method is used by the OrderWizard.Module.Address.Shipping to determine if its must be rendered or not.
		// @return {Boolean}
	,	shippingAddressIsRequired: function ()
		{
			return true;
			// return this.get('lines').length ?
			// 	this.getNonShippableLines().length !== this.get('lines').length :
			// 	true;
		}
	});
});