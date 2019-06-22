/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(['PaymentWizard.EditAmount.View', 'Invoice.Model', 'UnitTestHelper'], function (View, InvoiceModel, UnitTestHelper)
{
	'use strict';

	var helper = new UnitTestHelper({
		applicationName: 'PaymentWizard.EditAmount.View'
	})

	return describe('Payment Wizard Edit Amount View', function ()
	{

		var invoice_data = {
				refnum: '123'
			,	amount: 120
			,	due: 120
			}
		,	fake_parent_view = {}
		,	fake_options = {
				parentView: fake_parent_view
			,	application: helper.application
			,	type: 'invoice'
		};

		describe('render - output', function ()
		{
			it ('should return a warning message indicating that discount is only available for full payment', function()
			{
				invoice_data.discountapplies = true;
				fake_options.model =  new InvoiceModel(invoice_data);

				var myView = new View(fake_options);
				myView.render();

				expect(myView.$el).toBeDefined();
				expect(myView.$('.payment-wizard-edit-amount-layout-discount-warning').is(':visible')).toEqual(false);

				myView.$('[type="text"]').val(10);
				myView.$('[type="text"]').change();

				expect(myView.$('.payment-wizard-edit-amount-layout-discount-warning').is(':visible')).toEqual(false);
			});


			it('should notify the parent view and close itself when submitting a valid value', function()
			{

				invoice_data.discountapplies = true;
				invoice_data.duewithdiscount = 100;
				fake_options.model =  new InvoiceModel(invoice_data);
				var fake_distributeCredits = jasmine.createSpy('fake distributeCredits');
				fake_options.parentView.wizard = {
					model : {
							distributeCredits: fake_distributeCredits
						,	calculeTotal: function() {return 1000;}
					}
				};

				var myView = new View(fake_options)
				,	fake_modal = jasmine.createSpy('fake modal');
				myView.$containerModal = {
					modal: fake_modal
				};

				myView.render();
				myView.$('[type="text"]').val('100');
				myView.$('[type="text"]').change();

				spyOn(myView, 'destroy');

				myView.$('form').submit();

				expect(fake_options.model.get('amount_formatted')).toEqual(_.formatCurrency('100'));
				expect(fake_options.model.isValid()).toEqual(true);
				expect(fake_distributeCredits).toHaveBeenCalled();
				expect(myView.destroy).toHaveBeenCalled();
				expect(fake_modal).toHaveBeenCalled();


			});

		});
	});
});