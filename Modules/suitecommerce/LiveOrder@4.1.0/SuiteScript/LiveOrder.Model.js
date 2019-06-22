/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https://groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
// @module LiveOrder

define(
	'LiveOrder.Model'
,	[
		'SC.Model'
	,	'Application'
	,	'Profile.Model'
	,	'StoreItem.Model'
	,	'SC.Models.Init'
	,	'SiteSettings.Model'
	,	'Utils'
	,	'ExternalPayment.Model'
	,	'underscore'
	,	'CustomFields.Utils'
	]
,	function (
		SCModel
	,	Application
	,	Profile
	,	StoreItem
	,	ModelsInit
	,	SiteSettings
	,	Utils
	,	ExternalPayment
	,	_
	,	CustomFieldsUtils
	)
{
	'use strict';

	// @class LiveOrder.Model Defines the model used by the LiveOrder.Service.ss service
	// Available methods allow fetching and updating Shopping Cart's data. Works against the
	// Shopping session order, this is, nlapiGetWebContainer().getShoppingSession().getOrder()
	// @extends SCModel
	return SCModel.extend({

		name: 'LiveOrder'
		// @property {Boolean} isSecure
	,	isSecure: Utils.isCheckoutDomain()
		// @property {Boolean} isMultiShippingEnabled
	,	isMultiShippingEnabled: SiteSettings.isMultiShippingRoutesEnabled()
		// @property {Boolean} isPickupInStoreEnabled
	,	isPickupInStoreEnabled: SiteSettings.isPickupInStoreEnabled()
		// @property {Boolean} isAutoapplyPromotionsEnabled
	,	isAutoapplyPromotionsEnabled: SiteSettings.isAutoapplyPromotionsEnabled()
		// @method get
		// @returns {LiveOrder.Model.Data}
	,	get: function get ()
		{
			var order_fields = this.getFieldValues()
			,	result = {};

			// @class LiveOrder.Model.Data object containing high level shopping order object information. Serializeble to JSON and this is the object that the .ss service will serve and so it will poblate front end Model objects
			try
			{
				//@property {Array<LiveOrder.Model.Line>} lines
				result.lines = this.getLines(order_fields);
			}
			catch (e)
			{
				if (e.code === 'ERR_CHK_ITEM_NOT_FOUND')
				{
					return this.get();
				}
				else
				{
					throw e;
				}
			}

			order_fields = this.hidePaymentPageWhenNoBalance(order_fields);

			// @property {Array<String>} lines_sort sorted lines ids
			result.lines_sort = this.getLinesSort();

			// @property {String} latest_addition
			result.latest_addition = ModelsInit.context.getSessionObject('latest_addition');

			// @property {Array<LiveOrder.Model.PromoCode>} promocodes
			result.promocodes = this.getPromoCodes(order_fields);

			if (this.automaticallyRemovedPromocodes)
			{
				result.automaticallyremovedpromocodes = this.automaticallyRemovedPromocodes;
			}

			// @property {Boolean} ismultishipto
			result.ismultishipto = this.getIsMultiShipTo(order_fields);

			// Ship Methods
			if (result.ismultishipto)
			{
				// @property {Array<OrderShipMethod>} multishipmethods
				result.multishipmethods = this.getMultiShipMethods(result.lines);

				// These are set so it is compatible with non multiple shipping.
				result.shipmethods = [];
				result.shipmethod = null;
			}
			else
			{
				// @property {Array<OrderShipMethod>} shipmethods
				result.shipmethods = this.getShipMethods(order_fields);
				// @property {OrderShipMethod} shipmethod
				result.shipmethod = order_fields.shipmethod ? order_fields.shipmethod.shipmethod : null;
			}

			// Addresses
			result.addresses = this.getAddresses(order_fields);
			result.billaddress = order_fields.billaddress ? order_fields.billaddress.internalid : null;
			result.shipaddress = !result.ismultishipto ? order_fields.shipaddress.internalid : null;

			// @property {Array<ShoppingSession.PaymentMethod>} paymentmethods Payments
			result.paymentmethods = this.getPaymentMethods(order_fields);

			// @property {Boolean} isPaypalComplete Paypal complete
			result.isPaypalComplete = ModelsInit.context.getSessionObject('paypal_complete') === 'T';

			// @property {Array<String>} touchpoints Some actions in the live order may change the URL of the checkout so to be sure we re send all the touchpoints
			result.touchpoints = SiteSettings.getTouchPoints();

			// @property {Boolean} agreetermcondition Terms And Conditions
			result.agreetermcondition = order_fields.agreetermcondition === 'T';

			// @property {OrderSummary} Summary
			result.summary = order_fields.summary;

			// @property {Object} options Transaction Body Field
			result.options = this.getTransactionBodyField();

			result.purchasenumber = order_fields.purchasenumber;

			// @class LiveOrder.Model
			return result;
		}

		// @method update will update the commerce order object with given data.
		// @param {LiveOrder.Model.Data} data
	,	update: function update (data)
		{
			var current_order = this.get();

			if(this.isAutoapplyPromotionsEnabled)
			{
				this.setOldPromocodes();
			}
			
			// Only do this if it's capable of shipping multiple items.
			if (this.isMultiShippingEnabled)
			{
				if (this.isSecure && ModelsInit.session.isLoggedIn2())
				{
					ModelsInit.order.setEnableItemLineShipping(!!data.ismultishipto);
					if (!current_order.ismultishipto && data.ismultishipto)
					{
						this.automaticallyRemovedPromocodes = this.getAutomaticallyRemovedPromocodes(current_order);
					}
				}
				// Do the following only if multishipto is active (if the data received determine that MST is enabled and pass the MST Validation)
				if (data.ismultishipto)
				{
					ModelsInit.order.removeShippingAddress();

					ModelsInit.order.removeShippingMethod();

					this.splitLines(data, current_order);

					this.setShippingAddressAndMethod(data, current_order);
				}
			}

			if (!this.isMultiShippingEnabled || !data.ismultishipto)
			{
				this.setShippingAddress(data, current_order);

				this.setShippingMethod(data, current_order);
			}

			this.setPromoCodes(data, current_order);

			this.setBillingAddress(data, current_order);

			this.setPaymentMethods(data, current_order);

			this.setPurchaseNumber(data, current_order);

			this.setTermsAndConditions(data, current_order);

			this.setTransactionBodyField(data, current_order);
		}

		// @method submit will call ModelsInit.order.submit() taking in account paypal payment
		// @param {Boolean} threedsecure Received only in 3D Secure second step (from threedsecure.ssp)
		// @return {Object} Result of order submit operation ({status, internalid, confirmationnumber})
	,	submit: function submit (threedsecure)
		{
			var confirmation
			,	payment = ModelsInit.order.getPayment();

			if (!threedsecure && payment && payment.paymentterms === 'CreditCard' && SC.Configuration.isThreeDSecureEnabled)
			{
				return this.process3DSecure();
			}
			else
			{
				var	paypal_address = _.find(ModelsInit.customer.getAddressBook(), function (address)
				{
					return !address.phone && address.isvalid === 'T';
				});

				confirmation = ModelsInit.order.submit();

				// We need remove the paypal's address because after order submit the address is invalid for the next time.
				this.removePaypalAddress(paypal_address);

				ModelsInit.context.setSessionObject('paypal_complete', 'F');

				if (this.isMultiShippingEnabled)
				{
					ModelsInit.order.setEnableItemLineShipping(false); // By default non order should be MST
				}

				//As the commerce API does not remove the purchase number after submitting the order we manually remove it
				this.setPurchaseNumber();

				if (confirmation.statuscode !== 'redirect')
				{
					confirmation = _.extend(this.getConfirmation(confirmation.internalid), confirmation);
				}
				else
				{
					confirmation.redirecturl = ExternalPayment.generateUrl(confirmation.internalid, 'salesorder');
				}
			}

			return confirmation;
		}

		// @method addAddress
		// @param {OrderAddress} address
		// @param {Array<OrderAddress>} addresses
		// @returns {String} the given address internal id
	,	addAddress: function addAddress (address, addresses)
		{
			if (!address)
			{
				return null;
			}

			addresses = addresses || {};

			if (!address.fullname)
			{
				address.fullname = address.attention ? address.attention : address.addressee;
			}

			if (!address.company)
			{
				address.company = address.attention ? address.addressee : null;
			}

			delete address.attention;
			delete address.addressee;

			if (!address.internalid)
			{
				address.internalid =	(address.country || '') + '-' +
										(address.state || '') + '-' +
										(address.city || '') + '-' +
										(address.zip || '') + '-' +
										(address.addr1 || '') + '-' +
										(address.addr2 || '') + '-' +
										(address.fullname || '') + '-' +
										address.company;

				address.internalid = address.internalid.replace(/\s/g, '-');
			}

			if (address.internalid !== '-------null')
			{
				addresses[address.internalid] = address;
			}

			return address.internalid;
		}

		// @method hidePaymentPageWhenNoBalance
		// @param {Array<String>} order_fields
	,	hidePaymentPageWhenNoBalance: function hidePaymentPageWhenNoBalance (order_fields)
		{
			if (this.isSecure && ModelsInit.session.isLoggedIn2() && order_fields.payment && ModelsInit.session.getSiteSettings(['checkout']).checkout.hidepaymentpagewhennobalance === 'T' && order_fields.summary.total === 0)
			{
				ModelsInit.order.removePayment();
				order_fields = this.getFieldValues();
			}
			return order_fields;
		}

		// @method redirectToPayPal calls ModelsInit.order.proceedToCheckout() method passing information for paypal third party checkout provider
	,	redirectToPayPal: function redirectToPayPal ()
		{
			var touchpoints = SiteSettings.getTouchPoints()
			,	continue_url = ModelsInit.session.getAbsoluteUrl('') + (/\/$/.test(ModelsInit.session.getAbsoluteUrl('')) ? touchpoints.checkout.replace('/', '') : touchpoints.checkout )
			,	joint = ~continue_url.indexOf('?') ? '&' : '?';

			continue_url = continue_url + joint + 'paypal=DONE&fragment=' + request.getParameter('next_step');

			ModelsInit.session.proceedToCheckout({
				cancelurl: touchpoints.viewcart
			,	continueurl: continue_url
			,	createorder: 'F'
			,	type: 'paypalexpress'
			,	shippingaddrfirst: 'T'
			,	showpurchaseorder: 'T'
			});
		}

		// @method redirectToPayPalExpress calls ModelsInit.order.proceedToCheckout() method passing information for paypal-express third party checkout provider
	,	redirectToPayPalExpress: function redirectToPayPalExpress ()
		{
			var touchpoints = SiteSettings.getTouchPoints()
			,	continue_url = ModelsInit.session.getAbsoluteUrl('') + (/\/$/.test(ModelsInit.session.getAbsoluteUrl('')) ? touchpoints.checkout.replace('/', '') : touchpoints.checkout )
			,	joint = ~continue_url.indexOf('?') ? '&' : '?';

			continue_url = continue_url + joint + 'paypal=DONE';

			ModelsInit.session.proceedToCheckout({
				cancelurl: touchpoints.viewcart
			,	continueurl: continue_url
			,	createorder: 'F'
			,	type: 'paypalexpress'
			});
		}

		// @method getConfirmation
	,	getConfirmation: function getConfirmation (internalid)
		{
			var confirmation = {internalid: internalid};
			try
			{
				var record = nlapiLoadRecord('salesorder', confirmation.internalid);
				confirmation = this.confirmationCreateResult(record);
			}
			catch (e)
			{
				console.warn('Cart Confirmation could not be loaded, reason: ' + JSON.stringify(e));
			}

			return confirmation;
		}

		// @method confirmationCreateResult
	,	confirmationCreateResult: function confirmationCreateResult (placed_order)
		{

			var self = this
			,	result = {
				internalid: placed_order.getId()
			,	tranid: placed_order.getFieldValue('tranid')
			,	summary: {
					subtotal: Utils.toCurrency(placed_order.getFieldValue('subtotal'))
				,	subtotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('subtotal'))

				,	taxtotal: Utils.toCurrency(placed_order.getFieldValue('taxtotal'))
				,	taxtotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('taxtotal'))

				,	tax2total: Utils.toCurrency(placed_order.getFieldValue('tax2total'))
				,	tax2total_formatted: Utils.formatCurrency(placed_order.getFieldValue('tax2total'))

				,	shippingcost: Utils.toCurrency(placed_order.getFieldValue('shippingcost'))
				,	shippingcost_formatted: Utils.formatCurrency(placed_order.getFieldValue('shippingcost'))

				,	handlingcost: Utils.toCurrency(placed_order.getFieldValue('althandlingcost'))
				,	handlingcost_formatted: Utils.formatCurrency(placed_order.getFieldValue('althandlingcost'))

				,	discounttotal: Utils.toCurrency(placed_order.getFieldValue('discounttotal'))
				,	discounttotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('discounttotal'))

				,	giftcertapplied: Utils.toCurrency(placed_order.getFieldValue('giftcertapplied'))
				,	giftcertapplied_formatted: Utils.formatCurrency(placed_order.getFieldValue('giftcertapplied'))

				,	total: Utils.toCurrency(placed_order.getFieldValue('total'))
				,	total_formatted: Utils.formatCurrency(placed_order.getFieldValue('total'))
				}
			}
			,	i = 0;

			result.promocodes = [];

			var promocode = placed_order.getFieldValue('promocode');

			//If legacy behavior is present & a promocode is applied this IF will be true
			//In case stackable promotions are enable this.record.getFieldValue('promocode') returns null
			if (promocode)
			{
				result.promocodes.push({
					internalid: promocode
				,	code: placed_order.getFieldText('couponcode')
				,	isvalid: true
				,	discountrate_formatted: ''
				});
			}

			for (i = 1; i <= placed_order.getLineItemCount('promotions'); i++)
			{
				if(placed_order.getLineItemValue('promotions', 'applicabilitystatus', i) !== 'NOT_APPLIED')
				{
				result.promocodes.push({
					internalid: placed_order.getLineItemValue('promotions', 'couponcode', i)
				,	code: placed_order.getLineItemValue('promotions', 'couponcode_display', i)
				,	isvalid: placed_order.getLineItemValue('promotions', 'promotionisvalid', i) === 'T'
				,	discountrate_formatted: ''
				});
			}

			}

			result.paymentmethods = [];

			for (i = 1; i <= placed_order.getLineItemCount('giftcertredemption'); i++)
			{
				result.paymentmethods.push({
					type: 'giftcertificate'
				,	giftcertificate: {
							code: placed_order.getLineItemValue('giftcertredemption', 'authcode_display', i)
						,	amountapplied: placed_order.getLineItemValue('giftcertredemption', 'authcodeapplied', i)
						,	amountapplied_formatted: Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'authcodeapplied', i))
						,	amountremaining: placed_order.getLineItemValue('giftcertredemption', 'authcodeamtremaining', i)
						,	amountremaining_formatted: Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'authcodeamtremaining', i))
						,	originalamount: placed_order.getLineItemValue('giftcertredemption', 'giftcertavailable', i)
						,	originalamount_formatted:  Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'giftcertavailable', i))
					}
				});
			}

			result.lines = [];
			for (i = 1; i <= placed_order.getLineItemCount('item'); i++)
			{

				var line_item = {
						item: {
							id: placed_order.getLineItemValue('item', 'item', i)
						,	type: placed_order.getLineItemValue('item', 'itemtype', i)
						}
					,	quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)
						,	rate: parseInt(placed_order.getLineItemValue('item', 'rate', i), 10)
					,	options: self.parseLineOptionsFromSuiteScript(placed_order.getLineItemValue('item', 'options', i))
				};

				if (self.isPickupInStoreEnabled)
				{
					if (placed_order.getLineItemValue('item', 'itemfulfillmentchoice', i) === '1')
					{
						line_item.fulfillmentChoice = 'ship';
					}
					else if (placed_order.getLineItemValue('item', 'itemfulfillmentchoice', i) === '2')
					{
						line_item.fulfillmentChoice = 'pickup';
					}
				}

				result.lines.push(line_item);
			}

			StoreItem.preloadItems(_(result.lines).pluck('item'));

			_.each(result.lines, function (line)
			{
				line.item = StoreItem.get(line.item.id, line.item.type);
			});

			return result;
		}

		// @method backFromPayPal
	,	backFromPayPal: function backFromPayPal ()
		{
			var customer_values = Profile.get()
			,	bill_address = ModelsInit.order.getBillingAddress()
			,	ship_address = ModelsInit.order.getShippingAddress();

			if (customer_values.isGuest === 'T' && ModelsInit.session.getSiteSettings(['registration']).registration.companyfieldmandatory === 'T')
			{
				customer_values.companyname = 'Guest Shopper';
				ModelsInit.customer.updateProfile(customer_values);
			}

			if (ship_address.internalid && ship_address.isvalid === 'T' && !bill_address.internalid)
			{
				ModelsInit.order.setBillingAddress(ship_address.internalid);
			}

			ModelsInit.context.setSessionObject('paypal_complete', 'T');
		}

		// @method removePaypalAddress remove the shipping address or billing address if phone number is null.
		// This is because addresses are not valid created by Paypal.
		// @param {Object} paypal_address
	,	removePaypalAddress: function removePaypalAddress (paypal_address)
		{
			try
			{
				if (SC.Configuration.removePaypalAddress && paypal_address && paypal_address.internalid)
				{
					ModelsInit.customer.removeAddress(paypal_address.internalid);
				}
			}
			catch (e)
			{
				// ignore this exception, it is only for the cases that we can't remove pay-pal's address.
				// This exception will not send to the front-end
				var error = Application.processError(e);
				console.warn('Error ' + error.errorStatusCode + ': ' + error.errorCode + ' - ' + error.errorMessage);
			}
		}

		// @method addLine
		// @param {LiveOrder.Model.Line} line_data
	,	addLine: function addLine (line_data)
		{
			var item = {
				internalid: line_data.item.internalid.toString()
			,	quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
			,	options: this.parseLineOptionsToCommerceAPI(line_data.options)
			};

			if (this.isPickupInStoreEnabled && line_data.fulfillmentChoice === 'pickup' && line_data.location)
			{
				item.fulfillmentPreferences = {
					fulfillmentChoice: 'pickup'
				,	pickupLocationId: parseInt(line_data.location, 10)
				};
			}

			// Adds the line to the order
			var line_id = ModelsInit.order.addItem(item);

			if (this.isMultiShippingEnabled && line_data.fulfillmentChoice !== 'pickup')
			{
				// Sets it ship address (if present)
				line_data.shipaddress && ModelsInit.order.setItemShippingAddress(line_id, line_data.shipaddress);

				// Sets it ship method (if present)
				line_data.shipmethod && ModelsInit.order.setItemShippingMethod(line_id, line_data.shipmethod);
			}

			// Stores the latest addition
			ModelsInit.context.setSessionObject('latest_addition', line_id);

			// Stores the current order
			var lines_sort = this.getLinesSort();

			lines_sort.unshift(line_id);

			this.setLinesSort(lines_sort);

			return line_id;
		}

		// @method addLines
		// @param {Array<LiveOrder.Model.Line>} lines_data
	,	addLines: function addLines (lines_data)
		{
			var items = []
			,	self = this;

			if(this.isAutoapplyPromotionsEnabled)
			{
				this.setOldPromocodes();
			}

			_.each(lines_data, function (line_data)
			{
				var item = {
						internalid: line_data.item.internalid.toString()
					,	quantity:  _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
					,	options: self.parseLineOptionsToCommerceAPI(line_data.options)
				};

				if (self.isPickupInStoreEnabled && line_data.fulfillmentChoice === 'pickup' && line_data.location)
				{
					item.fulfillmentPreferences = {
						fulfillmentChoice: 'pickup'
					,	pickupLocationId: parseInt(line_data.location, 10)
					};
				}

				items.push(item);
			});

			var lines_ids = ModelsInit.order.addItems(items)
			,	latest_addition = _.last(lines_ids).orderitemid
			// Stores the current order
			,	lines_sort = this.getLinesSort();

			lines_sort.unshift(latest_addition);
			this.setLinesSort(lines_sort);

			ModelsInit.context.setSessionObject('latest_addition', latest_addition);

			return lines_ids;
		}

		// @method removeLine
		// @param {String} line_id
	,	removeLine: function removeLine (line_id)
		{
			if(this.isAutoapplyPromotionsEnabled)
			{
				this.setOldPromocodes();
			}
			// Removes the line
			ModelsInit.order.removeItem(line_id);

			// Stores the current order
			var lines_sort = this.getLinesSort();
			lines_sort = _.without(lines_sort, line_id);
			this.setLinesSort(lines_sort);
		}

		// @method updateLine
		// @param {String} line_id
		// @param {LiveOrder.Model.Line} line_data
	,	updateLine: function updateLine (line_id, line_data)
		{
			var lines_sort = this.getLinesSort()
			,	current_position = _.indexOf(lines_sort, line_id)
			,	original_line_object = ModelsInit.order.getItem(line_id, [
					'quantity'
				,	'internalid'
				,	'options'
				,	'fulfillmentPreferences'
			]);

			this.removeLine(line_id);

			if (!_.isNumber(line_data.quantity) || line_data.quantity > 0)
			{
				var new_line_id;

				try
				{
					new_line_id = this.addLine(line_data);
				}
				catch (e)
				{
					// we try to roll back the item to the original state
					var roll_back_item = {
						item: {
							internalid: parseInt(original_line_object.internalid, 10)
						}
					,	quantity: parseInt(original_line_object.quantity, 10)
					};

					if (original_line_object.options && original_line_object.options.length)
					{
						roll_back_item.options = {};
						_.each(original_line_object.options, function (option)
						{
							roll_back_item.options[option.id.toLowerCase()] = option.value;
						});
					}

					new_line_id = this.addLine(roll_back_item);

					e.errorDetails = {
						status: 'LINE_ROLLBACK'
					,	oldLineId: line_id
					,	newLineId: new_line_id
					};

					throw e;
				}

				lines_sort = _.without(lines_sort, line_id, new_line_id);
				lines_sort.splice(current_position, 0, new_line_id);
				this.setLinesSort(lines_sort);
			}
		}

		// @method splitLines
		// @param {LiveOrder.Model.Line} data
		// @param current_order
	,	splitLines: function splitLines (data, current_order)
		{
			_.each(data.lines, function (line)
			{
				if (line.splitquantity)
				{
					var splitquantity = typeof line.splitquantity === 'string' ? parseInt(line.splitquantity,10) : line.splitquantity
					,	original_line = _.find(current_order.lines, function (order_line)
						{
							return order_line.internalid === line.internalid;
						})
					,	remaining = original_line ? (original_line.quantity - splitquantity) : -1;

					if (remaining > 0 && splitquantity > 0)
					{
						ModelsInit.order.splitItem({
							'orderitemid' : original_line.internalid
						,	'quantities': [
								splitquantity
							,	remaining
							]
						});
					}
				}
			});
		}

		// @method getFieldValues
		// @param {Array<String>} requested_field_keys To override field_keys got from configuration
		// @returns {Array<String>}
	,	getFieldValues: function (requested_field_keys)
		{
			var order_field_keys = {}
			,	isCheckout = Utils.isInCheckout(request) && ModelsInit.session.isLoggedIn2()
			,	field_keys = isCheckout ? SC.Configuration.orderCheckoutFieldKeys : SC.Configuration.orderShoppingFieldKeys;

			if (requested_field_keys)
			{
				field_keys = {
					keys: requested_field_keys.keys || field_keys.keys
				,	items: requested_field_keys.items || field_keys.items
				};
			}

			order_field_keys.items = field_keys.items;

			_.each(field_keys.keys, function (key)
			{
				order_field_keys[key] = null;
			});

			if (this.isMultiShippingEnabled)
			{
				if (!_.contains(order_field_keys.items, 'shipaddress'))
				{
					order_field_keys.items.push('shipaddress');
				}
				if (!_.contains(order_field_keys.items, 'shipmethod'))
				{
					order_field_keys.items.push('shipmethod');
				}
				order_field_keys.ismultishipto = null;
			}

			if (this.isPickupInStoreEnabled)
			{
				if (!_.contains(order_field_keys.items, 'fulfillmentPreferences'))
				{
					order_field_keys.items.push('fulfillmentPreferences');
				}
			}

			return ModelsInit.order.getFieldValues(order_field_keys, false);
		}
		//@method removeAllPromocodes Removes all the promocodes or the ones passed by parameter
		//@param {Array<LiveOrder.Model.PromoCode>} promocodes_to_remove List of promocodes that will removed
		//@return {Void}
	,	removeAllPromocodes: function removeAllPromocodes (promocodes_to_remove)
		{
			if (promocodes_to_remove)
			{
				_.each(promocodes_to_remove, function (promo)
				{
					ModelsInit.order.removePromotionCode(promo.code);
				});
			}
			else
			{
				ModelsInit.order.removeAllPromotionCodes();
			}
		}

		// @method getPromoCodes
		// @param {Object} order_fields
		// @return {Array<LiveOrder.Model.PromoCode>}
	,	getPromoCodes: function getPromoCodes (order_fields)
		{
			var result = [];

			var self = this;

			if (order_fields.promocodes && order_fields.promocodes.length)
			{
				_.each(order_fields.promocodes, function (promo_code)
				{
					// @class LiveOrder.Model.PromoCode
					var promocode = {
						// @property {String} internalid
						internalid: promo_code.internalid
						// @property {String} code
					,	code: promo_code.promocode
						// @property {Boolean} isvalid
					,	isvalid: promo_code.isvalid === 'T'
						// @property {String} discountrate_formatted
					,	discountrate_formatted: ''
					,	errormsg : promo_code.errormsg
					,	name: promo_code.discount_name
					,	rate: promo_code.discount_rate
					,	type: promo_code.discount_type
					};

					if(self.isAutoapplyPromotionsEnabled)
					{
						// @property {Boolean} isautoapplied
						promocode.isautoapplied = promo_code.is_auto_applied;
						// @property {String} applicabilitystatus
						promocode.applicabilitystatus = (promo_code.applicability_status) ? promo_code.applicability_status : '';
						// @property {String} applicabilityreason
						promocode.applicabilityreason = (promo_code.applicability_reason) ? promo_code.applicability_reason : '';

						if (promo_code.applicability_status !== 'NOT_AVAILABLE' && !_.isUndefined(self.old_promocodes))
						{
							var old_promocode = (self.old_promocodes) ? _.find(self.old_promocodes, function (old_promo_code){ return old_promo_code.internalid === promo_code.internalid; }) : '';
							
							if (!old_promocode || old_promocode.applicability_status !== promo_code.applicability_status || (!promo_code.is_auto_applied && promo_code.applicability_reason !== old_promocode.applicability_reason))
							{
								promocode.notification = true;
							}
						}
					}

					result.push(promocode);
				});

				if(this.isAutoapplyPromotionsEnabled)
				{
					delete this.old_promocodes;
				}
			}

			return result;
		}

		// @method getAutomaticallyRemovedPromocodes
		// @param {Object} order_fields
		// @return {Array<LiveOrder.Model.PromoCode>}
	,	getAutomaticallyRemovedPromocodes: function getAutomaticallyRemovedPromocodes(current_order)
		{
			var latest_promocodes = _.pluck(_.where(ModelsInit.order.getFieldValues(['promocodes']).promocodes, {isvalid:'T'}) ,'promocode')
			,	current_promocodes = _.pluck(_.where(current_order.promocodes,{isvalid:true}), 'code')
			,	removed_promocodes = _.difference(current_promocodes, latest_promocodes);

			return _.filter(current_order.promocodes, function (promocode)
			{
				return _.indexOf(removed_promocodes, promocode.code) >= 0;
			});
		}

		// @method setPromoCodes
		// @param {LiveOrder.Model.Data} data Received data from the service
		// @param {LiveOrder.Model.Data} current_order Returned data
		// @param current_order
	,	setPromoCodes: function setPromoCodes (data, current_order)
		{
			var self = this
			,	only_in_current_order = _.filter(current_order.promocodes, function (promocode){
				return !_.findWhere(data.promocodes, {'code': promocode.code});
			})
			,	only_in_data = _.filter(data.promocodes, function (promocode){
				return !_.findWhere(current_order.promocodes, {'code': promocode.code});
			});

			this.removeAllPromocodes(only_in_current_order);

			data.promocodes = data.promocodes || [];

			var valid_promocodes = _.filter(only_in_data, function (promocode)
			{
				return promocode.isvalid !== false;
			});

			if (!SC.Configuration.get('promocodes.allowMultiples', true) && valid_promocodes.length > 1)
			{
				valid_promocodes = [valid_promocodes[0]];
			}
			else
			{
				valid_promocodes = only_in_data;
			}

			_.each(valid_promocodes, function (promo)
			{
				try
				{
					ModelsInit.order.applyPromotionCode(promo.code);
				}
				catch (e)
				{
					var order_fields = self.getFieldValues()
					,	promos = self.getPromoCodes(order_fields)
					,	is_in_current_order = !!_.find(promos, function (p)
						{
							return promo.code === p.code;
						});

					if (e.code === 'ERR_WS_INVALID_COUPON' && !is_in_current_order)
					{
						throw e;
					}
				}
			});
		}

		// @method getMultiShipMethods
		// @param {Array<LiveOrder.Model.Line>} lines
	,	getMultiShipMethods: function getMultiShipMethods (lines)
		{
			// Get multi ship methods
			var multishipmethods = {};

			_.each(lines, function (line)
			{
				if (line.shipaddress)
				{
					multishipmethods[line.shipaddress] = multishipmethods[line.shipaddress] || [];

					multishipmethods[line.shipaddress].push(line.internalid);
				}
			});

			_.each(_.keys(multishipmethods), function (address)
			{
				var methods = ModelsInit.order.getAvailableShippingMethods(multishipmethods[address], address);

				_.each(methods, function (method)
				{
					method.internalid = method.shipmethod;
					method.rate_formatted = Utils.formatCurrency(method.rate);
					delete method.shipmethod;
				});

				multishipmethods[address] = methods;
			});

			return multishipmethods;
		}

		// @method getShipMethods
		// @param {Array<String>} order_fields
		// @returns {Array<OrderShipMethod>}
	,	getShipMethods: function getShipMethods (order_fields)
		{
			var shipmethods = _.map(order_fields.shipmethods, function (shipmethod)
			{
				var rate = Utils.toCurrency(shipmethod.rate.replace( /^\D+/g, '')) || 0;

				return {
					internalid: shipmethod.shipmethod
				,	name: shipmethod.name
				,	shipcarrier: shipmethod.shipcarrier
				,	rate: rate
				,	rate_formatted: shipmethod.rate
				};
			});

			return shipmethods;
		}

		// @method getLinesSort
		// @returns {Array<String>}
	,	getLinesSort: function getLinesSort ()
		{
			return ModelsInit.context.getSessionObject('lines_sort') ? ModelsInit.context.getSessionObject('lines_sort').split(',') : [];
		}

		// @method getPaymentMethods
		// @param {Array<String>} order_fields
		// @returns {Array<ShoppingSession.PaymentMethod>}
	,	getPaymentMethods: function getPaymentMethods (order_fields)
		{
			var paymentmethods = []
			,	giftcertificates = ModelsInit.order.getAppliedGiftCertificates()
			,	payment = order_fields && order_fields.payment
			,	paypal = payment && _.findWhere(ModelsInit.session.getPaymentMethods(), {ispaypal: 'T'})
			,	credit_card = payment && payment.creditcard;

			if (credit_card && credit_card.paymentmethod && credit_card.paymentmethod.creditcard === 'T')
			{
				// Main
				paymentmethods.push({
					type: 'creditcard'
				,	primary: true
				,	creditcard: {
						internalid: credit_card.internalid || '-temporal-'
					,	ccnumber: credit_card.ccnumber
					,	ccname: credit_card.ccname
					,	ccexpiredate: credit_card.expmonth + '/' + credit_card.expyear
					,	ccsecuritycode: credit_card.ccsecuritycode
					,	expmonth: credit_card.expmonth
					,	expyear: credit_card.expyear
					,	paymentmethod: {
							internalid: credit_card.paymentmethod.internalid
						,	name: credit_card.paymentmethod.name
						,	creditcard: credit_card.paymentmethod.creditcard === 'T'
						,	ispaypal: credit_card.paymentmethod.ispaypal === 'T'
						,	isexternal: credit_card.paymentmethod.isexternal === 'T'
						,	key: credit_card.paymentmethod.key
						}
					}
				});
			}
			else if (paypal && payment.paymentmethod === paypal.internalid)
			{
				paymentmethods.push({
					type: 'paypal'
				,	primary: true
				,	complete: ModelsInit.context.getSessionObject('paypal_complete') === 'T'
				,	internalid: paypal.internalid
				,	name: paypal.name
				,	creditcard: paypal.creditcard === 'T'
				,	ispaypal: paypal.ispaypal === 'T'
				,	isexternal: paypal.isexternal === 'T'
				,	key: paypal.key
				});
			}
			else if (credit_card && credit_card.paymentmethod && credit_card.paymentmethod.isexternal === 'T')
			{
				paymentmethods.push({
					type: 'external_checkout_' + credit_card.paymentmethod.key
				,	primary: true
				,	internalid: credit_card.paymentmethod.internalid
				,	name: credit_card.paymentmethod.name
				,	creditcard: credit_card.paymentmethod.creditcard === 'T'
				,	ispaypal: credit_card.paymentmethod.ispaypal === 'T'
				,	isexternal: credit_card.paymentmethod.isexternal === 'T'
				,	key: credit_card.paymentmethod.key
				,	errorurl: payment.errorurl
				,	thankyouurl: payment.thankyouurl
				});
			}
			else if (order_fields.payment && order_fields.payment.paymentterms === 'Invoice')
			{
				var customer_invoice = ModelsInit.customer.getFieldValues([
					'paymentterms'
				,	'creditlimit'
				,	'balance'
				,	'creditholdoverride'
				]);

				paymentmethods.push({
					type: 'invoice'
				,	primary: true
				,	paymentterms: customer_invoice.paymentterms
				,	creditlimit: parseFloat(customer_invoice.creditlimit || 0)
				,	creditlimit_formatted: Utils.formatCurrency(customer_invoice.creditlimit)
				,	balance: parseFloat(customer_invoice.balance || 0)
				,	balance_formatted: Utils.formatCurrency(customer_invoice.balance)
				,	creditholdoverride: customer_invoice.creditholdoverride
				});
			}

			if (giftcertificates && giftcertificates.length)
			{
				_.forEach(giftcertificates, function (giftcertificate)
				{
					paymentmethods.push({
						type: 'giftcertificate'
					,	giftcertificate: {
							code: giftcertificate.giftcertcode

						,	amountapplied: Utils.toCurrency(giftcertificate.amountapplied || 0)
						,	amountapplied_formatted: Utils.formatCurrency(giftcertificate.amountapplied || 0)

						,	amountremaining: Utils.toCurrency(giftcertificate.amountremaining || 0)
						,	amountremaining_formatted: Utils.formatCurrency(giftcertificate.amountremaining || 0)

						,	originalamount: Utils.toCurrency(giftcertificate.originalamount || 0)
						,	originalamount_formatted: Utils.formatCurrency(giftcertificate.originalamount || 0)
						}
					});
				});
			}

			return paymentmethods;
		}

		// @method getTransactionBodyField
		// @returns {Object}
	,	getTransactionBodyField: function getTransactionBodyField ()
		{
			var options = {};

			if (this.isSecure)
			{
				var fieldsIdToBeExposed = CustomFieldsUtils.getCustomFieldsIdToBeExposed('salesorder');
				_.each(ModelsInit.order.getCustomFieldValues(), function (option)
				{
					//expose the custom field value if was configured in the backend configuration
					if(_.find(fieldsIdToBeExposed, function (fieldIdToBeExposed){ return option.name === fieldIdToBeExposed;}))
					{
						options[option.name] = (option.value.indexOf(String.fromCharCode(5)) !== -1) ?  option.value.split(String.fromCharCode(5)) : option.value;
					}
				});
			}
			return options;
		}

		// @method getAddresses
		// @param {Array<String>} order_fields
		// @returns {Array<OrderAddress>}
	,	getAddresses: function getAddresses (order_fields)
		{
			var self = this
			,	addresses = {}
			,	address_book = ModelsInit.session.isLoggedIn2() && this.isSecure ? ModelsInit.customer.getAddressBook() : [];

			address_book = _.object(_.pluck(address_book, 'internalid'), address_book);
			// General Addresses
			if (order_fields.ismultishipto === 'T')
			{
				_.each(order_fields.items || [], function (line)
				{
					if (line.shipaddress && !addresses[line.shipaddress])
					{
						self.addAddress(address_book[line.shipaddress], addresses);
					}
				});
			}
			else
			{
				this.addAddress(order_fields.shipaddress, addresses);
			}

			this.addAddress(order_fields.billaddress, addresses);

			return _.values(addresses);
		}

		// @method getLines Set Order Lines into the result. Standardizes the result of the lines
		// @param {Object} order_fields
		// @returns {Array<LiveOrder.Model.Line>}
	,	getLines: function getLines (order_fields)
		{
			var lines = [];
			if (order_fields.items && order_fields.items.length)
			{
				var self = this
				,	items_to_preload = []
				,	address_book = ModelsInit.session.isLoggedIn2() && this.isSecure ? ModelsInit.customer.getAddressBook() : []
				,	item_ids_to_clean = [];

				address_book = _.object(_.pluck(address_book, 'internalid'), address_book);

				_.each(order_fields.items, function (original_line)
				{
					// Total may be 0
					var	total = (original_line.promotionamount) ? Utils.toCurrency(original_line.promotionamount) : Utils.toCurrency(original_line.amount)
					,	discount = Utils.toCurrency(original_line.promotiondiscount) || 0
					,	line_to_add;

					// @class LiveOrder.Model.Line represents a line in the LiveOrder
					line_to_add = {
						// @property {String} internalid
						internalid: original_line.orderitemid
						// @property {Number} quantity
					,	quantity: original_line.quantity
						// @property {Number} rate
					,	rate: parseFloat(original_line.rate)
						// @property {String} rate_formatted
					,	rate_formatted: original_line.rate_formatted
						// @property {Number} amount
					,	amount: Utils.toCurrency(original_line.amount)
						// @property {String} tax_rate1
					,	tax_rate1: original_line.taxrate1
						// @property {String} tax_type1
					,	tax_type1: original_line.taxtype1
						// @property {String} tax_rate2
					,	tax_rate2: original_line.taxrate2
						// @property {String} tax_type2
					,	tax_type2: original_line.taxtype2
						// @property {Number} tax1_amount
					,	tax1_amount: original_line.tax1amt
						// @property {String} tax1_amount_formatted
					,	tax1_amount_formatted: Utils.formatCurrency(original_line.tax1amt)
						// @property {Number} discount
					,	discount: discount
						// @property {Number} total
					,	total: total
						// @property {String} item internal id of the line's item
					,	item: original_line.internalid
						// @property {String} itemtype
					,	itemtype: original_line.itemtype
						// @property {Array<LiveOrder.Model.Line.Option>} options
					,	options: self.parseLineOptionsFromCommerceAPI(original_line.options)
						// @property {OrderAddress} shipaddress
					,	shipaddress: original_line.shipaddress
						// @property {OrderShipMethod} shipmethod
					,	shipmethod: original_line.shipmethod

						// @property {Array<DiscountsImpact>} discounts_impact
					,	discounts_impact: original_line.discounts_impact
					};

					if (self.isPickupInStoreEnabled && original_line.fulfillmentPreferences)
					{
						// @property {Number} location
						line_to_add.location = original_line.fulfillmentPreferences.pickupLocationId;
						// @property {String} fulfillmentChoice
						line_to_add.fulfillmentChoice = original_line.fulfillmentPreferences.fulfillmentChoice;
					}

					// @class LiveOrder.Model

					lines.push(line_to_add);

					if (line_to_add.shipaddress && !address_book[line_to_add.shipaddress])
					{
						line_to_add.shipaddress = null;
						line_to_add.shipmethod = null;
						item_ids_to_clean.push(line_to_add.internalid);
					}
					else
					{
						items_to_preload.push({
							id: original_line.internalid
						,	type: original_line.itemtype
						});
					}
				});

				if (item_ids_to_clean.length)
				{
					ModelsInit.order.setItemShippingAddress(item_ids_to_clean, null);
					ModelsInit.order.setItemShippingMethod(item_ids_to_clean, null);
				}

				var	restart = false;

				StoreItem.preloadItems(items_to_preload);

				lines.forEach(function (line)
				{
					line.item = StoreItem.get(line.item, line.itemtype);

					if (!line.item)
					{
						self.removeLine(line.internalid);
						restart = true;
					}
					else
					{
						line.rate_formatted = Utils.formatCurrency(line.rate);
						line.amount_formatted = Utils.formatCurrency(line.amount);
						line.tax_amount_formatted = Utils.formatCurrency(line.tax_amount);
						line.discount_formatted = Utils.formatCurrency(line.discount);
						line.total_formatted = Utils.formatCurrency(line.total);
					}
				});

				if (restart)
				{
					throw {code: 'ERR_CHK_ITEM_NOT_FOUND'};
				}

				// Sort the items in the order they were added, this is because the update operation alters the order
				var lines_sort = this.getLinesSort();

				if (lines_sort.length)
				{
					lines = _.sortBy(lines, function (line)
					{
						return _.indexOf(lines_sort, line.internalid);
					});
				}
				else
				{
					this.setLinesSort(_.pluck(lines, 'internalid'));
				}
			}

			return lines;
		}
		//@method getLinesOnly returns only the lines of the order without requesting unnecessary data
		//@return {Array<LiveOrder.Model.Line>}
	,	getLinesOnly: function getLinesOnly()
		{
			var field_values = this.getFieldValues({
				keys: []
			,	items: null
			});
			return this.getLines(field_values);
		}
		//@method getSummary gives the summary of the order requesting only the needed data
		//@return {Object} An object containing the summary
	,	getSummary: function getSummary()
		{
			var summary = this.getFieldValues({
				keys: ['summary']
			,	items: []
			}).summary;
			return _.clone(summary);
		}
		//@method parseLineOptionsToCommerceAPI Given the list of options from he Front-end it parsed to the particular CommerceAPI format
		//@param {Array<LiveOrder.Model.Line.Option>} options
		//@return {Object} An object used as a dictionary where each key is the cart option id and the values are the option's value internalid
	,	parseLineOptionsToCommerceAPI: function parseLineOptionsToCommerceAPI (options)
		{
			var result = {};
			_.each(options || [], function (option)
			{
				if (option && option.value && option.cartOptionId)
				{
					result[option.cartOptionId] = option.value.internalid;
				}
			});
			return result;
		}
		//@method parseLineOptionsFromCommerceAPI
		//@param {Array<CommerceAPI.LineOption>} options
		//@return {Array<LiveOrder.Model.Line.Option>}
	,	parseLineOptionsFromCommerceAPI: function parseLineOptionsFromCommerceAPI (options)
		{
			//@class CommerceAPI.LineOption
			//@property {String} displayvalue
			//@property {String} id
			//@property {String} name
			//@property {String} value

			return _.map(options, function (option)
			{
				var option_label =  Utils.trim(option.name);

				option_label = Utils.stringEndsWith(option_label, ':') ? option_label.substr(0, option_label.length - 1) : option_label;

				//@class LiveOrder.Model.Line.Option
				return {
					//@property {LiveOrder.Model.Line.Option.Value} value
					//@class LiveOrder.Model.Line.Option.Value
					value:
					{
						//@property {String} label Name of the value selected in case of select or the entered string
						label: option.displayvalue
						//@property {String} internalid
					,	internalid: option.value
					}
					//@class LiveOrder.Model.Line.Option
					//@property {String} cartOptionId
				,	cartOptionId: option.id.toLowerCase()
					//@property {String} label
				,	label: option_label
				};
			});

			//@class LiveOrder.Model
		}

		// @method parseLineOptionsFromSuiteScript
		// @param {String} options
	,	parseLineOptionsFromSuiteScript: function parseLineOptionsFromSuiteScript (options_string)
		{
			var options_object = [];

			if (options_string && options_string !== '- None -')
			{
				var split_char_3 = String.fromCharCode(3)
				,	split_char_4 = String.fromCharCode(4);

				_.each(options_string.split(split_char_4), function (option_line)
				{
					option_line = option_line.split(split_char_3);

					//@class Transaction.Model.Get.Line.Option
					options_object.push({
						//@property {String} cartOptionId
						cartOptionId: option_line[0].toLowerCase()
						//@property {String} label
					,	label: option_line[2]
						//@property {Transaction.Model.Get.Line.Option.Value} value
					,	value: {
							//@class Transaction.Model.Get.Line.Option.Value
							//@property {String} label
							label: option_line[4]
							//@property {String} internalid
						,	internalid: option_line[3]
						}
						//@class Transaction.Model.Get.Line.Option
						//@property {Boolean} mandatory
					,	ismandatory: option_line[1]	=== 'T'
					});
				});
			}
			//@class LiveOrder.Model

			return options_object;
		}

		// @method getIsMultiShipTo @param {Array<String>} order_fields @returns {Boolean}
	,	getIsMultiShipTo: function getIsMultiShipTo (order_fields)
		{
			return this.isMultiShippingEnabled && order_fields.ismultishipto === 'T';
		}

		// @method setLinesSort
		// @param {String} lines_sort
		// @returns {String}
	,	setLinesSort: function setLinesSort (lines_sort)
		{
			return ModelsInit.context.setSessionObject('lines_sort', lines_sort || []);
		}

		// @method setBillingAddress
		// @param data
		// @param {LiveOrder.Model.Data} current_order
	,	setBillingAddress: function setBillingAddress (data, current_order)
		{
			if (data.sameAs)
			{
				data.billaddress = data.shipaddress;
			}

			if (data.billaddress !== current_order.billaddress)
			{
				if (data.billaddress)
				{
					if (data.billaddress && !~data.billaddress.indexOf('null'))
					{
						// Heads Up!: This "new String" is to fix a nasty bug
						ModelsInit.order.setBillingAddress(new String(data.billaddress).toString());
					}
				}
				else if (this.isSecure)
				{
					ModelsInit.order.removeBillingAddress();
				}
			}
		}

		// @method setShippingAddressAndMethod
		// @param {LiveOrder.Model.Data} data
		// @param current_order
	,	setShippingAddressAndMethod: function setShippingAddressAndMethod (data, current_order)
		{
			var current_package
			,	packages = {}
			,	item_ids_to_clean = []
			,	original_line;

			_.each(data.lines, function (line)
			{
				original_line = _.find(current_order.lines, function (order_line)
				{
					return order_line.internalid === line.internalid;
				});

				if (original_line && original_line.item && original_line.item.isfulfillable !== false)
				{
					if (line.shipaddress)
					{
						packages[line.shipaddress] = packages[line.shipaddress] || {
							shipMethodId: null
						,	itemIds: []
						};

						packages[line.shipaddress].itemIds.push(line.internalid);
						if (!packages[line.shipaddress].shipMethodId && line.shipmethod)
						{
							packages[line.shipaddress].shipMethodId = line.shipmethod;
						}
					}
					else
					{
						item_ids_to_clean.push(line.internalid);
					}
				}
			});

			//CLEAR Shipping address and shipping methods
			if (item_ids_to_clean.length)
			{
				ModelsInit.order.setItemShippingAddress(item_ids_to_clean, null);
				ModelsInit.order.setItemShippingMethod(item_ids_to_clean, null);
			}

			//SET Shipping address and shipping methods
			_.each(_.keys(packages), function (address_id)
			{
				current_package = packages[address_id];
				ModelsInit.order.setItemShippingAddress(current_package.itemIds, parseInt(address_id, 10));

				if (current_package.shipMethodId)
				{
					ModelsInit.order.setItemShippingMethod(current_package.itemIds, parseInt(current_package.shipMethodId, 10));
				}
			});
		}

		// @method setShippingAddress
		// @param {LiveOrder.Model.Data} data
		// @param current_order
	,	setShippingAddress: function setShippingAddress (data, current_order)
		{
			if (data.shipaddress !== current_order.shipaddress)
			{
				if (data.shipaddress)
				{
					if (this.isSecure && !~data.shipaddress.indexOf('null'))
					{
						// Heads Up!: This "new String" is to fix a nasty bug
						ModelsInit.order.setShippingAddress(new String(data.shipaddress).toString());
					}
					else
					{
						var address = _.find(data.addresses, function (address)
						{
							return address.internalid === data.shipaddress;
						});

						address && ModelsInit.order.estimateShippingCost(address);
					}
				}
				else if (this.isSecure)
				{
					ModelsInit.order.removeShippingAddress();
				}
				else
				{
					ModelsInit.order.estimateShippingCost({
						zip: null
					,	country: null
					});
					ModelsInit.order.removeShippingMethod();
				}
			}
		}
		// @method setPurchaseNumber
		// @param {LiveOrder.Model.Data} data
	,	setPurchaseNumber: function setPurchaseNumber (data)
		{
			if(ModelsInit.session.isLoggedIn2())
			{
				if (data && data.purchasenumber)
				{
					ModelsInit.order.setPurchaseNumber(data.purchasenumber);
				}
				else
				{
					ModelsInit.order.removePurchaseNumber();
				}
			}
		}

		// @method setPaymentMethods
		// @param {LiveOrder.Model.Data} data
	,	setPaymentMethods: function setPaymentMethods (data)
		{
			// Because of an api issue regarding Gift Certificates, we are going to handle them separately
			var gift_certificate_methods = _.where(data.paymentmethods, {type: 'giftcertificate'})
			,	non_certificate_methods = _.difference(data.paymentmethods, gift_certificate_methods);

			// Payment Methods non gift certificate
			if (this.isSecure && non_certificate_methods && non_certificate_methods.length && ModelsInit.session.isLoggedIn2())
			{
				_.each(non_certificate_methods, function (paymentmethod)
				{
					if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard)
					{

						var credit_card = paymentmethod.creditcard
						,	require_cc_security_code = ModelsInit.session.getSiteSettings(['checkout']).checkout.requireccsecuritycode === 'T'
						,	cc_obj = credit_card && {
										ccnumber: credit_card.ccnumber
									,	ccname: credit_card.ccname
									,	ccexpiredate: credit_card.ccexpiredate
									,	expmonth: credit_card.expmonth
									,	expyear:  credit_card.expyear
									,	paymentmethod: {
											internalid: credit_card.paymentmethod.internalid
										,	name: credit_card.paymentmethod.name
										,	creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F'
										,	ispaypal:  credit_card.paymentmethod.ispaypal ? 'T' : 'F'
										,	key: credit_card.paymentmethod.key
										}
									};
						if (credit_card.internalid !== '-temporal-')
						{
							cc_obj.internalid = credit_card.internalid;
						}
						else
						{
							cc_obj.internalid = null;
							cc_obj.savecard = 'F';
						}

						if (credit_card.ccsecuritycode)
						{
							cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
						}

						if (!require_cc_security_code || require_cc_security_code && credit_card.ccsecuritycode)
						{
							// the user's default credit card may be expired so we detect this using try & catch and if it is we remove the payment methods.
							try
							{
								// if the credit card is not temporal or it is temporal and the number is complete then set payment method.
								if (cc_obj.internalid || (!cc_obj.internalid && !~cc_obj.ccnumber.indexOf('*') ) )
								{
								ModelsInit.order.removePayment();

								ModelsInit.order.setPayment({
									paymentterms: 'CreditCard'
								,	creditcard: cc_obj
								,	paymentmethod: cc_obj.paymentmethod.key
								});

								ModelsInit.context.setSessionObject('paypal_complete', 'F');
							}
							}
							catch (e)
							{
								if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
								{
									ModelsInit.order.removePayment();
								}
								throw e;
							}

						}
						// if the the given credit card don't have a security code and it is required we just remove it from the order
						else if (require_cc_security_code && !credit_card.ccsecuritycode)
						{
							ModelsInit.order.removePayment();
						}
					}
					else if (paymentmethod.type === 'invoice')
					{
						ModelsInit.order.removePayment();

						try
						{
							ModelsInit.order.setPayment({ paymentterms: 'Invoice' });
						}
						catch (e)
						{
							if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
							{
								ModelsInit.order.removePayment();
							}
							throw e;
						}

						ModelsInit.context.setSessionObject('paypal_complete', 'F');
					}
					else if (paymentmethod.type === 'paypal')
					{
						if (ModelsInit.context.getSessionObject('paypal_complete') !== 'T')
						{
							ModelsInit.order.removePayment();
							var paypal = _.findWhere(ModelsInit.session.getPaymentMethods(), {ispaypal: 'T'});
							paypal && ModelsInit.order.setPayment({paymentterms: '', paymentmethod: paypal.key});
						}

					}
					else if (paymentmethod.type && ~paymentmethod.type.indexOf('external_checkout'))
					{
						ModelsInit.order.removePayment();

						ModelsInit.order.setPayment({
								paymentmethod: paymentmethod.key
							,	thankyouurl: paymentmethod.thankyouurl
							,	errorurl: paymentmethod.errorurl
						});
					}
					else
					{
						ModelsInit.order.removePayment();
					}
				});
			}
			else if (this.isSecure && ModelsInit.session.isLoggedIn2())
			{
				ModelsInit.order.removePayment();
			}

			gift_certificate_methods = _.map(gift_certificate_methods, function (gift_certificate)
			{
				return gift_certificate.giftcertificate;
			});

			this.setGiftCertificates(gift_certificate_methods);
		}

		// @method setGiftCertificates
		// @param {Array<Object>} gift_certificates
	,	setGiftCertificates: function setGiftCertificates (gift_certificates)
		{
			// Remove all gift certificates so we can re-enter them in the appropriate order
			ModelsInit.order.removeAllGiftCertificates();

			_.forEach(gift_certificates, function (gift_certificate)
			{
				ModelsInit.order.applyGiftCertificate(gift_certificate.code);
			});
		}

		// @method setShippingMethod
		// @param {LiveOrder.Model.Data} data
		// @param current_order
	,	setShippingMethod: function setShippingMethod (data, current_order)
		{
			if ((!this.isMultiShippingEnabled || !data.ismultishipto) && this.isSecure && data.shipmethod !== current_order.shipmethod)
			{
				var shipmethod = _.findWhere(current_order.shipmethods, {internalid: data.shipmethod});

				if (shipmethod)
				{
					ModelsInit.order.setShippingMethod({
						shipmethod: shipmethod.internalid
					,	shipcarrier: shipmethod.shipcarrier
					});
				}
				else
				{
					ModelsInit.order.removeShippingMethod();
				}
			}
		}

		// @method setTermsAndConditions
		// @param {LiveOrder.Model.Data} data
	,	setTermsAndConditions: function setTermsAndConditions (data)
		{
			var require_terms_and_conditions = ModelsInit.session.getSiteSettings(['checkout']).checkout.requiretermsandconditions;

			if (require_terms_and_conditions.toString() === 'T' && this.isSecure && !_.isUndefined(data.agreetermcondition) && ModelsInit.session.isLoggedIn2())
			{
				ModelsInit.order.setTermsAndConditions(data.agreetermcondition);
			}
		}

		// @method setTransactionBodyField
		// @param {LiveOrder.Model.Data} data
	,	setTransactionBodyField: function setTransactionBodyField (data)
		{
			// Transaction Body Field
			if (this.isSecure && !_.isEmpty(data.options) && ModelsInit.session.isLoggedIn2())
			{
				_.each(data.options, function(value, key)
				{
					if (Array.isArray(value))
					{
						data.options[key] = value.join(String.fromCharCode(5));
					}
				});
				ModelsInit.order.setCustomFieldValues(data.options);
			}
		}

	,	getOptionByCartOptionId: function getOptionByCartOptionId (options, cart_option_id)
		{
			return _.findWhere(options, {cartOptionId: cart_option_id});
		}

		// @method setOldPromocodes sets a local instance of the order's promocodes, used to be able to detect changes in a promocode.
	,	setOldPromocodes: function setOldPromocodes ()
		{
			var order_fields = this.getFieldValues();
			this.old_promocodes = order_fields.promocodes;
		}

		// @method process3DSecure. 3D Secure is a second factor authentication.
		// Can apply to Visa, MasterCard, JCB International and American Express.
		// @return {Object} Result of order submit operation ({status, internalid, confirmationnumber})
	,	process3DSecure: function process3DSecure ()
		{
			var orderHandlerUrl = ModelsInit.session.getAbsoluteUrl('checkout', '../threedsecure.ssp')
			,	confirmation = ModelsInit.order.submit({
					paymentauthorization: {
						type: 'threedsecure',
						noredirect: 'T',
						termurl: orderHandlerUrl
					}
				});

			if (confirmation.statuscode === 'error')
			{
				// With 3D Secure, we expect the order.submit() operation returning
				// 'ERR_WS_REQ_PAYMENT_AUTHORIZATION' to continue the flow.
				if (confirmation.reasoncode === 'ERR_WS_REQ_PAYMENT_AUTHORIZATION')
				{
					return confirmation;
				}

				throw confirmation;
			}
			else
			{
				confirmation = _.extend(this.getConfirmation(confirmation.internalid), confirmation);
			}
			return confirmation;
		}
	});
});
