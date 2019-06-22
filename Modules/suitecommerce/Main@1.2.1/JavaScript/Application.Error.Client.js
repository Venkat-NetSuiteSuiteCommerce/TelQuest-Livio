/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Main
define(
	'Application.Error.Client'
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
		//@property {Object} itemNotInOrder
	 	itemNotInOrder: {
			// @property {String} code
			code: 'ITEM_NOT_IN_ORDER'
			// @property {String} message
		,	message: _('This item scanned is not on the order.').translate()
		}

		//@property {Object} needCustomerToPOA
	,	customerSelectionRequiredToPOA: {
			// @property {String} code
			code: 'CUSTOMER_SELECTION_REQUIRED_TO_POA'
			// @property {String} message
		,	message: _('Please select a costumer first to Purchase on Account').translate()
		}

		//@property {Object} errorScanningAuthCard
	,	errorScanningAuthCard: {
			// @property {String} code
			code: 'ERROR_SCANNING_AUTH_CARD'
			// @property {String} message
		,	message: _('There was an error scanning your authentication card. Please check your credentials.').translate()
		}

	,	cardNotRecognized: {
			// @property {String} code
			code: 'CARD_NOT_RECOGNIZED'
			// @property {String} message
		,	message: _('Card is not recognized. Please try again.').translate()
		}

	,	invalidAccessCode: {
			// @property {String} code
			code: 'INVALID_ACCESS_CODE'
			// @property {String} message
		,	message: _('Invalid Access Code. Try again').translate()
		}

	,	invalidCreditMemo: 	{
			// @property {String} code
			code: 'INVALID_CREDIT_MEMO'
			// @property {String} message
		,	message: _('The credit memo is not valid or it is not for this customer.').translate()
		}

	,	anythingToPay: 	{
			// @property {String} code
			code: 'ANYTHINGTOPAY'
			// @property {String} message
		,	message: _('You dont have anything to pay.').translate()
		}

	,	errorsIssuedFields: {
			// @property {String} code
			code: 'ERRORSISSUEDFIELDS'
			// @property {String} message
		,	message: _('There are errors on the issued fields. Correct them and submit the data again.').translate()
		}

	,	specifyEmailAddress: {
			// @property {String} code
			code: 'SPECIFYEMAILADDRESS'
			// @property {String} message
		,	message: _('Please specify the customer\'s email address.').translate()
		}

	,	noTransactionAssociated: {
			// @property {String} code
			code: 'NOTRANSACTIONASSOCIATED'
			// @property {String} message
		,	message: _('Gift Certificate has no transaction associated.').translate()
		}

	,	giftCertificateNotPaidYet: {
			// @property {String} code
			code: 'GIFTCERTIFICATENOTPAIDYET'
			// @property {String} message
		,	message: _('Gift Certificate is not paid yet.').translate()
		}

	,	fetchingGiftCertificateData: {
			// @property {String} code
			code: 'FETCHINGGIFTCERTIFICATEDATA'
			// @property {String} message
		,	message: _('An unexpected error occurred while fetching Gift Certificate Data.').translate()
		}

	,	giftCertificateIsInactive: {
			// @property {String} code
			code: 'GIFTCERTIFICATEISINACTIVE'
			// @property {String} message
		,	message: _('Gift Certificate is inactive or doesn\'t have remaining amount.').translate()
		}

	,	unknownGiftCertificate: {
			// @property {String} code
			code: 'UNKNOWNGIFTCERTIFICATE'
			// @property {String} message
		,	message: _('Unknown Gift Certificate Authorization Code.').translate()
		}

	,	giftCardIsNotRecognized: {
			// @property {String} code
			code: 'GIFTCARDISNOTRECOGNIZED'
			// @property {String} message
		,	message: _('Gift Card is not recognized. Please try again.').translate()
		}

	,	recipientEmailIsInvalid: {
			// @property {String} code
			code: 'RECIPIENTEMAILISINVALID'
			// @property {String} message
		,	message: _('Recipient email is invalid').translate()
		}

	,	invalidDateFormat: {
			// @property {String} code
			code: 'INVALIDDATEFORMAT'
			// @property {String} message
		,	message: _('Invalid date format.').translate()
		}

	,	selectTerm: {
			// @property {String} code
			code: 'SELECTTERM'
			// @property {String} message
		,	message: _('You should select a term first.').translate()
		}



	};
});