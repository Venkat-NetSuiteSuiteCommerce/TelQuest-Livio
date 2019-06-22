/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Main
define(
	'Application.Error.Mapping'
,	[
		'underscore'
	,	'Utils'
	]
,	function (
		_
	)
{
	'use strict';

	return {
		getMappingMessage: function(errorCode, params)
		{
			var msg = {
				errorCode: errorCode
			,	message: this[errorCode].message
			};

			if (params)
			{
				msg.message = _(this[errorCode].message).translate(params.toString().split(','));
			}

			return msg;

		}

	,	ERR_BAD_REQUEST: {
			message: _('Bad Request').translate()
		}

	,	ERR_USER_NOT_LOGGED_IN: {
			message: _('Not logged In').translate()
		}

		//@property {Object} sessionTimedOutError
	,	ERR_USER_SESSION_TIMED_OUT: {
			message: _('User session timed out').translate()
		}

	,	ERR_INSUFFICIENT_PERMISSIONS: {
			message: _('Insufficient permissions').translate()
		}


	,	ERR_RECORD_NOT_FOUND: {
			message: _('Not found').translate()
		}

	,	ERR_METHOD_NOT_ALLOWED: {
			message: _('Sorry, you are not allowed to perform this action.').translate()
		}

	,	ERR_INVALID_ITEMS_FIELDS_ADVANCED_NAME: {
			message: _('Please check if the fieldset is created.').translate()
		}

		//***** SCIS ERRORS *****
	,	ORDER_REQUIRED: {
			message: _('You must specify an Order Id.').translate()
		}

	,	NOT_IMPLEMENTED: {
			message: _('Not implemented.').translate()
		}

	,	NO_SITE_ID: {
			message: _('No siteId set in session.').translate()
		}


	,	MISSING_SITE_ID: {
			message: _('Site parameter is required.').translate()
		}


	,	ORDER_ID_OR_CREDIT_MEMO_ID: {
			message: _('You must specify at least orderId or creditMemoId.').translate()
		}

	,	NOT_APPLICABLE_CREDIT_MEMO: {
			message: _('Credit Memo is not applicable to this order. Please assign the credit memo\'s customer to the invoice and check the credit memo balance.').translate()
		}

	,	REFOUND_METHOD_REQUIRED: {
			message: _('You must specify the refund method.').translate()
		}

	,	INVALID_ORDER_ID: {
			message: _('Invalid id for this order').translate()
		}

	,	INVALID_RETURNED_QUANTITY: {
			message: _('The quantity being returned exceeds the available quantity (line $(0))').translate()
		}

	,	CUSTOMER_NOT_FOUND: {
			message: _('Customer not found: $(0)').translate()
		}

	,	CUSTOMER_NOT_EXIST: {
			message: _('Customer doesn\'t exist $(0)').translate()
		}

	,	CUSTOMER_REQUIRED: {
			message: _('Customer is requred.').translate()
		}

	,	ENTITY_ID_REQUIRED: {
			message: _('entityId required: $(0)').translate()
		}

	,	UNEXPECTED_ERROR:{
			message: _('Unexpected Error').translate()
		}

	,	DEVICE_NOT_FOUND: {
			message: _('Device was not found!').translate()
		}

	,	PARAMETER_MISSING: {
			message: _('Missign parameter: $(0)').translate()
		}

	,	PRINTING_TECHNOLOGY_NOT_FOUND: {
			message: _('Printing technology not found.').translate()
		}

	,	INVALID_URL: {
			message: _('Invalid request URL.').translate()
		}

	,	INVALID_PARAMETER: {
			message: _('Invalid parameter.').translate()
		}

	,	MISSING_PARAMETER: {
			message: _('Missing parameter.').translate()
		}

	,	NOT_FOUND_EMPLOYEE_LOCATION: {
			message: _('Current user does not have a location.').translate()
		}

	,	REQUIRED_SALES_ASSOCIATE_LOCATION: {
			message: _('The sales associate requires a location to create the order').translate()
		}

	,	INVALID_TRANSACTION_TYPE: {
			message: _('Invalid transaction type: $(0)').translate()
		}

	,	LOCATION_ADDRESS_MISSING_FIELDS: {
			message: _('Location address is missing the following required fields: $(0). Please complete.').translate()
		}

	,	LOCATION_SETTINGS_NOT_FOUND: {
			message: _('No location settings found for location $(0)').translate()
		}

	,	LOCATION_IS_REQUIRED: {
			message: _('Location is required.').translate()
		}

	,	IMPOSSIBLE_APPLY_CUPON: {
			message: _('Couldn\'t apply coupon.').translate()
		}

	,	SAVED_SEARCH_INVALID_COLUMN: {
			message: _('Invalid column index: $(0)').translate()
		}

	,	SAVED_SEARCH_NOT_FOUND: {
			message: _('Couldn\'t get saved search $(0)').translate()
		}

	,	SAVED_SEARCH_MISSING_PARAMETER: {
			message: _('Missing parameter.').translate()
		}

	,	ITEM_NOT_IN_SUBSIDIARY: {
			message: _('Item $(0) is not configured for current subsidiary.').translate()
		}

	,	GIFT_AUTH_CODE_ALREADY_EXIST: {
			message: _('A Gift Card with the same authorization code already exists.').translate()
		}

	,	UNAPPROVED_PAYMENT: {
			message: _('Unapproved Payment').translate()
		}

	,	NOT_FOUND_PAYMENT: {
			message: _('No payments found').translate()
		}

	,	NECESARY_SUBMIT_ORDER: {
			message: _('The order needs to be submitted to update payments.').translate()
		}

	,	NOT_FOUND_PAYMENT_METHOD_FOR_USER: {
			message: _('Payment Method not found for the current user').translate()
		}

	,	FORCE_CANCELLABLE_PAYMENT: {
			message: _('Tried to force-cancel a "cancellable" payment').translate()
		}

	,	ITEM_NOT_CONFIGURED_FOR_SUBSIDIARY: {
			message: _('Item $(0) is not cofigured for current subsidiary').translate()
		}

	,	TRANSACTION_HAS_BEEN_RESUMED: {
			message: _('The transaction has already been resumed. Status: $(0)').translate()
		}

	,	LOAD_BEFORE_SUBMIT: {
			message: _('Please load a record before calling Transaction.Model.Submit method.').translate()
		}

	,	UNKNOW_RECORD: {
			message: _('Unknown record type.').translate()
		}

	,	LINE_LIMIT: {
			message: _('You have added $(0) items. You should add only until two items.').translate()
		}

	,	MISSING_DRAWER_CONFIGURATION: {
			message: _('SCIS STORE SAFE ACCOUNT/SCIS CASH DRAWER DIFFERENCE fields are not configured for current location.').translate()
		}

	,	INVALID_STARTING_CASH: {
			message: _('Starting cash must be a positive number greather than cero.').translate()
		}

	,	CASH_DRAWER_IS_BEIGN_USED: {
			message: _('This cash drawer is being used by:  $(0), please select a diferent one.').translate()
		}

	//***** END SCIS ERROR *****

	};

});
