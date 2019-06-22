/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

 // @module Transaction
define('Transaction.Model'
,	[	'Transaction.Line.Collection'
	,	'Transaction.Shipmethod.Collection'
	,	'Transaction.Paymentmethod.Collection'

	,	'Address.Collection'
	,	'CreditCard.Collection'

	,	'underscore'
	,	'Backbone'
	,	'Backbone.CachedSync'
	]
,	function (
		TransactionLineCollection
	,	TransactionShipmethodCollection
	,	TransactionPaymentmethodCollection

	,	AddressesCollection
	,	CreditCardsCollection

	,	_
	,	Backbone
	,	BackboneCachedSync
	)
{
	'use strict';

	// @class Transaction.Model Model for showing information about an order @extends Backbone.Model
	return Backbone.Model.extend({

		//@property {Transaction.Line.Collection} linesCollection Property used to make it easy to override this model and change the class used
		//to generates lines
		linesCollection: TransactionLineCollection

	,	defaults: {
			//@property {Address.Collection} addresses
			'addresses': null
			//@property {Address.Collection} shipmethods
		,	'shipmethods': null
		}
		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: false
		//@method initialize Creates the initial properties in order to generate the current complex object that a transaction is
		//@param {Transaction.Model.InitializationParameter} attributes
		//@return {Void}
	,	initialize: function (attributes)
		{
			if (this.cacheSupport)
			{
				var self = this;

				_.each(BackboneCachedSync, function (fn, name)
				{
					self[name === 'cachedSync' ? 'sync' : name] = fn;
				});
			}

			this.on('change:lines', function (model, lines)
			{
				if (model.previous('lines') instanceof model.linesCollection)
				{
					model.set('lines', model.previous('lines'), {silent: true});
					model.get('lines').reset(lines instanceof model.linesCollection ? lines.clone() : lines);
				}
				else
				{
					model.set('lines', new model.linesCollection(lines), {silent: true});
				}
			});
			this.trigger('change:lines', this, attributes && attributes.lines || []);

			this.on('change:shipmethods', function (model, shipmethods)
			{
				if (model.previous('shipmethods') instanceof TransactionShipmethodCollection)
				{
					model.set('shipmethods', model.previous('shipmethods'), {silent: true});
					model.get('shipmethods').reset(shipmethods instanceof TransactionShipmethodCollection ? shipmethods.clone() : shipmethods);
				}
				else
				{
					model.set('shipmethods', new TransactionShipmethodCollection(shipmethods), {silent: true});
				}
			});
			this.trigger('change:shipmethods', this, attributes && attributes.shipmethods || []);

			this.on('change:paymentmethods', function (model, paymentmethods)
			{
				if (model.previous('paymentmethods') instanceof TransactionPaymentmethodCollection)
				{
					model.set('paymentmethods', model.previous('paymentmethods'), {silent: true});
					model.get('paymentmethods').reset(paymentmethods instanceof TransactionPaymentmethodCollection ? paymentmethods.clone() : paymentmethods);
				}
				else
				{
					model.set('paymentmethods', new TransactionPaymentmethodCollection(paymentmethods), {silent: true});
				}
			});
			this.trigger('change:paymentmethods', this, attributes && attributes.paymentmethods || []);

			this.on('change:addresses', function (model, addresses)
			{
				if (model.previous('addresses') instanceof AddressesCollection)
				{
					model.set('addresses', model.previous('addresses'), {silent: true});
					model.get('addresses').reset(addresses  instanceof AddressesCollection ? addresses.clone() :  addresses);
				}
				else
				{
					model.set('addresses', new AddressesCollection(addresses), {silent: true});
				}
			});
			this.trigger('change:addresses', this, attributes && attributes.addresses || []);
		}

		// @method _submit Internal method invoked when the user place/submit a transaction
		// @return {jQuery.Deferred}
	,	_submit: function ()
		{
			//Force a POST
			this.set('internalid', null);

			var creditcard = this.get('paymentmethods').findWhere({type: 'creditcard'})
			,	paypal = this.get('paymentmethods').findWhere({type: 'paypal'});

			if (creditcard && !creditcard.get('creditcard'))
			{
				this.get('paymentmethods').remove(creditcard);
			}

			if (paypal && !paypal.get('complete'))
			{
				this.get('paymentmethods').remove(paypal);
			}

			if (_.isFunction(this.shippingAddressIsRequired) && !this.shippingAddressIsRequired())
			{
				this.unset('shipaddress', {silent: true});
				this.set('sameAs', false, {silent: true});
			}

			return this.save();
		}
	});

});

//@class Transaction.Model.InitializationParameter
//@property {Arra<Transaction.Model.Get.Line>?} lines
//@property {Arra<Transaction.Model.Get.ShipMethod>?} shipmethods
//@property {Arra<Transaction.Model.Get.PaymentMethod>?} paymentmethods
//@property {Arra<Address.Model.Attributes>?} addresses