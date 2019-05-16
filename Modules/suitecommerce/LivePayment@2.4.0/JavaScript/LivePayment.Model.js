/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module LivePayment 
define('LivePayment.Model'
,	[	'Invoice.Collection'
	,	'PaymentWizard.CreditTransaction.Collection'
	,	'Address.Collection'
	,	'Transaction.Paymentmethod.Collection'
	,	'Profile.Model'
	,	'Singleton'
	,	'bignumber'
	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		InvoiceCollection
	,	CreditTransactionCollection
	,	AddressesCollection
	,	TransactionPaymentmethodCollection
	,	ProfileModel
	,	Singleton
	,	BigNumber
	,	_
	,	Backbone
	)
{
	'use strict';

	// @class LivePayment.Model Is singleton. @extends Backbone.Model
	return Backbone.Model.extend({

		urlRoot: 'services/LivePayment.Service.ss'

	,	initialize: function (attributes)
		{
			this.set('invoices_total', 0);

			this.on('sync', function (model)
			{
				model.set('invoices_total', 0);
			});

			this.on('change:addresses', function (model, addresses)
			{
				model.set('addresses', new AddressesCollection(addresses), {silent: true});
			});
			this.trigger('change:addresses', this, attributes && attributes.addresses || []);

			this.on('change:paymentmethods', function (model, paymentmethods)
			{
				model.set('paymentmethods', new TransactionPaymentmethodCollection(paymentmethods), {silent: true});
			});
			this.trigger('change:paymentmethods', this, attributes && attributes.paymentmethod || []);

			this.on('change:invoices', function (model, invoices)
			{
				model.set('invoices', new InvoiceCollection(invoices), {silent: true});
			});
			this.trigger('change:invoices', this, attributes && attributes.invoices || []);

			this.on('change:deposits', function (model, deposits)
			{
				model.set('deposits', new CreditTransactionCollection(deposits), {silent: true});
			});
			this.trigger('change:deposits', this, attributes && attributes.deposits || []);

			this.on('change:credits', function (model, credits)
			{
				model.set('credits', new CreditTransactionCollection(credits), {silent: true});
			});
			this.trigger('change:credits', this, attributes && attributes.credits || []);

			this.on('change:balance', function (model)
			{
				var profile_model = ProfileModel.getInstance();
				profile_model.set('balance', model.get('balance'));
				profile_model.set('balance_formatted', model.get('balance_formatted'));
			});

		}

		// @method getSelectedInvoices @return {Invoice.Collection}
	,	getSelectedInvoices: function ()
		{
			return new InvoiceCollection(this.get('invoices').filter(function (invoice)
			{
				return invoice.get('apply');
			}));
		}

		// @method getAppliedTransactions @return  {PaymentWizard.CreditTransaction.Collection}
	,	getAppliedTransactions: function (type)
		{
			return new CreditTransactionCollection(this.get(type).filter(function (transaction)
			{
				return transaction.get('apply');
			}));
		}

		// @method selectInvoice @param {Invoice.Model}
	,	selectInvoice: function (invoice)
		{
			invoice = this.get('invoices').get(invoice);

			if (invoice && invoice.get('due'))
			{
				// marks the invoice as checked
				invoice.set('apply', true);
				invoice.set('checked', true);
				var amount =  invoice.get('due') ? invoice.get('due') : invoice.get('amount');
				invoice.set('amount', amount);
				invoice.set('amount_formatted', _.formatCurrency(amount));
			}

			return this.distributeCredits();
		}

		// @method unselectInvoice @param {Invoice.Model}
	,	unselectInvoice: function (invoice)
		{
			invoice = this.get('invoices').get(invoice);

			if (invoice)
			{
				invoice.set('apply', false);
				invoice.set('checked', false);
			}

			return this.distributeCredits();
		}

		// @method selectCredit @param {PaymentWizard.CreditTransaction.Model} credit
	,	selectCredit: function (credit)
		{
			credit = this.get('credits').get(credit);

			if (credit && credit.get('remaining'))
			{
				// marks the credit as checked
				credit.set('apply', true);

				var amount = BigNumber(credit.get('remaining')).minus(this.get('payment')).toNumber();

				if (BigNumber(amount).greaterThan(0))
				{
					amount = BigNumber(credit.get('remaining')).minus(amount).toNumber();
				}
				else
				{
					amount = credit.get('remaining');
				}

				credit.set('amount', amount);
				credit.set('amount_formatted', _.formatCurrency(amount));
			}

			return this.calculeTotal();
		}

		// @method selectDeposit @param {PaymentWizard.CreditTransaction.Model} deposit
	,	selectDeposit: function (deposit)
		{
			deposit = this.get('deposits').get(deposit);

			if (deposit && deposit.get('remaining'))
			{
				// marks the credit as checked
				deposit.set('apply', true);

				var amount = BigNumber(deposit.get('remaining')).minus(this.get('payment')).toNumber();

				if (BigNumber(amount).greaterThan(0))
				{
					amount = BigNumber(deposit.get('remaining')).minus(amount).toNumber();
				}
				else
				{
					amount = deposit.get('remaining');
				}

				deposit.set('amount', amount);
				deposit.set('amount_formatted', _.formatCurrency(amount));
			}

			return this.calculeTotal();
		}

		// @method unselectCredit @param {PaymentWizard.CreditTransaction.Model} credit
	,	unselectCredit: function (credit)
		{
			credit = this.get('credits').get(credit);

			if (credit)
			{
				credit.set('apply', false);
				credit.set('amount', 0);
				credit.set('amount_formatted', _.formatCurrency(0));
			}

			return this.calculeTotal();
		}

		// @method unselectDeposit @param {PaymentWizard.CreditTransaction.Model} deposit
	,	unselectDeposit: function (deposit)
		{
			deposit = this.get('deposits').get(deposit);

			if (deposit)
			{
				deposit.set('apply', false);
				deposit.set('amount', 0);
				deposit.set('amount_formatted', _.formatCurrency(0));
			}

			return this.calculeTotal();
		}

		// @method normalizeDate @param {Date} date @return {Date|Number}
	,	normalizeDate: function (date)
		{
			if (!date)
			{
				return;
			}
			else if (date instanceof Date)
			{
				return date.getTime();
			}
			else if (typeof date === 'string')
			{
				return Date.parse(date);
			}
			else if (typeof date === 'number')
			{
				return date;
			}
		}


		// Distributes deposits, payments and credit memos

		// @method distributeCredits
	,	distributeCredits: function ()
		{
			// First thing is to order everything by date and initialize parameters
			var	self = this
			,	invoices = new InvoiceCollection(this.getSelectedInvoices().sortBy(function (invoice)
				{
					return self.normalizeDate(invoice.get('duedate'));
				}))
			,	deposits = this.get('deposits')
			,	credits = this.get('credits')
			,	invoices_total = 0;

			invoices.each(function (invoice)
			{
				invoices_total = BigNumber(invoices_total).plus(invoice.get('amount')).toNumber();
			});

			//Then apply remaining deposits to complete
			deposits.each(function (deposit)
			{
				if (BigNumber(deposit.get('remaining')).greaterThan(0) && BigNumber(invoices_total).greaterThan(0))
				{

					var amount = BigNumber(invoices_total).greaterThanOrEqualTo(deposit.get('remaining')) ? deposit.get('remaining') : invoices_total;

					deposit.set('apply', true);
					deposit.set('amount', amount);
					deposit.set('amount_formatted', _.formatCurrency(amount));

					invoices_total = BigNumber(invoices_total).minus(amount).toNumber();
				}
				else
				{
					deposit.set('apply', false);
					deposit.set('amount', 0);
					deposit.set('amount_formatted', _.formatCurrency(0));
				}
			});

			//Now try to apply credit memo and payments.
			credits.each(function (credit)
			{
				if (BigNumber(credit.get('remaining')).greaterThan(0) && BigNumber(invoices_total).greaterThan(0))
				{

					var amount = BigNumber(invoices_total).greaterThanOrEqualTo(credit.get('remaining')) ? credit.get('remaining') : invoices_total;

					credit.set('apply', true);
					credit.set('amount', amount);
					credit.set('amount_formatted', _.formatCurrency(amount));

					invoices_total = BigNumber(invoices_total).minus(amount).toNumber();
				}
				else
				{
					credit.set('apply', false);
					credit.set('amount', 0);
					credit.set('amount_formatted', _.formatCurrency(0));
				}
			});

			this.calculeTotal();
		}

		// @method calculeTotal @param {Boolean} silent
	,	calculeTotal: function (silent)
		{
			var invoices_total = 0
			,	payment_total = 0
			,	deposits_total = 0
			,	credits_total = 0
			,	self = this
			,	invoices = new InvoiceCollection(this.getSelectedInvoices().sortBy(function (invoice)
				{
					return self.normalizeDate(invoice.get('duedate'));
				}))
			,	deposits = this.get('deposits')
			,	credits = this.get('credits');

			invoices.each(function (invoice)
			{
				invoices_total = BigNumber(invoices_total).plus(invoice.get('amount')).toNumber();
			});

			payment_total = invoices_total;

			deposits.each(function (deposit)
			{
				deposits_total = BigNumber(deposits_total).plus(deposit.get('amount')).toNumber();
				payment_total = BigNumber(payment_total).minus(deposit.get('amount')).toNumber();
			});

			credits.each(function (credit)
			{
				credits_total = BigNumber(credits_total).plus(credit.get('amount')).toNumber();
				payment_total = BigNumber(payment_total).minus(credit.get('amount')).toNumber();
			});

			if (!silent)
			{
				this.set('invoices_total_formatted', _.formatCurrency(invoices_total));
				this.set('invoices_total', invoices_total);

				this.set('deposits_total_formatted', _.formatCurrency(BigNumber(deposits_total).negated().toNumber()));
				this.set('deposits_total', deposits_total);

				this.set('credits_total_formatted', _.formatCurrency(BigNumber(credits_total).negated().toNumber()));
				this.set('credits_total', credits_total);

				this.set('payment_formatted', _.formatCurrency(payment_total));
				this.set('payment', payment_total);
			}

			return payment_total;
		}
	}, Singleton);
});
