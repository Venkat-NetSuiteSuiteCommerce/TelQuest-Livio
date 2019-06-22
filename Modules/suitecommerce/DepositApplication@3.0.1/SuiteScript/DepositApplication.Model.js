/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Deposit.Model.js
// ----------------
//
define(
	'DepositApplication.Model'
,	['Transaction.Model', 'Utils']
,	function (TransactionModel, Utils)
{
	'use strict';

	return TransactionModel.extend({

		name: 'DepositApplication'

	,	getInvoices: function ()
		{
			this.result.invoices = [];

			for (var i = 1; i <= this.record.getLineItemCount('apply'); i++)
			{
				var invoice = {
						line: i
					,	internalid: this.record.getLineItemValue('apply', 'internalid', i)
					,	type: this.record.getLineItemValue('apply', 'type', i)
					,	total: Utils.toCurrency(this.record.getLineItemValue('apply', 'total', i))
					,	total_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'total', i))
					,	apply: this.record.getLineItemValue('apply', 'apply', i) === 'T'
					,	applydate: this.record.getLineItemValue('apply', 'applydate', i)
					,	currency: this.record.getLineItemValue('apply', 'currency', i)
					,	amount: Utils.toCurrency(this.record.getLineItemValue('apply', 'amount', i))
					,	amount_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'amount', i))
					,	due: Utils.toCurrency(this.record.getLineItemValue('apply', 'due', i))
					,	due_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'due', i))
					,	refnum: this.record.getLineItemValue('apply', 'refnum', i)
				};

				this.result.invoices.push(invoice);
			}
		}

	,	getExtraRecordFields: function ()
		{
			this.result.deposit =
			{
				internalid: this.record.getFieldValue('deposit')
			,	name: this.record.getFieldText('deposit')
			};

			this.result.depositdate = this.record.getFieldValue('depositdate');
			this.getInvoices();
		}
	});
});