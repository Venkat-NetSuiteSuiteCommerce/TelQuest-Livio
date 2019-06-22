/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'PaymentWizard.Module.Invoice'
	,	'PaymentWizard.Router'
	,	'Invoice.Collection'
	,	'LivePayment.Model'
	,	'Invoice.OpenList.View'
	,	'Profile.Model'
	,	'UnitTestHelper'
	]
,	function (
		ModuleInvoiceView
	,	Router
	,	InvoiceCollection
	,	LivePaymentModel
	,	InvoiceOpenListView
	,	ProfileModel
	,	UnitTestHelper
	)
{
	'use strict';

	var helper = new UnitTestHelper({
		applicationName: 'PaymentWizard.Module.Invoice'
	})

	return describe('Payment Wizard Invoice', function ()
	{
		var view
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

		live_payment_model = new LivePaymentModel({}, {application: helper.application});

		user_invoices = new InvoiceCollection();

		live_payment_model.set('user_invoices', [], {silent: true});
		live_payment_model.set('invoices', invoices_list);

		view = new ModuleInvoiceView({
			wizard: new Router(helper.application, {
				profile: ProfileModel.getInstance()
			,	model: live_payment_model
			})
		});

		// Choosing Invoices
		//------------------------------------------
		describe('Choosing Invoices', function ()
		{
			var model = null;

			beforeEach(function ()
			{
				spyOn(view, '_render');

				model = view.wizard.model;
			});

			describe('selectInvoice', function ()
			{
				it('marks it as checked', function ()
				{
					var invoice_id = 2
					,	invoice = view.invoices.get(invoice_id);

					expect(invoice.get('checked')).toBeFalsy();

					view.toggleInvoice(invoice_id);

					expect(invoice.get('checked')).toBe(true);
				});

				it('and adds it to the wizard model', function ()
				{
					var invoice_id = 1
					,	invoice = view.invoices.get(invoice_id);

					expect(model.get('invoices').contains(invoice)).toBe(true);

					view.toggleInvoice(invoice_id);

					expect(model.get('invoices').contains(invoice)).toBe(true);
				});

				it('only if it finds it', function ()
				{
					var invoice_id = 5
					,	invoice = view.invoices.get(invoice_id);

					view.toggleInvoice(invoice_id);

					expect(model.get('invoices').contains(invoice)).toBe(false);
				});

				it('unless is silent', function ()
				{
					view.toggleInvoice(3, {silent: true});

					expect(view._render).not.toHaveBeenCalled();
				});

				it('or there\'s no invoice', function ()
				{
					view.toggleInvoice();
					view.toggleInvoice('');
					view.toggleInvoice([]);
					view.toggleInvoice(123);

					expect(view._render).not.toHaveBeenCalled();
				});
			});

			describe('unselectInvoice', function ()
			{
				it('unchecks the invoice', function ()
				{
					var invoice_id = 2
					,	invoice = view.invoices.get(invoice_id);

					expect(invoice.get('apply')).toBe(true);

					view.toggleInvoice(invoice_id);

					expect(invoice.get('apply')).toBe(false);
				});

				it('removes it from the wizard model', function ()
				{
					var invoice_id = 1
					,	invoice = view.invoices.get(invoice_id);

					expect(model.get('invoices').contains(invoice)).toBe(true);

					view.toggleInvoice(invoice_id);

					expect(model.get('invoices').contains(invoice)).toBe(true);
				});

				it('unless is silent', function ()
				{
					view.toggleInvoice(3);

					expect(view._render).not.toHaveBeenCalled();
				});

				it('or there\'s no invoice', function ()
				{
					view.toggleInvoice();
					view.toggleInvoice('');
					view.toggleInvoice([]);
					view.toggleInvoice(123);

					expect(view._render).not.toHaveBeenCalled();
				});
			});

			describe('toggleInvoice', function ()
			{
				it('selects the invoice if its not selected', function ()
				{
					var invoice_id = 3;
					
					view.invoices.get(invoice_id);

					spyOn(view, 'selectInvoice');

					view.toggleInvoice(invoice_id);

					expect(view.selectInvoice).toHaveBeenCalled();
				});

				it('unselects it if it is', function ()
				{
					var invoice_id = 1;
					
					view.invoices.get(invoice_id);

					spyOn(view, 'unselectInvoice');

					view.toggleInvoice(invoice_id);
					view.toggleInvoice(invoice_id);

					expect(view.unselectInvoice).toHaveBeenCalled();
				});

				it('as long as there is an invoice', function ()
				{
					var invoice_id = 32;
					
					view.invoices.get(invoice_id);

					spyOn(view, 'selectInvoice');
					spyOn(view, 'unselectInvoice');

					view.toggleInvoice();
					view.toggleInvoice('');
					view.toggleInvoice([]);
					view.toggleInvoice(123);

					expect(view.unselectInvoice).not.toHaveBeenCalled();
					expect(view.selectInvoice).not.toHaveBeenCalled();
				});
			});

			describe('selectAll', function ()
			{

				it('selects all invoices and re renders', function ()
				{
					var invoices_to_pay = view.wizard.model.get('invoices');

					expect(invoices_to_pay.isEmpty()).toBe(false);

					view.selectAll();

					expect(invoices_to_pay.length).toEqual(view.wizard.model.getSelectedInvoices().length);
				});

			});

			describe('unselectAll', function ()
			{

				it('unselects all invoices', function ()
				{
					var invoices_to_pay = model.get('invoices');

					expect(invoices_to_pay.length).toEqual(view.wizard.model.getSelectedInvoices().length);

					view.unselectAll();

					expect(invoices_to_pay.isEmpty()).toBe(false);

					expect(invoices_to_pay.length).not.toEqual(view.wizard.model.getSelectedInvoices().length);
				});

				it('and re renders', function ()
				{
					view.unselectAll();

					expect(view.wizard.model.get('invoices').length).toBe(3);
				});
			});

		});

		// Issue: 285648 Reference My Account -> Billing -> Make a Payment (Step 1: Select invoices to pay): "Unselect All X" check box don´t work correctly
		it('Issue: 285648', function ()
		{
			var invoice_collection = new InvoiceCollection(invoices_list);
			var invoiceOpenList = new InvoiceOpenListView({ application: helper.application, collection: new InvoiceCollection(invoices_list) });
			invoiceOpenList.selectInvoice(invoice_collection.get(1));

			view.selectAll();

			expect(view.invoices.filter(function (invoice) {return !invoice.get('checked');}).length).toBe(0);

		});
	});
});
