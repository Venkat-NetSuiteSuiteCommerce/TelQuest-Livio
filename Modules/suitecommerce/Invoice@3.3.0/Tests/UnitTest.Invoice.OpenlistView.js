/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'Invoice.OpenList.View'
	,	'Invoice.Collection'
	,	'Invoice.Model'
	,	'underscore'
	,	'jasmine2-typechecking-matchers'
	,	'Application'
	]
,	function (
		InvoiceOpenListView
	,	InvoiceCollection
	,	InvoiceModel
	,	_
	)
{
	'use strict';

	return describe('Open Invoices List View', function ()
	{
		var fakeInvoiceCollection
		,   fakeApplication;

		beforeEach(function()
		{
			fakeApplication = {
				getUser: function()
				{
					return {
						get: function()
						{
							return fakeInvoiceCollection;
						}
					};
				}
			};
			fakeInvoiceCollection = new InvoiceCollection();
		});

		describe('Initialize', function ()
		{
			it ('should initialize with user open invoices', function()
			{
				var invoice_collection = new InvoiceCollection();
				fakeApplication = _.extend(fakeApplication, {
					getLivePayment : function ()
					{
						return {
							get: function ()
							{
								return invoice_collection;
							}
						};
					}
				});
				var view = new InvoiceOpenListView({application: fakeApplication, collection: invoice_collection});

				expect(view.collection).toBeDefined();
				expect(view.collection.length).toEqual(0);
			});

			it ('should attach on user invoes sync or reset', function()
			{
				var invoice_collection = new InvoiceCollection();
				fakeApplication = _.extend(fakeApplication, {
					getLivePayment : function ()
					{
						return {
							get: function ()
							{
								return invoice_collection;
							} }; }
				});
				spyOn(fakeInvoiceCollection, 'on');

				new InvoiceOpenListView({application: fakeApplication, collection: fakeInvoiceCollection});

				expect(fakeInvoiceCollection.on).toHaveBeenCalled();
				var funArguments = fakeInvoiceCollection.on.calls.mostRecent().args[0];
				expect(funArguments.indexOf('sync') >= 0).toBeTruthy();
				expect(funArguments.indexOf('reset') >= 0).toBeTruthy();

			});
		});

		describe('getSelectedInvoicesLength', function ()
		{
			it('should return 0 if there is no invocie selected', function()
			{
				var invoice_collection = new InvoiceCollection();
				fakeApplication = _.extend(fakeApplication, {
					getLivePayment : function ()
					{
						return {
							get: function ()
							{
								return invoice_collection;
							}
						};
					}
				});
				var view = new InvoiceOpenListView({application: fakeApplication, collection: invoice_collection});

				var result = view.getSelectedInvoicesLength();

				expect(result).toBe(0);
			});

			it('should return the number of selected invoice', function()
			{
				var invoice_collection = new InvoiceCollection();
				fakeApplication = _.extend(fakeApplication, {
					getLivePayment : function ()
					{
						return {
							get: function ()
							{
								return invoice_collection;
							}
						};
					}
				});
				fakeInvoiceCollection.add([
					{
						status: {
							internalid: 'open'
						}
					}
				,   {
						status: {
							internalid: 'paidInFull'
						}
				}]);

				var view = new InvoiceOpenListView({application: fakeApplication, collection: fakeInvoiceCollection});
				fakeInvoiceCollection.first().set('checked', true);

				var result = view.getSelectedInvoicesLength();

				expect(result).toBe(1);
			});
		});

		describe('toggleInvoice', function ()
		{
			
			it ('should not call unselectInvoice nor selectInvoice if specified invoice is not valid', function ()
			{
				var invoice_collection = new InvoiceCollection();
				var fake_LivePayment = {
						selectInvoice : jasmine.createSpy('fake select Invocie method')
					,	get: function ()
						{
							return invoice_collection;
						}
					};
				fakeApplication.getLivePayment = function ()
				{
					return fake_LivePayment;
				};

				fakeInvoiceCollection.reset([
						{
							status: {
								internalid: 'open'
							}
						,   id: 123
						}
					,   {
							status: {
								internalid: 'paidInFull'
							}
					}]);

				var view = new InvoiceOpenListView({application: fakeApplication, collection: fakeInvoiceCollection});

				view.collection.first().set('checked', true);

				spyOn(view, 'unselectInvoice');
				spyOn(view, 'selectInvoice');
				view.toggleInvoice('957');

				expect(view.unselectInvoice).not.toHaveBeenCalled();
				expect(view.selectInvoice).not.toHaveBeenCalled();
			});
		});

		describe('selectInvoice', function ()
		{
			it ('should set checked to true', function ()
			{
				var view = new InvoiceOpenListView({application: {}, collection: new InvoiceCollection()})
				,   invoice = new InvoiceModel();

				expect(invoice.get('checked')).toBeFalsy();

				view.selectInvoice(invoice);

				expect(invoice.get('checked')).toBeTruthy();
			});
		});

		describe('unselectInvoice', function ()
		{
			it ('should set checked to false', function ()
			{
				var view = new InvoiceOpenListView({application: {}, collection: new InvoiceCollection()})
				,   invoice = new InvoiceModel();
				invoice.set('checked', true);

				expect(invoice.get('checked')).toBeTruthy();

				view.unselectInvoice(invoice);

				expect(invoice.get('checked')).toBeFalsy();
			});
		});
	});
});