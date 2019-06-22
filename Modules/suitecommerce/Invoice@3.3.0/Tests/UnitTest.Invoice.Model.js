/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'Invoice.Model'
	,	'Transaction.Line.Collection'
	,	'Transaction.Shipmethod.Collection'
	,	'Address.Collection'
	,	'CreditCard.Collection'
	,	'Transaction.Paymentmethod.Collection'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		InvoiceModel
	,	OrderLinesCollection
	,	ShipmethodsCollection
	,	AddressesCollection
	,	CreditCardsCollection
	,	OrderPaymentmethodCollection
	)
{
	'use strict';

	return describe('Invoice Module', function ()
	{
		describe('Initialization', function ()
		{
			it ('should set checked false and payment properties', function ()
			{
				var model = new InvoiceModel({amountremaining: 123});

				expect(model.get('checked')).toBeFalsy();
				expect(model.get('payment')).toBeFalsy();
				expect(model.get('payment_formatted')).toBeFalsy();
			});

			it ('should attach on property lists changes', function ()
			{
				var model = new InvoiceModel({amountremaining: 123});

				model.set('lines', []);
				model.set('shipmethods',[]);
				model.set('addresses',[]);
				model.set('paymentmethods',[]);

				expect(model.get('lines')).toBeA(OrderLinesCollection);
				expect(model.get('shipmethods')).toBeA(ShipmethodsCollection);
				expect(model.get('addresses')).toBeA(AddressesCollection);
				expect(model.get('paymentmethods')).toBeA(OrderPaymentmethodCollection);
			});
		});
	});
});