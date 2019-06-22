/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'Invoice.Collection'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		InvoiceCollection
	)
{
	'use strict';

	return describe('Invoice Collection', function ()
	{
		var invoice_collection
		,	data = [{
					internalid: 1
				,	status: 'open'
				,	tranDateInMilliseconds : (new Date(2014,0,1)).getTime()
				,	tranid: 1
				}
			,	{
					internalid: 2
				,	status: 'open'
				,	tranDateInMilliseconds : (new Date(2014,0,2)).getTime()
				,	tranid: 2
				}
			,	{
					internalid: 3
				,	status: 'paidinfull'
				,	tranDateInMilliseconds : (new Date(2014,0,3)).getTime()
				,	tranid: 3
				}
			,	{
					internalid: 4
				,	status: 'paidinfull'
				,	tranDateInMilliseconds : (new Date(2014,0,4)).getTime()
				,	tranid: 4
				}
			];

		beforeEach(function()
		{
			invoice_collection = new InvoiceCollection();

			invoice_collection.applySortOri = invoice_collection.applySort;
			invoice_collection.applySort = jasmine.createSpy('fake sort').and.callFake(function()
			{
				return invoice_collection;
			});

			invoice_collection.applyFilterOri = invoice_collection.applyFilter;
			invoice_collection.applyFilter = jasmine.createSpy('fake filter').and.callFake(function()
			{
				return invoice_collection;
			});

			invoice_collection.applyRangeFilterOri = invoice_collection.applyRangeFilter;
			invoice_collection.applyRangeFilter = jasmine.createSpy('fake range filter').and.callFake(function()
			{
				return invoice_collection;
			});

			invoice_collection.reverseOrderOri = invoice_collection.reverseOrder;
			invoice_collection.reverseOrder = jasmine.createSpy('fake reverse order').and.callFake(function()
			{
				return invoice_collection;
			});

			invoice_collection.reset(data);
		});

		describe('Initialization', function ()
		{
			it ('should create a clone of the collection once it get sync or reseted', function ()
			{
				var col = new InvoiceCollection();

				expect(col.original).toBeUndefined();
				col.reset([
					{
						internalid: 1
					}
				,	{
						internalid: 2
				}]);

				expect(col.original).toBeDefined();
				expect(col.original.length).toEqual(2);

			});
		});

		describe('getOpenInvoices', function ()
		{
			it ('should return the correct open invoices when there are open invoices', function ()
			{
				var result = invoice_collection.getOpenInvoices();

				expect(result).toBeAnArray();
				expect(result.length).toEqual(2);

			});

			it ('should return empty otherwise', function ()
			{
				var col = new InvoiceCollection();

				var result = col.getOpenInvoices();

				expect(result).toBeAnArray();
				expect(result.length).toEqual(0);

			});
		});

		describe('getPaidInvoices', function ()
		{
			it ('should return the correct open invoices when there are open invoices', function ()
			{
				var result = invoice_collection.getPaidInvoices();

				expect(result).toBeAnArray();
				expect(result.length).toEqual(2);

			});

			it ('should return empty otherwise', function ()
			{
				var col = new InvoiceCollection();

				var result = col.getPaidInvoices();

				expect(result).toBeAnArray();
				expect(result.length).toEqual(0);

			});
		});

		describe('update', function()
		{
			it('should apply filter and sort if the filter change', function()
			{
				invoice_collection.update({
					filter: 'byName'
				});

				expect(invoice_collection.applyFilter).toHaveBeenCalled();
				expect(invoice_collection.applySort).toHaveBeenCalled();
				expect(invoice_collection.applyRangeFilter).not.toHaveBeenCalled();
				expect(invoice_collection.reverseOrder).not.toHaveBeenCalled();

			});

			it('should apply sort if the sort change', function()
			{
				invoice_collection.update({
					sort: 'byName'
				});

				expect(invoice_collection.applyFilter).not.toHaveBeenCalled();
				expect(invoice_collection.applySort).toHaveBeenCalled();
				expect(invoice_collection.applyRangeFilter).not.toHaveBeenCalled();
				expect(invoice_collection.reverseOrder).not.toHaveBeenCalled();
			});

			it('should apply reverse order if the order change', function()
			{
				invoice_collection.update({
					order: '-1'
				});

				expect(invoice_collection.applyFilter).not.toHaveBeenCalled();
				expect(invoice_collection.applySort).not.toHaveBeenCalled();
				expect(invoice_collection.applyRangeFilter).not.toHaveBeenCalled();
				expect(invoice_collection.reverseOrder).toHaveBeenCalled();
			});

			it('should apply range filter and sort if the range change', function()
			{
				invoice_collection.update({
					range: {
						from: ''
					,	to: ''
					}
				});

				expect(invoice_collection.applyFilter).not.toHaveBeenCalled();
				expect(invoice_collection.applySort).toHaveBeenCalled();
				expect(invoice_collection.applyRangeFilter).toHaveBeenCalled();
				expect(invoice_collection.reverseOrder).not.toHaveBeenCalled();
			});

			it('should apply changes only when the passed in parameters change', function()
			{
				var update_options = {
					range: {
						from: ''
					,	to: ''
					}
				,	order: '-1'
				,	sort: 'byName'
				,	filter: 'byName'
				};

				invoice_collection.update(update_options);
				
				expect(invoice_collection.applySort).toHaveBeenCalled();
				expect(invoice_collection.applySort.calls.count()).toEqual(1);

				expect(invoice_collection.applyFilter).toHaveBeenCalled();
				expect(invoice_collection.applyFilter.calls.count()).toEqual(1);
			});
		});

		describe('applyFilter', function ()
		{
			it('shoudld apply the current selected filter into the colleciton itself', function ()
			{
				invoice_collection.selectedFilter = {
					filter: function ()
					{
						return this.original.filter(function (invoice)
						{
							return invoice.get('status') === 'open';
						});
					}
				};

				invoice_collection.applyFilter = invoice_collection.applyFilterOri;
				invoice_collection.applyFilter();

				expect(invoice_collection.length).toEqual(2);
			});
		});

		describe('fixDateRangeWithTimeZoneOffset', function ()
		{
			it('should return undefined if pass undefined', function ()
			{
				expect(invoice_collection.fixDateRangeWithTimeZoneOffset()).toBeUndefined();
			});

			it('should return undefined if the two passed in dates are invalid', function ()
			{
				//Format day-month-year
				var result = invoice_collection.fixDateRangeWithTimeZoneOffset({
					from: '30-01-2011' //February 30th
				,	to: '30-01-2014' //February 30th
				});

				expect(result).toBeUndefined();
			});

			it('should return two date objects from the passed in string dates', function ()
			{
				//Format day-month-year
				var result = invoice_collection.fixDateRangeWithTimeZoneOffset({
					from: '2014-02-01'
				,	to: '2014-03-01'
				});

				expect(result.from).toBeA(Date);
				expect(result.from.getMonth()).toEqual(1);
				expect(result.from.getDate()).toEqual(1);

				expect(result.to).toBeA(Date);
				expect(result.to.getMonth()).toEqual(2);
				expect(result.to.getDate()).toEqual(1);
			});
		});

		describe('applyRangeFilter', function()
		{
			it('should filter the collection based on the current selected range', function ()
			{
				invoice_collection.range = {
					from: '2014-01-01'
				,	to: '2014-01-02'
				};

				invoice_collection.applyRangeFilter = invoice_collection.applyRangeFilterOri;
				invoice_collection.applyRangeFilter();

				expect(invoice_collection.length).toEqual(2);
			});

			it ('should not apply ant filter if the curent selection range is not valid', function ()
			{
				invoice_collection.range = {
					from: '40-40-2014'
				,	to: '40-40-2014'
				};

				invoice_collection.applyRangeFilter = invoice_collection.applyRangeFilterOri;
				invoice_collection.applyRangeFilter();

				expect(invoice_collection.length).toEqual(4);
			});
		});

		describe('applySort', function ()
		{
			it('shoudld apply the current selected filter into the colleciton itself', function ()
			{
				invoice_collection.selectedSort = {
					sort: function ()
					{
						return this.sortBy(function (invoice)
						{
							return invoice.get('tranid');
						});
					}
				};

				expect(invoice_collection.first().get('internalid')).toEqual(1);
				expect(invoice_collection.last().get('internalid')).toEqual(4);

				invoice_collection.applySort = invoice_collection.applySortOri;
				invoice_collection.reverseOrder = invoice_collection.reverseOrderOri;
				invoice_collection.order = -1;

				invoice_collection.applySort();

				expect(invoice_collection.first().get('internalid')).toEqual(4);
				expect(invoice_collection.last().get('internalid')).toEqual(1);
			});
		});
	});
});