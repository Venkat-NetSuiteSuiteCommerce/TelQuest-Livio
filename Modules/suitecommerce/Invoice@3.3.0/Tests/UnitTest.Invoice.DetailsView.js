/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[	'LivePayment.Model'
	,	'Invoice.Details.View'
	]
,   function (
		LivePaymentModel
	,	InvoiceDetailsView
	)
{
	'use strict';

	return describe('Invoice Details View', function ()
	{
		var view
		,   fakeApplication = {};

		beforeEach(function ()
		{
			view = new InvoiceDetailsView({application: fakeApplication});
		});

		describe('initialize', function ()
		{
			it ('should set application property from options', function ()
			{
				expect(view.application).toEqual(fakeApplication);
			});

			it('should throw an exception if it is initialized without an application property', function ()
			{
				var wrapper = function() {
					return new InvoiceDetailsView(null);
				};

				expect(wrapper).toThrow();
			});
		});

		describe('make a payment action', function()
		{
			it ('should mark the specified invoice as detila and trigger userInvocesChange event', function ()
			{
				var old_getInstance_method = LivePaymentModel.getInstance
				,	fake_paymentmodel_instance = {
						selectInvoice: jasmine.createSpy('fake selecte invoice method')
					};

				LivePaymentModel.getInstance = function ()
				{
					return fake_paymentmodel_instance;
				}

				view.model = {
					id: 12
				};

				view.makeAPayment();

				expect(fake_paymentmodel_instance.selectInvoice).toHaveBeenCalledWith(12);

				LivePaymentModel.getInstance = old_getInstance_method;
			});
		});
	});
});