/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Deposit
define(
	'Deposit.Model'
,	[
		'Transaction.Model'
	,	'bignumber'
	,	'Utils'
	]
,	function (
		TransactionModel
	,	BigNumber
	,	Utils
	)
{
	'use strict';

	//@class Deposit.Model
	return TransactionModel.extend({

		name: 'Deposit'

	,	getInvoices: function ()
		{
			var invoicesTotal = 0;

			this.result.invoices = [];

			for (var i = 1; i <= this.record.getLineItemCount('apply'); i++)
			{
				var invoice = {
						line: i
					,	invoice_id: this.record.getLineItemValue('apply', 'id2', i)
					,	deposit_id: this.record.getLineItemValue('apply', 'id', i)

					,	type: this.record.getLineItemValue('apply', 'type', i)
					,	total: Utils.toCurrency(this.record.getLineItemValue('apply', 'total', i))
					,	total_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'total', i))

					,	invoicedate: this.record.getLineItemValue('apply', 'applydate', i)
					,	depositdate: this.record.getLineItemValue('apply', 'depositdate', i)

					,	currency: this.record.getLineItemValue('apply', 'currency', i)
					,	amount: Utils.toCurrency(this.record.getLineItemValue('apply', 'amount', i))
					,	amount_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'amount', i))
					,	due: Utils.toCurrency(this.record.getLineItemValue('apply', 'due', i))
					,	due_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'due', i))
					,	refnum: this.record.getLineItemValue('apply', 'refnum', i)
				};

				invoicesTotal += invoice.amount;

				this.result.invoices.push(invoice);
			}

			this.result.paid = Utils.toCurrency(invoicesTotal);
			this.result.paid_formatted = Utils.formatCurrency(invoicesTotal);
			this.result.remaining = BigNumber(this.result.payment).minus(this.result.paid).toNumber();
			this.result.remaining_formatted = Utils.formatCurrency(this.result.remaining);
		}

	,	getPaymentMethod: function getPaymentMethod ()
		{
			var paymentmethod = {
				type: this.record.getFieldValue('paymethtype')
			,	primary: true
			};

			if (paymentmethod.type === 'creditcard')
			{
				paymentmethod.creditcard = {
					ccnumber: this.record.getFieldValue('ccnumber')
				,	ccexpiredate: this.record.getFieldValue('ccexpiredate')
				,	ccname: this.record.getFieldValue('ccname')
				,	paymentmethod: {
						ispaypal: 'F'
					,	name: this.record.getFieldText('paymentmethod')
					,	creditcard: 'T'
					,	internalid: this.record.getFieldValue('paymentmethod')
					}
				};
			}

			if (this.record.getFieldValue('ccstreet'))
			{
				paymentmethod.ccstreet = this.record.getFieldValue('ccstreet');
			}

			if (this.record.getFieldValue('cczipcode'))
			{
				paymentmethod.cczipcode = this.record.getFieldValue('cczipcode');
			}

			if (this.record.getFieldValue('terms'))
			{
				paymentmethod.type = 'invoice';

				paymentmethod.purchasenumber = this.record.getFieldValue('otherrefnum');

				paymentmethod.paymentterms = {
					internalid: this.record.getFieldValue('terms')
				,	name: this.record.getFieldText('terms')
				};
			}

			this.result.paymentmethods = [paymentmethod];
		}

	,	getExtraRecordFields: function ()
		{
			this.result.payment = Utils.toCurrency(this.record.getFieldValue('payment'));
			this.result.payment_formatted = Utils.formatCurrency(this.record.getFieldValue('payment'));

			this.getInvoices();
			this.getPaymentMethod();
		}
	});
});