/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// CustomerPayment.Model.js
define(
	'CustomerPayment.Model'
,	[
		'Transaction.Model'
	,	'ExternalPayment.Model'
	,	'Utils'
	]
,	function (
		TransactionModel
	,	ExternalPayment
	,	Utils
	)
{
	'use strict';

	// @class CustomerPayment.Model
	// Defines the model used by the CustomerPayment.Service.ss service
	// @extends Transaction.Model
	return TransactionModel.extend({

		name: 'CustomerPayment'

		// @method setPaymentMethod
		// Binds customer payment method to customer payment object to return.
	,	getPaymentMethod: function ()
		{
			this.result.paymentmethods = [];

			Utils.setPaymentMethodToResult(this.record, this.result);
		}

		// @method setInvoices
		// Binds invoices to customer payment object to return
		// @returns invoices {Object}
	,	getInvoices: function ()
		{
			this.result.invoices = [];

			for (var i = 1; i <= this.record.getLineItemCount('apply') ; i++)
			{
				var apply = this.record.getLineItemValue('apply', 'apply', i) === 'T';

				if (apply)
				{
					var invoice = {
						internalid: this.record.getLineItemValue('apply', 'internalid', i)
					,	type: this.record.getLineItemValue('apply', 'type', i)
					,	total: Utils.toCurrency(this.record.getLineItemValue('apply', 'total', i))
					,	total_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'total', i))
					,	apply: apply
					,	applydate: this.record.getLineItemValue('apply', 'applydate', i)
					,	currency: this.record.getLineItemValue('apply', 'currency', i)
					,	disc: Utils.toCurrency(this.record.getLineItemValue('apply', 'disc', i))
					,	disc_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'disc', i))
					,	amount: Utils.toCurrency(this.record.getLineItemValue('apply', 'amount', i))
					,	amount_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'amount', i))
					,	due: Utils.toCurrency(this.record.getLineItemValue('apply', 'due', i))
					,	due_formatted: Utils.formatCurrency(this.record.getLineItemValue('apply', 'due', i))
					,	refnum: this.record.getLineItemValue('apply', 'refnum', i)
					};

					this.result.invoices.push(invoice);
				}
			}
		}

	,	getExtraRecordFields: function ()
		{
			//@property {Number} balance
			this.result.balance = Utils.toCurrency(this.record.getFieldValue('balance'));

			//@property {Number} balance_formatted
			this.result.balance_formatted = Utils.formatCurrency(this.record.getFieldValue('balance'));

			//@property {String} autoapply
			this.result.autoapply = this.record.getFieldValue('autoapply');

   			//@property {Number} payment
			this.result.payment = Utils.toCurrency(this.record.getFieldValue('payment'));

			//@property {Number} payment_formatted
			this.result.payment_formatted = Utils.formatCurrency(this.record.getFieldValue('payment'));

			//@property {String} lastmodifieddate
			this.result.lastmodifieddate = this.record.getFieldValue('lastmodifieddate');

			// @property {Array<Object>} paymentMethods
			this.getPaymentMethod();

			// @property {Array<Object>} invoices
			this.getInvoices();

			if (this.record.getFieldValue('paymethtype') === 'external_checkout')
			{
				// @property {String} redirecturl
				this.result.redirecturl = ExternalPayment.generateUrl(this.result.internalid, this.result.recordtype);

				// @property {String} paymenteventholdreason
				this.result.paymenteventholdreason = this.record.getFieldValue('paymenteventholdreason');

				// @property {String} statuscode
				this.result.statuscode = this.result.paymenteventholdreason  === 'FORWARD_REQUESTED'  ? 'redirect' : '';
			}

			this.result.invoices_total = Utils.toCurrency(this.record.getFieldValue('applied')); 
			this.result.invoices_total_formatted = Utils.formatCurrency(this.record.getFieldValue('applied')); 
		}
	});
});