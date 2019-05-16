/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Cart
define('ICart.Component'
,	[
		'SC.BaseComponent'
	,	'Cart.Component.DataValidator'
	,	'SC.Models.Init'
	,	'Utils'

	,	'Application'

	,	'underscore'
	]
,	function (
		SCBaseComponent
	,	CartComponentDataValidator
	,	ModelsInit
	,	Utils

	,	Application

	,	_
	)
{
	'use strict';

	//Did in this way to be compatible with SCIS
	var StoreItem;

	try {
		StoreItem = require('StoreItem.Model');
	}
	catch(e)
	{
	}

	//We removed the is-my-json-valid library but kept the code to be able to add another validation library without code changes
	var isMyJsonValid
	,	new_line_validator = isMyJsonValid && isMyJsonValid(CartComponentDataValidator.newLineSchema)
	,	edit_line_validator = isMyJsonValid && isMyJsonValid(CartComponentDataValidator.editLineSchema);

	//@method formats An entity data grouping both commons attributes (SCIS and SCA) and non-commons. The last goes into the 'extras' key
	//@private
	//@param {Object} entity Data object to format
	//@param {Array<String>} commonAttrs Array with a string of all the common attributes that are at the first level of the returned formatted object
	//@return {FormatObject} A Formatted object structured with all the unique properties inside the extra object
	var	format = function format(entity, commonAttrs){
			var formatted = {extras: {}};

			_.keys(entity).forEach(function(attr){
				if(_.contains(commonAttrs, attr))
				{
					formatted[attr] = entity[attr];
				}
				else
				{
					formatted.extras[attr] = entity[attr];
				}
			});

			return formatted;
		}
		//@class Cart.Component @extend SC.BaseComponent
	,	icart_component = SCBaseComponent.extend({

			componentName: 'Cart'

			// @method _validateLine Validates the input agains the newLineSchema. Used by Cart.Component
			// not working because of removed is-my-json-valid so read the schema for documentation
			// @private
			// @param {Line} line to validate
			// @return {Error} validation error
			//@class Line
			//@property {Number} quantity
			//@property {String?} internalid
			//@property {String?} shipaddress
			//@property {String?} shipmethod
			//@property {Line.Item} item
			//@property {Array<Line.Option>?} options
			//@class Line.Item
			//@property {Number} internalid
			//@class Line.Option
			//@property {String} cartOptionId
			//@property {{internalid:String}} value
		,	_validateLine: function _validateLine(line)
			{
				if (new_line_validator && !new_line_validator(line))
				{
					var errors = _.reduce(new_line_validator.errors, function(memo, error)
					{
						return memo + ' ' + error.field + ' ' + error.message;
					}, '');

					this._reportError('INVALID_PARAM', 'Invalid line: '+ errors);
				}
			}

			// @method _validateEditLine Validates the input agains the editLineSchema. Used by Cart.Component
			// not working because of removed is-my-json-valid so read the schema for documentation
			// @private
			// @param {Line} line to validate
			// @return {Error} validation error
		,	_validateEditLine: function _validateEditLine(line)
			{
				if (edit_line_validator && !edit_line_validator(line))
				{
					var errors = _.reduce(edit_line_validator.errors, function(memo, error){
						return memo+' '+error.field+' '+error.message;
					}, '');
					this._reportError('INVALID_PARAM', 'Invalid line: '+errors);
				}
			}
			//@method addLine Adds a new line into the cart
			//@public
			//@param {Line} data
			//@return {jQuery.Deferred<String>} Return a jQuery Deferred that is resolved into the added line id, String, in the case the operation was done successfully.
			// or the promise is rejected with an error message.
		,	addLine: function addLine(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}
			//@method addLines Adds new lines into the cart
			//@public
			//@param {Array<Line>} data
			//@return {jQuery.Deferred<Array<String>>} Return a jQuery Deferred that is resolved into the added lines ids, String, in the case the operation was done successfully.
			// or the promise is rejected with an error message.
		,	addLines: function addLines(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method getLines returns the lines of the cart
			//@return {jQuery.Deferred<Array<Line>>} Return a jQuery Deferred that is resolved in the case the operation was done successfully.
			// or the promise is rejected with an error message.
			//@class Line
			//@property {String} internalid
			//@property {Number} quantity
			//@property {Number} amount
			//@property {Number} rate
			//@property {Number} tax_amount
			//@property {String} tax_code
			//@property {String} itemtype
			//@property {Line.Extras} extras
			//@property {Line.Item} item
			//@property {Array<Line.Option>} options

			//@class Line.Extras
			//@property {String} shipaddress SCA specific
			//@property {String} shipmethod SCA specific
			//@property {Number} tax_rate SCA specific
			//@property {String} rate_formatted SCA specific
			//@property {Number} discount SCA specific
			//@property {number} total SCA specific
			//@property {String} amount_formatted SCA specific
			//@property {String} tax_amount_formatted SCA specific
			//@property {String} discount_formatted SCA specific
			//@property {String} total_formatted SCA specific
			//@property {String} description SCIS specific
			//@property {String} giftcertfrom SCIS specific
			//@property {String} giftcertmessage SCIS specific
			//@property {Number} giftcertnumber SCIS specific
			//@property {String} giftcertrecipientemail SCIS specific
			//@property {String} giftcertrecipientname SCIS specific
			//@property {String} taxrate1 SCIS specific
			//@property {String} taxrate2 SCIS specific
			//@property {String} grossamt SCIS specific
			//@property {String} tax1amt SCIS specific
			//@property {String} custreferralcode SCIS specific
			//@property {Boolean} excludefromraterequest SCIS specific
			//@property {String} custcol_ns_pos_voidqty SCIS specific
			//@property {Number} voidPercentage SCIS specific
			//@property {Number} returnedQuantity SCIS specific
			//@property {Boolean} isUnvalidatedReturn SCIS specific
			//@property {Boolean} order SCIS specific
			//@property {String} note SCIS specific

			//@class Line.Option
			//@property {String} cartOptionId
			//@property {{internalid:String}} value

			//@class Line.Item
			//@property {Number} internalid
			//@property {String} itemid
			//@property {String} displayname
			//@property {Boolean} isinactive
			//@property {String} itemtype
			//@property {Number} minimumquantity
			//@property {Line.Item.Extras} extras

			//@class Line.Item.Extras
			//@property {Boolean} isinstock SCA specific
			//@property {Boolean} isonline SCA specific
			//@property {Object} matrixchilditems_detail SCA specific
			//@property {Boolean} ispurchasable SCA specific
			//@property {String} stockdescription SCA specific
			//@property {Boolean} isfulfillable SCA specific
			//@property {Boolean} isbackorderable SCA specific
			//@property {Boolean} showoutofstockmessage SCA specific
			//@property {String} outofstockmessage SCA specific
			//@property {String} storedisplayname2 SCA specific
			//@property {Number} pricelevel1 SCA specific
			//@property {String} pricelevel1_formatted SCA specific
			//@property {String} urlcomponent SCA specific
			//@property {Object} itemimages_detail SCA specific
			//@property {Object} onlinecustomerprice_detail SCA specific
			//@property {Object} itemoptions_detail SCA specific
			//@property {String} type SCIS specific
			//@property {String} baseprice SCIS specific
			//@property {String} matrix_parent SCIS specific
			//@property {String} upccode SCIS specific
			//@property {String} additional_upcs SCIS specific
			//@property {Boolean} isdonationitem SCIS specific
			//@property {Boolean} custitem_ns_pos_physical_item SCIS specific
		,	getLines: function getLines()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method removeLine Removes a line from the cart
			//@public
			//@param {String} internalid
			//@return {jQuery.Deferred} Return a jQuery Deferred that is resolved in the case the operation was done successfully.
			// or the promise is rejected with an error message.
		,	removeLine: function removeLine(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method updateLine Updates a line into the cart
			//@public
			//@param {Line} data
			//@return {jQuery.Deferred} Return a jQuery Deferred that is resolved in the case the operation was done successfully.
			// or the promise is rejected with an error message.
		,	updateLine: function updateLine(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method getSummary Returns the summary of the cart
			//@public
			//@return {jQuery.Deferred} Return a jQuery Deferred that is resolved in the case the operation was done successfully.
			// or the promise is rejected with an error message.
			//@class Summary
			//@property {Number} total
			//@property {Number} taxtotal
			//@property {Number} tax2total
			//@property {Number} discounttotal
			//@property {Number} subtotal
			//@property {Number} shippingcost
			//@property {Number} handlingcost
			//@property {Number} giftcertapplied

			//@property {String} discounttotal_formatted SCA specific
			//@property {String} taxonshipping_formatted SCA specific
			//@property {String} taxondiscount_formatted SCA specific
			//@property {Number} itemcount SCA specific
			//@property {String} taxonhandling_formatted SCA specific
			//@property {Number} discountedsubtotal SCA specific
			//@property {String} discountedsubtotal_formatted SCA specific
			//@property {Number} taxondiscount SCA specific
			//@property {String} handlingcost_formatted SCA specific
			//@property {Number} taxonshipping SCA specific
			//@property {String} taxtotal_formatted SCA specific
			//@property {String} totalcombinedtaxes_formatted SCA specific
			//@property {Number} totalcombinedtaxes SCA specific
			//@property {String} giftcertapplied_formatted SCA specific
			//@property {String} shippingcost_formatted SCA specific
			//@property {Number} discountrate SCA specific
			//@property {Number} taxonhandling SCA specific
			//@property {String} tax2total_formatted SCA specific
			//@property {String} discountrate_formatted SCA specific
			//@property {Number} estimatedshipping SCA specific
			//@property {String} estimatedshipping_formatted SCA specific
			//@property {String} total_formatted SCA specific
			//@property {String} subtotal_formatted SCA specific

			//@property {String} shippingtax1rate SCIS specific
			//@property {Boolean} shippingcostoverridden SCIS specific
			//@property {Number} amountdue SCIS specific
			//@property {String} tranid SCIS specific
			//@property {Date} createddate SCIS specific
			//@property {String} couponcode SCIS specific
			//@property {Date} createdfrom SCIS specific
			//@property {Number} changedue SCIS specific
		,	getSummary: function getSummary()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			// @method submit Submits the order
			// @public
			// @return {jQuery.Deferred<ConfirmationSubmit>} Return a jQuery Deferred that is resolved in the case the operation was done successfully.
			// or the promise is rejected with an error message.
			// @class ConfirmationSubmit in SCA the object returned by getShoppingSession().getOrder().submit()
		,	submit: function submit()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method addPayment Adds a payment method. Not implemented
			//@public
		,	addPayment: function addPayment()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method addPromotion Adds a promotion. Not implemented
			//@public
		,	addPromotion: function addPromotion()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method removePromotion Removes a promotion. Not implemented
			//@public
		,	removePromotion: function removePromotion()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method estimateShipping Returns the estimated shipping costs. Not implemented
			//@public
		,	estimateShipping: function estimateShipping()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method removeShipping Removes the shipping method. Not implemented
			//@public
		,	removeShipping: function removeShipping()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method voidLine Voids a line. Implemented only for SCIS
			//@public
		,	voidLine: function voidLine(){
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method unvoidLine Unoids a line. Implemented only for SCIS
			//@public
		,	unvoidLine: function unvoidLine(){
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method updateCustomer Updates a customer data. Implemented only for SCIS
			//@public
		,	updateCustomer: function updateCustomer(){
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//The methods below are explicitly declared in order to clarify the available API.
			//These are auto-generated by SC.BaseComponent so, don't need to do any implementation (does the same but synchronously)

			//@method addLineSync Synchronous version of {@method addLine}
			//@public
		,	addLineSync: function addLineSync(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method addLinesSync Synchronous version of {@method addLines}
			//@public
		,	addLinesSync: function addLinesSync(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method getLinesSync Synchronous version of {@method getLines}
			//@public
		,	getLinesSync: function getLinesSync(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method removeLineSync Synchronous version of {@method removeLine}
			//@public
		,	removeLineSync: function removeLineSync(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method updateLineSync Synchronous version of {@method updateLine}
			//@public
		,	updateLineSync: function updateLineSync(data)
			{
				data = data;
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method getSummarySync Synchronous version of {@method getSummary}
			//@public
		,	getSummarySync: function getSummarySync()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method submitSync Synchronous version of {@method submit}
			//@public
		,	submitSync: function submitSync()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method addPaymentSync Synchronous version of {@method addPayment}
			//Not implemented.
			//@public
		,	addPaymentSync: function addPaymentSync()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method addPromotionSync Synchronous version of {@method addPromotion}
			//Not implemented.
			//@public
		,	addPromotionSync: function addPromotionSync()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method removePromotionSync Synchronous version of {@method removePromotion}
			//Not implemented.
			//@public
		,	removePromotionSync: function removePromotionSync()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			// @method estimateShippingSync Synchronous version of {@method estimateShipping}
			// Not implemented.
			//@public
		,	estimateShippingSync: function estimateShippingSync()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method removeShippingSync Synchronous version of {@method removeShipping}
			//Not implemented.
			//@public
		,	removeShippingSync: function removeShippingSync()
			{
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method voidLineSync Synchronous version of {@method voidLine}
			//Implemented only for SCIS.
			//@public
		,	voidLineSync: function voidLineSync(){
				//implemented only for SCIS
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method unvoidLineSync Synchronous version of {@method unvoidLine}
			//Implemented only for SCIS.
			//@public
		,	unvoidLineSync: function unvoidLineSync(){
				//implemented only for SCIS
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//@method updateCustomerSync Synchronous version of {@method updateCustomer}
			//Implemented only for SCIS.
			//@public
		,	updateCustomerSync: function updateCustomerSync(){
				//implemented only for SCIS
				throw SC.ERROR_IDENTIFIERS.notImplemented;
			}

			//Normalization functions used by {@method _suscribeToInnerEvents} called by Cart.Component

			//@method _normalizeSummary formats the summary grouping both commons attributes (SCIS and SCA) and non-commons.
			//The last into a extras named object
			//@private
			//@param {Summary} summary An object containing the summary
		,	_normalizeSummary: function _normalizeSummary(summary){
				var commonSummaryAttrs = [
					'total'
				,	'taxtotal'
				,	'tax2total'
				,	'discounttotal'
				,	'subtotal'
				,	'shippingcost'
				,	'handlingcost'
				,	'giftcertapplied'
				];
				return format(summary, commonSummaryAttrs);
			}

			//@method _normalizeLine formats the line grouping both commons attributes (SCIS and SCA) and non-commons.
			//The last into a extras named object.
			//@private
			//@param {Line} line
		,	_normalizeLine: function _normalizeLine(line){
				line.item = StoreItem ? StoreItem.get(line.item.internalid, line.item.itemtype || line.item.type, 'details') : line.item;

				var commonLineAttrs = [
					'internalid'
				,	'item'
				,	'quantity'
				,	'amount'
				,	'rate'
				,	'tax_amount'
				,	'tax_code'
				,	'itemtype'
				,	'options'
				];
				var commonItemAttrs = [
					'internalid'
				,	'itemid'
				,	'displayname'
				,	'isinactive'
				,	'itemtype'
				,	'minimumquantity'
				];

				var formatted_line = format(line, commonLineAttrs);
				formatted_line.item = format(line.item, commonItemAttrs);

				return formatted_line;
			}

			//@method _normalizeAddLineBefore formats the line that will receive as parameter the event handler of 'beforeAddLine'
			//@private
			//@param {Line} line
		,	_normalizeAddLineBefore: function _normalizeAddLineBefore(data){
				return {
					line: this._normalizeLine(data[0])
				};
			}

			//@method _normalizeAddLineAfter formats the line that will receive as parameter the event handler of 'afterAddLine'
			//@private
			//@param {Line} line
		,	_normalizeAddLineAfter: function _normalizeAddLineAfter(data){
				return {
					result: data[0]
				,	line: this._normalizeLine(data[1])
				};
			}

			//@method _normalizeRemoveLineBefore formats the line that will receive as parameter the event handler of 'beforeRemoveLine'
			//@private
		,	_normalizeRemoveLineBefore: function _normalizeRemoveLineBefore(data){
				return {
					internalid: data[0]
				};
			}

			//@method _normalizeRemoveLineAfter formats the line that will receive as parameter the event handler of 'afterRemoveLine'
			//@private
		,	_normalizeRemoveLineAfter: function _normalizeRemoveLineAfter(data){
				return {
					result: data[0]
				,	internalid: data[1]
				};
			}

			//@method _normalizeUpdateLineBefore formats the line that will receive as parameter the event handler of 'beforeUpdateLine'
			//@private
		,	_normalizeUpdateLineBefore: function _normalizeUpdateLineBefore(data){
				return {
					line: this._normalizeLine(data[1])
				};
			}

			//@method _normalizeUpdateLineAfter formats the line that will receive as parameter the event handler of 'afterUpdateLine'
			//@private
		,	_normalizeUpdateLineAfter: function _normalizeUpdateLineAfter(data){
				return {
					result: data[0]
				,	line: this._normalizeLine(data[2])
				};
			}

			//@method _normalizeSubmitBefore formats the line that will receive as parameter the event handler of 'beforeSubmit'
			//@private
		,	_normalizeSubmitBefore: function _normalizeSubmitBefore(){
				return {};
			}

			//@method _normalizeSubmitBefore formats the line that will receive as parameter the event handler of 'afterSubmit'
			//@private
		,	_normalizeSubmitAfter: function _normalizeSubmitAfter(data){
				return {
					result: data[0]
				};
			}
	});

	return icart_component;
});

//@class FormattedObject
//@property {Object} extras additional properties unique to SCIS or SCA