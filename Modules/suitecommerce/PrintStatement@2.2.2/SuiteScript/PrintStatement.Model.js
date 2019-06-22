/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global customer */

// PrintStatement.Model.js
// ----------
define(
	'PrintStatement.Model'
,	['SC.Model']
,	function (SCModel)
{
	'use strict';

	return SCModel.extend({

		name: 'PrintStatement'

	,	getUrl: function(data)
		{			
			var customerId = customer.getFieldValues(['internalid']).internalid
			,	offset = new Date().getTimezoneOffset() * 60 * 1000
			,	statementDate = null
			,	startDate = null
			,	openOnly = data.openOnly ? 'T' : 'F'
			,	inCustomerLocale = data.inCustomerLocale ? 'T' : 'F'
			,	consolidatedStatement = data.consolidatedStatement ? 'T' : 'F'
			,	statementTimestamp = parseInt(data.statementDate,10)
			,	startDateParam = data.startDate
			,	startTimestamp = parseInt(startDateParam,10)
			,	email = data.email
			,	baseUrl = email ? '/app/accounting/transactions/email.nl' : '/app/accounting/print/NLSPrintForm.nl'
			,	url = baseUrl + '?submitted=T&printtype=statement&currencyprecision=2&formdisplayview=NONE&type=statement';

			if(isNaN(statementTimestamp) || (startDateParam && isNaN(startTimestamp))){
				throw {
					status: 500
				,	code: 'ERR_INVALID_DATE_FORMAT'
				,	message: 'Invalid date format'
				};
			}

			statementDate = nlapiDateToString(new Date(statementTimestamp + offset));
			startDate = startDateParam ? nlapiDateToString(new Date(startTimestamp + offset)) : null;

			url += '&customer=' + customerId;
			url += startDate ? ('&start_date=' + startDate) : '';
			url += '&statement_date=' +  statementDate;
			url += '&consolstatement=' + consolidatedStatement;
			url += '&openonly=' + openOnly;
			url += '&incustlocale=' + inCustomerLocale;

			return url;
		}
	});
});