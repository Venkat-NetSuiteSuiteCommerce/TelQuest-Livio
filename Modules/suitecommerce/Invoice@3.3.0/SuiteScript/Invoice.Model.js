/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Invoice.Model.js
// ----------
// Handles fetching invoices
define(
	'Invoice.Model'
,	[	'Application'
	,	'Utils'
	,	'Transaction.Model'
	,	'Transaction.Model.Extensions'

	,	'underscore'
	]
,	function (
		Application
	,	Utils
	,	TransactionModel
	,	TransactionModelExtensions

	,	_
	)
{
	'use strict';

	return TransactionModel.extend({
	
		name: 'Invoice'

	,	setExtraListColumns: function ()
		{
			if (this.isMultiCurrency)
			{
				this.columns.amount_remaining = new nlobjSearchColumn('formulanumeric').setFormula('{amountremaining} / {exchangerate}');
			}
			else
			{
				this.columns.amount_remaining = new nlobjSearchColumn('amountremaining');
			}

			this.columns.closedate = new nlobjSearchColumn('closedate');
			this.columns.duedate = new nlobjSearchColumn('duedate');
		}

	,	setExtraListFilters: function ()
		{
			var status = this.data.status;
			
			if (status)
			{
				var value = null;

				switch (status)
				{
					case 'open':
						value = 'CustInvc:A';
					break;

					case 'paid':
						value = 'CustInvc:B';
					break;
				}

				if (value)
				{
					this.filters.status_operator = 'and';
					this.filters.status = ['status', 'anyof', value];
				}				
			}
		}

		// @method mapListResult Overrides the namesake method of Transaction.Model. It maps the received result with proper information
		// @param {Transaction.Model.List.Result.Record} result Base result to be extended
		// @param {nlobjSearchResult} record Instance of the record returned by NetSuite search
		// @return {Transaction.Model.List.Result.Record}
	,	mapListResult: function (result, record)
		{			
			var due_date = record.getValue('duedate')
			,	close_date = record.getValue('closedate')
			,	transaction_date = record.getValue('trandate')
			,	due_date_millisenconds = !!due_date ? nlapiStringToDate(due_date).getTime() : (new Date()).getTime()
			,	due_in_milliseconds = due_date_millisenconds - this.now;
		
			result.amountremaining = Utils.toCurrency(record.getValue(this.columns.amount_remaining));
			result.amountremaining_formatted = Utils.formatCurrency(record.getValue(this.columns.amount_remaining));
			result.closedate = close_date;

			result.closedateInMilliseconds = close_date ? nlapiStringToDate(close_date).getTime() : 0;
			result.tranDateInMilliseconds = transaction_date ? nlapiStringToDate(transaction_date).getTime() : 0;

			result.duedate = due_date;
			result.dueinmilliseconds = due_in_milliseconds;
			result.isOverdue = due_in_milliseconds <= 0 && ((-1 * due_in_milliseconds) / 1000 / 60 / 60 / 24) >= 1;
			
			return result;
		}

	,	getExtraRecordFields: function ()
		{
			this.getAdjustments();
			this.getSalesRep();

			this.result.purchasenumber = this.record.getFieldValue('otherrefnum');
			this.result.dueDate = this.record.getFieldValue('duedate');
			this.result.amountDue = Utils.toCurrency(this.record.getFieldValue('amountremainingtotalbox'));
			this.result.amountDue_formatted = Utils.formatCurrency(this.record.getFieldValue('amountremainingtotalbox'));
		}

	,	postGet: function ()
		{
			this.result.lines = _.reject(this.result.lines, function (line)
			{
				return line.quantity === 0;
			});
		}

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
	,	getAdjustments: TransactionModelExtensions.getAdjustments

	,	getSalesRep: TransactionModelExtensions.getSalesRep
	});

});