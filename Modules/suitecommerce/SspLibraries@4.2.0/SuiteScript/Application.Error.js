/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SspLibraries
define(
	'Application.Error'
,	[]
,	function ()
{
	'use strict';

	return {
		//@property {Object} badRequestError
	 	badRequestError: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'ERR_BAD_REQUEST'
			// @property {String} message
		,	message: 'Bad Request'
		}

		//@property {Object} unauthorizedError
	,	unauthorizedError: {
			// @property {Number} status
			status: 401
			// @property {String} code
		,	code: 'ERR_USER_NOT_LOGGED_IN'
			// @property {String} message
		,	message: 'Not logged In'
		}

		//@property {Object} sessionTimedOutError
	,	sessionTimedOutError: {
			// @property {Number} status
			status: 401
			// @property {String} code
		,	code: 'ERR_USER_SESSION_TIMED_OUT'
			// @property {String} message
		,	message: 'User session timed out'
		}

		//@property {Object} forbiddenError
	,	forbiddenError: {
			// @property {Number} status
			status: 403
			// @property {String} code
		,	code: 'ERR_INSUFFICIENT_PERMISSIONS'
			// @property {String} message
		,	message: 'Insufficient permissions'
		}

		//@property {Object} notFoundError
	,	notFoundError: {
			// @property {Number} status
			status: 404
			// @property {String} code
		,	code: 'ERR_RECORD_NOT_FOUND'
			// @property {String} message
		,	message: 'Not found'
		}

		//@property {Object} methodNotAllowedError
	,	methodNotAllowedError: {
			// @property {Number} status
			status: 405
			// @property {String} code
		,	code: 'ERR_METHOD_NOT_ALLOWED'
			// @property {String} message
		,	message: 'Sorry, you are not allowed to perform this action.'
		}

		//@property {Object} invalidItemsFieldsAdvancedName
	,	invalidItemsFieldsAdvancedName: {
			// @property {Number} status
			status: 500
			// @property {String} code
		,	code:'ERR_INVALID_ITEMS_FIELDS_ADVANCED_NAME'
			// @property {String} message
		,	message: 'Please check if the fieldset is created.'
		}

		//***** SCIS ERRORS *****
		//@property {Object} orderIdRequired
	,	orderIdRequired: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'ORDER_REQUIRED'
			// @property {String} message
		,	message: 'You must specify an Order Id.'
		}

		//@property {Object} notImplemented
	,	notImplemented: {
			// @property {Number} status
			status: 501
			// @property {String} code
		,	code: 'NOT_IMPLEMENTED'
			// @property {String} message
		,	message: 'Not implemented.'
		}

		//@property {Object} noSiteId
	,	noSiteId: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'NO_SITE_ID'
			// @property {String} message
		,	message: 'No siteId set in session.'
		}

		//@property {Object} missingSiteId
	,	missingSiteId: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'MISSING_SITE_ID'
			// @property {String} message
		,	message: 'Site parameter is required.'
		}

		//@property {Object} noOrderIdOrCreditMemoId
	,	noOrderIdOrCreditMemoId: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'ORDER_ID_OR_CREDIT_MEMO_ID'
			// @property {String} message
		,	message: 'You must specify at least orderId or creditMemoId.'
		}

		//@property {Object} noOrderIdOrCreditMemoId
	,	notApplicableCreditMemo: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'NOT_APPLICABLE_CREDIT_MEMO'
			// @property {String} message
		,	message: 'Credit Memo is not applicable to this order. Please assign the credit memo\'s customer to the invoice and check the credit memo balance.'
		}

		//@property {Object} refundMethodRequired
	,	refundMethodRequired: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'REFUND_METHOD_REQUIRED'
			// @property {String} message
		,	message: 'You must specify the refund method.'
		}

		//@property {Object} invalidOrderId
	,	invalidOrderId: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'INVALID_ORDER_ID'
			// @property {String} message
		,	message: 'Invalid id for this order'
		}

		//@property {Object} invalidReturnedQuantity
	,	invalidReturnedQuantity: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'INVALID_RETURNED_QUANTITY'
			// @property {String} message
		,	message: 'The quantity being returned exceeds the available quantity.'
		}

		//@property {Object} customerNotFound
	,	customerNotFound: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'CUSTOMER_NOT_FOUND'
			// @property {String} message
		,	message: 'Customer not found.'
		}

		//@property {Object} customerNotExist
	,	customerNotExist: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'CUSTOMER_NOT_EXIST'
			// @property {String} message
		,	message: 'Customer doesn\'t exist.'
		}

		//@property {Object} customerRequired
	,	customerRequired: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'CUSTOMER_REQUIRED'
			// @property {String} message
		,	message: 'Customer is requred.'
		}

		//@property {Object} entityIdRequired
	,	entityIdRequired: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'ENTITY_ID_REQUIRED'
			// @property {String} message
		,	message: 'entityId required.'
		}

		//@property {Object} unexpectedError
	,	unexpectedError: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'UNEXPECTED_ERROR'
			// @property {String} message
		,	message: 'Unexpected Error'
		}

		//@property {Object} unexpectedError
	,	deviceNotFound: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'DEVICE_NOT_FOUND'
			// @property {String} message
		,	message: 'Device was not found!'
		}

		//@property {Object} ParameterMissing
	,	ParameterMissing: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'PARAMETER_MISSING'
			// @property {String} message
		,	message: 'Missing parameter.'
		}

		//@property {Object} printingTechnologyNotFound
	,	printingTechnologyNotFound: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'PRINTING_TECHNOLOGY_NOT_FOUND'
			// @property {String} message
		,	message: 'Printing technology not found.'
		}

		//@property {Object} invalidURL
	,	invalidURL: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'INVALID_URL'
			// @property {String} message
		,	message: 'Invalid request URL.'
		}

		//@property {Object} invalidParameter
	,	invalidParameter: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'INVALID_PARAMETER'
			// @property {String} message
		,	message: 'Invalid parameter.'
		}

		//@property {Object} missingParamenter
	,	missingParamenter: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'MISSING_PARAMETER'
			// @property {String} message
		,	message: 'Missing parameter.'
		}

		//@property {Object} notFoundEmployeeLocation
	,	notFoundEmployeeLocation: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'NOT_FOUND_EMPLOYEE_LOCATION'
			// @property {String} message
		,	message: 'Current user does not have a location.'
		}

		//@property {Object} notAvailableEmployeeLocation
	,	notAvailableEmployeeLocation: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'EMPLOYEE_LOCATION_NOT_AVAILABLE'
			// @property {String} message
		,	message: 'You dont have the device location available.'
		}


		//@property {Object} requiredSalesAssociateLocation
	,	requiredSalesAssociateLocation: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'REQUIRED_SALES_ASSOCIATE_LOCATION'
			// @property {String} message
		,	message: 'The sales associate requires a location to create the order'
		}

		//@property {Object} invalidTransactionType
	,	invalidTransactionType: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'INVALID_TRANSACTION_TYPE'
			// @property {String} message
		,	message: 'Invalid transaction type.'
		}

		//@property {Object} locationAddressMissingFields
	,	locationAddressMissingFields: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'LOCATION_ADDRESS_MISSING_FIELDS'
			// @property {String} message
		,	message: 'Location address is missing required fields. Please complete.'
		}

	,	locationSettingsNotFound: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'LOCATION_SETTINGS_NOT_FOUND'
			// @property {String} message
		,	message: 'Location setting not found for current location.'
		}

	,	locationIsRequired: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'LOCATION_IS_REQUIRED'
			// @property {String} message
		,	message: 'Location is required.'
		}

		//@property {Object} impossibleApplyCoupon
	,	impossibleApplyCoupon: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'IMPOSSIBLE_APPLY_CUPON'
			// @property {String} message
		,	message: 'Couldn\'t apply coupon.'
		}

	,	savedSearchInvalidColumn: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'SAVED_SEARCH_INVALID_COLUMN'
			// @property {String} message
		,	message: 'Invalid column index: '
		}

	,	savedSearchNotFound: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'SAVED_SEARCH_NOT_FOUND'
			// @property {String} message
		,	message: 'Couldn\'t get saved search.'
		}

	,	savedSearchMissingParameter: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'SAVED_SEARCH_MISSING_PARAMETER'
			// @property {String} message
		,	message: 'Missing parameter.'
		}

	,	itemNotInSubsidiary: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'ITEM_NOT_IN_SUBSIDIARY'
			// @property {String} message
		,	message: 'Item is not configured for current subsidiary.'
		}

	,	giftAuthcodeAlreadyExists: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'GIFT_AUTH_CODE_ALREADY_EXIST'
			// @property {String} message
		,	message: 'A Gift Card with the same authorization code already exists.'
		}

	,	unapprovedPayment: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'UNAPPROVED_PAYMENT'
			// @property {String} message
		,	message: 'Unapproved Payment'
		}

	,	notFoundPayment: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'NOT_FOUND_PAYMENT'
			// @property {String} message
		,	message: 'No payments found'
		}

	,	necessarySubmitOrder: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'NECESSARY_SUBMIT_ORDER'
			// @property {String} message
		,	message: 'The order needs to be submitted to update payments.'
		}

	,	notFoundPaymentMethodForUser: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'NOT_FOUND_PAYMENT_METHOD_FOR_USER'
			// @property {String} message
		,	message: 'Payment Method not found for the current user'
		}

	,	forceCancellablePayment: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'FORCE_CANCELLABLE_PAYMENT'
			// @property {String} message
		,	message: 'Tried to force-cancel a "cancellable" payment'
		}

	,	itemNotConfiguredForSubsidiary: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'ITEM_NOT_CONFIGURED_FOR_SUBSIDIARY'
			// @property {String} message
		,	message: 'Item is not configured for current subsidiary'
		}

	,	transactionHasBeenResumed: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'TRANSACTION_HAS_BEEN_RESUMED'
			// @property {String} message
		,	message: 'The transaction has already been resumed.'
		}

	,	loadBeforeSubmit: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'LOAD_BEFORE_SUBMIT'
			// @property {String} message
		,	message: 'Please load a record before calling Transaction.Model.Submit method.'
		}

	,	unknownRecord: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'UNKNOWN_RECORD'
			// @property {String} message
		,	message: 'Unknown record type.'
		}

	,	missingDrawerConfiguration: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'MISSING_DRAWER_CONFIGURATION'
			// @property {String} message
		,	message: 'SCIS STORE SAFE ACCOUNT/SCIS CASH DRAWER DIFFERENCE fields are not configured for current location.'
		}

	,	invalidStartingCash: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'INVALID_STARTING_CASH'
			// @property {String} message
		,	message: 'Starting cash must be a positive number greather than cero.'
		}

	,	cashDrawerIsBeignUsed: {
			// @property {Number} status
			status: 400
			// @property {String} code
		,	code: 'CASH_DRAWER_IS_BEIGN_USED'
			// @property {String} message
		,	message: 'This cash drawer is being used by other user, please select a diferent one.'
		}

	//***** END SCIS ERROR *****

	};

});
