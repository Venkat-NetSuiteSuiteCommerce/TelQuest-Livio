/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module LiveOrder
define('LiveOrder.Model'
,	[
		'Transaction.Model'
	,	'Transaction.Shipmethod.Collection'
	,	'LiveOrder.Line.Collection'
	,	'LiveOrder.Line.Model'

	,	'Profile.Model'

	,	'Session'
	,	'Singleton'
	,	'AjaxRequestsKiller'
	,	'SC.Configuration'
	,	'Utils'
	,	'underscore'
	,	'jQuery'
	,	'Tracker'
	]
,	function (
		TransactionModel
	,	TransactionShipmethodCollection
	,	LiveOrderLineCollection
	,	LiveOrderLineModel

	,	ProfileModel

	,	Session
	,	Singleton
	,	AjaxRequestsKiller
	,	Configuration
	,	Utils
	,	_
	,	jQuery
	,	Tracker
	)
{
	'use strict';

	// @class LiveOrder.Model Model for showing information about an open order. It is a singleton so you can obtain the instance fro anywhere by calling ```LiveOrderModel.getInstance()```
	// @extends Transaction.Model
	var ClassProperties = _.extend({

		// @method loadCart
		// @return {jQuery.Deferred}
		// @static
		loadCart: function()
		{
			// if the Page Generator is on, do not fetch the cart. Instead, return an empty solved promise
			if (_.result(SC, 'isPageGenerator'))
			{
				return jQuery.Deferred().resolve();
			}

			var cart_instance = this.getInstance();

			if (cart_instance.cartLoad)
			{
				if (cart_instance.isLoading)
				{
					cart_instance.isLoading = false;
				}
			}
			else
			{
				cart_instance.cartLoad = jQuery.Deferred();

				ProfileModel.getPromise().done(function ()
				{
					cart_instance.fetch()
						.done(function ()
						{
							cart_instance.cartLoad.resolve.apply(this, arguments);
						})
						.fail(function ()
						{
							cart_instance.cartLoad.reject.apply(this, arguments);
						})
						.always(function ()
						{
							if (cart_instance.isLoading)
							{
								cart_instance.isLoading = false;
							}
						});
				});
			}

			return cart_instance.cartLoad;
		}

	}, Singleton);

	var LiveOrderModel = TransactionModel.extend({
		urlRoot: Utils.getAbsoluteUrl('services/LiveOrder.Service.ss')

	,	linesCollection: LiveOrderLineCollection

	,	validation:
		{
			zip: { fn: Utils.validateZipCode }
		}

		// @method url redefine url to avoid possible cache problems from browser
		// @return {Void}
	,	url: function url ()
		{
			var base_url = TransactionModel.prototype.url.apply(this, arguments);
			return base_url + (base_url.indexOf('?') > 0 ? '&' : '?') + 't=' + new Date().getTime();
		}

	,	initialize: function initialize (attributes)
		{
			// call the initialize of the parent object, equivalent to super()
			TransactionModel.prototype.initialize.apply(this, arguments);

			this.set('internalid', 'cart');

			this.on('change:confirmation', function (model, confirmation)
			{
				model.set('confirmation', new TransactionModel(confirmation), {silent: true});
			});
			this.trigger('change:confirmation', this, attributes && attributes.confirmation || {});

			this.on('change:multishipmethods', function (model, multishipmethods)
			{
				if (multishipmethods)
				{
					_.each(_.keys(multishipmethods), function (address_id)
					{
						multishipmethods[address_id] = new TransactionShipmethodCollection(multishipmethods[address_id], {silent: true});
					});
				}

				model.set('multishipmethods', multishipmethods, {silent: true});
			});
			this.trigger('change:multishipmethods', this, attributes && attributes.multishipmethods || []);

			//Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
			this.on('change:touchpoints', function (model, touchpoints)
			{
				Session.set('touchpoints', touchpoints);
			});
			//metadata of the attribute options(custom fields)
			if (SC.ENVIRONMENT.customFieldsMetadata && SC.ENVIRONMENT.customFieldsMetadata.salesorder)
			{
				this.__customFieldsMetadata = SC.ENVIRONMENT.customFieldsMetadata.salesorder;
			}
		}

		// @method getLatestAddition
		// @return {LiveOrder.Line.Model}
	,	getLatestAddition: function getLatestAddition ()
		{
			var model = null;

			if (this.get('latest_addition'))
			{
				model = this.get('lines').get(this.get('latest_addition'));
			}

			if (!model && this.get('lines').length)
			{
				model = this.get('lines').at(0);
			}

			return model;
		}

		// @method findItemInCart Algorithm to search an line in the cart. We can't use internalid only because for matrix items, the internalid change when is added to the cart
		// @param {Transaction.Line.Model} line
		// @return {LiveOrder.Line.Model}
	,	findLine: function findLine (line)
		{
			return this.get('lines').find(function (cart_line)
			{
				return cart_line.isEqual(line);
			});
		}

		//@method addLines Add the passed in collection of products as new lines to the Cart
		//@param {Array<TransactionLineModel|LiveOrder.Line.Collection>} lines
		//@return {jQuery.Deferred}
	,	addLines: function addLines (lines)
		{
			lines = lines instanceof LiveOrderLineCollection ? lines : new LiveOrderLineCollection(lines);

			// As the LiveOrder.Live.Service IS NOT REST we cannot use lines.save, instead we directly call lines.sync
			var	self = this
			,	promise = lines.sync('create', lines, {killerId: AjaxRequestsKiller.getKillerId()});

			promise.done(function (attributes)
			{
				// Though this should be a restful api, the live-order-line returns the full live-order back (lines and summary are interconnected)
				self.set(attributes);

				Tracker.getInstance().trackAddToCart(self.get('lines').get(self.get('latest_addition')));
			});

			return promise;
		}

		//@method addLine
		//@param {Transaction.Line.Model} line
		//@return {jQuery.Deferred}
	,	addLine: function addLine (line)
		{
			return this.addLines([line]);
		}

		//@method addProduct
		//@param {Product.Model} line
		//@return {jQuery.Deferred}
	,	addProduct: function addProduct (product)
		{
			return this.addLine(LiveOrderLineModel.createFromProduct(product));
		}

		//@method addProducts
		//@param {Array<Product.Model>} products
		//@return {jQuery.Deferred}
	,	addProducts: function addProducts (products)
		{
			var lines = _.map(products, function (product)
			{
				return LiveOrderLineModel.createFromProduct(product);
			});

			return this.addLines(lines);
		}

		//@method updateProduct
		//@param {Product.Model} product
		//@return {jQuery.Deferred}
	,	updateProduct: function updateProduct (product)
		{
			return this.updateLine(LiveOrderLineModel.createFromProduct(product));
		}

		//@method updateLine
		//@param {Transaction.Line.Model} line
		//@return {jQuery.Deferred}
	,	updateLine: function updateLine (line)
		{
			var self = this;

			// As the LiveOrder.Live.Service IS NOT REST we cannot use line.save, instead we directly call line.sync
			return line.sync('update', line, {killerId: AjaxRequestsKiller.getKillerId(), validate: false})
				.done(function (attributes)
				{
					// Although this should be a restful api, the live-order-line returns the full live-order back (lines and summary are interconnected)
					self.set(attributes);

					Tracker.getInstance().trackAddToCart(self.getLatestAddition());
				})
				.fail(function (jqXhr)
				{
					var error_details = null;
					try
					{
						var response = JSON.parse(jqXhr.responseText);
						error_details = response.errorDetails;
					}
					finally
					{
						if (error_details && error_details.status === 'LINE_ROLLBACK')
						{
							var line = self.get('lines').get(error_details.oldLineId);

							if (line)
							{
								line.set('internalid', error_details.newLineId);
								self.trigger('LINE_ROLLBACK', line);
							}
						}
					}
				});
		}

		// @method removeLine
		// @param {LiveOrder.Line.Model} line
		// @return {jQuery.Deferred}
	,	removeLine: function removeLine (line)
		{
			var self = this;

			return line.sync('delete', line, {killerId: AjaxRequestsKiller.getKillerId(), validate: false})
				.done(function (attributes)
				{
					self.set(attributes);
				});
		}

		// @method submit invoked when the user place/submit the order
		// @return {jQuery.Deferred}
	,	submit: function submit ()
		{
			this.set('internalid', null);

			var self = this
			,	creditcard = this.get('paymentmethods').findWhere({type: 'creditcard'})
			,	paypal = this.get('paymentmethods').findWhere({type: 'paypal'});

			if (creditcard && !creditcard.get('creditcard'))
			{
				this.get('paymentmethods').remove(creditcard);
			}

			if (paypal && !paypal.get('complete'))
			{
				this.get('paymentmethods').remove(paypal);
			}

			if (!this.shippingAddressIsRequired())
			{
				this.unset('shipaddress', {silent: true});
				this.set('sameAs', false, {silent: true});
			}

			return this.save().fail(function ()
			{
				self.set('internalid', 'cart');
			});
		}

		//@method save Override default save method to just return a resolved promise when the cart have already been saved.
		//@return {jQuery.Deferred}
	,	save: function save ()
		{
			if (this.get('confirmation') && this.get('confirmation').get('internalid'))
			{
				return jQuery.Deferred().resolve();
			}
			return TransactionModel.prototype.save.apply(this, arguments);
		}

		// @method getTotalItemCount
		// @return {Number}
	,	getTotalItemCount: function getTotalItemCount ()
		{
			return _.reduce(this.get('lines').pluck('quantity'), function (memo, quantity)
			{
				return memo + (parseFloat(quantity) || 1);
			}, 0);
		}

	,	parse: function parse (response, options)
		{
			if (options && !options.parse)
			{
				return;
			}

			return TransactionModel.prototype.parse.apply(this, arguments);
		}

		// @method getUnsetLines
		// @returns {Array<Transaction.Line.Model>} the order's lines that have not set its addresses to Multi Ship To yet
	,	getUnsetLines: function getUnsetLines ()
		{
			return this.get('lines').filter(function (line) { return !line.get('shipaddress') && line.get('item').get('_isfulfillable'); });
		}

		// @method getNonShippableLines
		// @returns {Array<Transaction.Line.Model>} the order's line that are NON Shippable
	,	getNonShippableLines: function getNonShippableLines ()
		{
			return this.get('lines').filter(function (line) { return !line.get('item').get('_isfulfillable'); });
		}

		// @method getSetLines
		// @returns {Array<Transaction.Line.Model>} the list of lines already set its shipping address
	,	getSetLines: function getSetLines ()
		{
			return this.get('lines').filter(function (line)
			{
				return line.get('shipaddress') && line.get('item').get('_isfulfillable');
			});
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

		// @method getItemsIds
		// @returns {Array<String>} an array containing the cart items ids
		// @return {Array<String>}
	,	getItemsIds: function getItemsIds ()
		{
			return this.get('lines').map(function (line)
			{
				return line.get('item').get('internalid');
			});
		}

		//@method getIfThereAreDeliverableItems Determines if at least one item is shippable
		//@return {Boolean}
	,	getIfThereAreDeliverableItems: function getIfThereAreDeliverableItems ()
		{
			return this.get('lines').length - this.getNonShippableLines().length - this.getPickupInStoreLines().length > 0;
		}

		// @method shippingAddressIsRequired Checks if the shipping address is require and if all items in the order are non-shippable.
		// @return {Boolean}
	,	shippingAddressIsRequired: function shippingAddressIsRequired ()
		{
			return this.getIfThereAreDeliverableItems() && Configuration.get('siteSettings.requireshippinginformation', 'F') === 'T';
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

	}, ClassProperties);

	return LiveOrderModel;
});
