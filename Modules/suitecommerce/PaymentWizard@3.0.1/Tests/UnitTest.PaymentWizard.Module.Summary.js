/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'PaymentWizard.Module.Summary'
	,	'PaymentWizard.Router'
	,	'Invoice.Collection'
	,	'LivePayment.Model'
	,	'Profile.Model'
	]
,	function (
		ModuleSummaryView
	,	Router
	,	InvoiceCollection
	,	LivePaymentModel
	,	ProfileModel
	)
{
	'use strict';

	return describe('Payment Wizard Summary Module', function ()
	{
		var view
		,	application
		,	user_invoices
		,	live_payment_model
		,	invoices_list = [
					{
						dueinmilliseconds: -1
					,	id: 1
					,	internalid: 1
					,	tranid: '22'
					,	amountremaining: 100.7
					,	due: 2
					}
				,	{
						dueinmilliseconds: 10
					,	id: 2
					,	internalid: 2
					,	tranid: '21'
					,	amountremaining: 100.1
					,	due: 33
					}
				,	{
						dueinmilliseconds: 100
					,	id: 3
					,	internalid: 3
					,	tranid: '20'
					,	amountremaining: 143.6
					,	due: 4
					}
				];

		// view object definition and initialization
		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('MyAccount');

			live_payment_model = new LivePaymentModel({}, {application: application});
			//I must instanciate the application and its name must by 'MyAccount', and only then require MyAccountConfiguration

			user_invoices = new InvoiceCollection();

			live_payment_model.set('user_invoices', [], {silent: true});
			live_payment_model.set('invoices', invoices_list);

			view = new ModuleSummaryView({
				wizard: new Router(application, {
					profile: ProfileModel.getInstance()
				,	model: live_payment_model
				})
			});

		});

		describe('is Active Behaviour', function ()
		{
			it('should be active only when it is present', function()
			{
				expect(view.isActive()).toEqual(false);
				view.present();
				expect(view.isActive()).toEqual(true);
				view.past();
				expect(view.isActive()).toEqual(false);
				view.present();
				expect(view.isActive()).toEqual(true);
				view.future();
				expect(view.isActive()).toEqual(false);
			});
		});

		describe('Continue Button', function ()
		{
			it('should be disable if there is no invoice selected', function()
			{
				view.present();
				view.render();

				expect(view.$('button').is(':disabled')).toEqual(true);
				expect(view.$('.payment-wizard-summary-module-invoices-number').text()).toBe('0');

				live_payment_model.selectInvoice(1);
				expect(view.$('button').is(':disabled')).toEqual(false);
				expect(view.$('.payment-wizard-summary-module-invoices-number').text()).toBe('1');

				live_payment_model.selectInvoice(2);
				expect(view.$('.payment-wizard-summary-module-invoices-number').text()).toBe('2');
			});
		});
	});
});