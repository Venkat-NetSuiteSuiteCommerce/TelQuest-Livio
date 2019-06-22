/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Receipt.Model.js
// ----------
// Handles fetching receipts
define(
	'Receipt.Model'
,	[	
		'Application'
	,	'Utils'
	,	'Transaction.Model'
	]
,	function (
		Application
	,	Utils
	,	TransactionModel
	)
{
	'use strict';

	return TransactionModel.extend({
	
		name: 'Receipt'

	,	getStatus: function ()
		{
			this.result.status =
			{
				internalid: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status')
			,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'status', true)
			};
		}

	,	getCreatedFrom: function()
		{
			var created_from_internalid = nlapiLookupField(this.result.recordtype, this.result.internalid, 'createdfrom')
			,	recordtype = created_from_internalid ? Utils.getTransactionType(created_from_internalid) : ''
			,	tranid = recordtype ? nlapiLookupField(recordtype, created_from_internalid, 'tranid') : '';

			this.result.createdfrom =
			{
					internalid: created_from_internalid
				,	name: nlapiLookupField(this.result.recordtype, this.result.internalid, 'createdfrom', true) || ''
				,	recordtype: recordtype
				,	tranid: tranid
			};
		}
	});
});