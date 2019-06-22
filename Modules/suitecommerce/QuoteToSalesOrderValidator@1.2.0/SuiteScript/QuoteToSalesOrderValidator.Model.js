/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module QuoteToSalesOrderValidator
define(
	'QuoteToSalesOrderValidator.Model'
,	[
		'SC.Model'
	,	'Application'
	,	'StoreItem.Model'
	,	'Address.Model'

	,	'underscore'
	]
,	function (
		SCModel
	,	Application
	,	StoreItemModel
	,	AddressModel

	,	_
	)
{
	'use strict';

	//@class InvalidQuoteError
	var	invalidQuoteError = {
			// @property {Number} status
			status: 500
			// @property {String} code
		,	code: 'ERR_INVALID_QUOTE_STATUS'
			// @property {String} message
		,	message: 'Sorry, the specified quote id is not valid to be purchased.'
		};

	//@class QuoteToSalesOrderValidator.Model @extend SC.Model
	return SCModel.extend({
		//@property {String} name
		name: 'QuoteToSalesOrderValidator'

		//@property {InvalidQuoteError} invalidQuoteError
	,	invalidQuoteError: invalidQuoteError

		//@property {Array<QuoteToSalesOrderValidator.Model.PurchasableValidator>} purchasableQuoteConditions
	,	purchasableQuoteConditions: [
			//@class QuoteToSalesOrderValidator.Model.PurchasableValidator
			{
				errorCode: 'INVALIDPERMISSION'
				//@property {Boolean} stopValidation
			,	stopValidation: true
			,	validatesCondtion: function()
				{
					return Application.getPermissions().transactions.tranSalesOrd >= 2;
				}
			}
		,	{
				//@property {String} errorCode
				errorCode: 'INVALIDENTITYSTATUS'
				//@method validatesCondtion Validated ONE condition over a quote
				//@param {Quote.Model.Attributes} quote
				//@return {Boolean} True in case the quote is valid, false otherwise
			,	validatesCondtion: function (quote)
				{
					return quote.entitystatus.id === SC.Configuration.quote.purchaseReadyStatusId;
				}
			}
		,	{
				errorCode: 'INVALIDSTATUS'
			,	validatesCondtion: function (quote)
				{
					return quote.statusRef === 'open';
				}
			}
		,	{
				errorCode: 'MISSINGSHIPMETHOD'
			,	validatesCondtion: function (quote)
				{
					var all_items_fulfillable = _.all(_.pluck(quote.lines, 'isfulfillable'), function (fulfillable)
						{
							return !fulfillable;
						});
					if (all_items_fulfillable)
					{
						return true;
					}

					return !!quote.shipmethod;
				}
			}
		,	{
				errorCode: 'MISSINGSHIPADDRESS'
			,	validatesCondtion: function (quote)
				{
					var all_items_fulfillable = _.all(_.pluck(quote.lines, 'isfulfillable'), function (fulfillable)
						{
							return !fulfillable;
						});
					if (all_items_fulfillable)
					{
						return true;
					}

					var shipping_address = quote.addresses[quote.shipaddress];
					return  !!(shipping_address && shipping_address.isvalid === 'T');
				}
			}
			//Remove the following after the Issue 365284 is solved
		,	{
				errorCode: 'MISSINGSALESREP'
			,	validatesCondtion: function (quote)
				{
					return  quote.salesrep && quote.salesrep.internalid;
				}
			}
		,	{
				errorCode: 'GIFTCERTIFICATENOTALLOWED'
			,	validatesCondtion: function (quote)
				{
					return _.all(quote.lines, function (line)
					{
						return line.item.itemtype !== 'GiftCert';
					});
				}
			}
		]
		// @class QuoteToSalesOrderValidator.Model

		//@method getQuoteToSalesOrderValidation Set the purchasable status of the current estimate
		//@param {Quote.Model.Attributes} record
		//@param {Array<QuoteToSalesOrderValidator.Model.PurchasableValidator>?} validators
		//@return {QuoteToSalesOrderValidator.Model.Attributes.PurchasableStatus}
	,	getQuoteToSalesOrderValidation: function (record, validators)
		{
			var purchase_validation_errors = []
			,	is_valid_for_purchase = false;

			validators = validators || this.purchasableQuoteConditions;

			_.find(validators, function (validator)
			{
				if (!validator.validatesCondtion(record))
				{
					purchase_validation_errors.push(validator.errorCode);
					return !!validator.stopValidation;
				}
				return false;
			});
			is_valid_for_purchase = !purchase_validation_errors.length;

			//@class QuoteToSalesOrderValidator.Model.Attributes.PurchasableStatus Container used to transport the result of validating a quote as ready for purchase
			return {
				//@property {Boolean} isPurchasable
				isPurchasable: is_valid_for_purchase
				//@property {Array<String>} validationErrors
			,	validationErrors: purchase_validation_errors
			};
			//@class QuoteToSalesOrderValidator.Model
		}

	});
});
