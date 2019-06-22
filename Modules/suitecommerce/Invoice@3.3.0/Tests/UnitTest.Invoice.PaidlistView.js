/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
    [
        'Invoice.Collection'
    ,   'Invoice.PaidList.View'
    ,   'jasmine2-typechecking-matchers'
    ]
,   function (
        InvoiceCollection
    ,   InvoicePaidListView
    )
{
    'use strict';

    return describe('Paid Invoices List View', function ()
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
                var view = new InvoicePaidListView({application: fakeApplication, collection: new InvoiceCollection()});

                expect(view.collection).toBeDefined();
                expect(view.collection.length).toEqual(0);
            });

            it ('should attach on user invoes sync or reset', function()
            {
                spyOn(fakeInvoiceCollection, 'on');

                new InvoicePaidListView({application: fakeApplication, collection: fakeInvoiceCollection});

                expect(fakeInvoiceCollection.on).toHaveBeenCalled();
                var funArguments = fakeInvoiceCollection.on.calls.mostRecent().args[0];
                expect(funArguments.indexOf('sync') >= 0).toBeTruthy();
                expect(funArguments.indexOf('reset') >= 0).toBeTruthy();

            });
        });
    });
});