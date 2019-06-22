/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'UnitTest.ListHeader.Preconditions'
	,	'ListHeader.View'
	]
,	function (Preconditions, ListHeader)
{
	'use strict';

	beforeEach(function()
	{		
		window.SC = window.SC || {};
		window.SC.ENVIRONMENT = window.SC.ENVIRONMENT || {};
	}); 

	return describe('List Header', function ()
	{
		var list_header
		,	fake_application
		,	fake_collection
		,	fake_selectable
		,	fake_rangeFilter
		,	fake_view
		,	fake_options;

		beforeEach(function ()
		{

			fake_collection = new Backbone.Collection();
			fake_view = new Backbone.View();
			fake_application = {
				getConfig: function(){}
			};

			fake_options = {
				application : fake_application
			,	collection: fake_collection
			,	selectable: fake_selectable
			,	rangeFilter: fake_rangeFilter
			,	view: fake_view
			};
		});

		describe('getInitialDateRange', function ()
		{

			it('should return undefined is there is NO range filter selected', function ()
			{
				list_header = new ListHeader(fake_options);

				var result = list_header.getInitialDateRange();

				expect(result).toBeUndefined();
			});

			it('when filter range will return if there is not quantity days specified', function ()
			{
				fake_options.notUseDefaultDateRange = true;
				list_header = new ListHeader(fake_options);

				var result = list_header.getInitialDateRange();

				expect(result).toBeUndefined();
			});

			it('returns a range of 30 days for that amount of days when is configured in the configuration', function ()
			{
				fake_options.rangeFilter = true;
				fake_options.application = {
					getConfig: function ()
					{
						return 30;
					}
				};
				list_header = new ListHeader(fake_options);
				var expected_date_from = new Date();
				expected_date_from.setDate(expected_date_from.getDate() - 30);

				var result = list_header.getInitialDateRange();

				expect(result).toBeDefined();
				expect(result.to).toBe(_.dateToString(new Date()));
				expect(result.from).toBe(_.dateToString(expected_date_from));
			});

			it('returns a range of 15 days for that amount of days when is specified', function ()
			{
				fake_options.rangeFilter = true;
				fake_options.notUseDefaultDateRange = true;
				fake_options.quantityDaysRange = 15;
				list_header = new ListHeader(fake_options);
				var expected_date_from = new Date();
				expected_date_from.setDate(expected_date_from.getDate() - fake_options.quantityDaysRange);

				var result = list_header.getInitialDateRange();

				expect(result).toBeDefined();
				expect(result.to).toBe(_.dateToString(new Date()));
				expect(result.from).toBe(_.dateToString(expected_date_from));
			});
		});

		describe('updateCollection', function ()
		{
			beforeEach(function ()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should call collection update when the selected current filters', function ()
			{
				fake_collection.update = jasmine.createSpy('fake update');
				list_header.selectedFilter = 'selected Filter';
				list_header.selectedSort = 'selected sort';
				list_header.order = 'selected order';

				list_header.updateCollection();

				var callArgs = fake_collection.update.calls.mostRecent().args;
				expect(callArgs[0].filter).toBe('selected Filter')
				expect(callArgs[0].range).toBe(null)
				expect(callArgs[0].sort).toBe('selected sort')
				expect(callArgs[0].order).toBe('selected order')

				expect(callArgs[1]).toBe(list_header);
				// expect(fake_collection.update).toHaveBeenCalledWith({
				// 	filter: 'selected Filter'
				// ,	range: null
				// ,	sort: 'selected sort'
				// ,	order: 'selected order'
				// ,	page: undefined
				// ,	killerId: undefined
				// }, list_header);
			});

			it('should return itself', function ()
			{
				fake_collection.update = jasmine.createSpy('fake update');

				var result = list_header.updateCollection();

				expect(result).toBe(list_header);
			});
		});

		describe('getFilter', function ()
		{
			it('should return the specified filter from the list of filter if present', function ()
			{
				fake_options.filters = [{
						value: 'filter1'
					}
				,	{
						value: 'filter2'
					}];

				list_header = new ListHeader(fake_options);
				var result = list_header.getFilter('filter1');

				expect(result).toBeDefined();
				expect(result).toEqual({value:'filter1'});
			});

			it ('should not return anything if nothing is passed', function ()
			{
				fake_options.filters = [{
					value: 'filter1'
					}
				,	{
					value: 'filter2'
				}];

				list_header = new ListHeader(fake_options);

				var result = list_header.getFilter();

				expect(result).toBeUndefined();
			});

			it ('should not return anything if invalid values are passed', function ()
			{
				fake_view.filterOptions = [];

				list_header = new ListHeader(fake_options);

				var result = list_header.getFilter('fruit');

				expect(result).toBeUndefined();
			});
		});

		describe('getSort', function ()
		{
			it('should return the specified filter from the list of filter if present', function ()
			{
				fake_options.sorts = [{
						value: 'sort1'
					}
				,	{
						value: 'sort2'
					}];

				list_header = new ListHeader(fake_options);

				var result = list_header.getSort('sort1');

				expect(result).toBeDefined();
				expect(result).toEqual({value:'sort1'});
			});

			it ('should not return anything if nothing is passed', function ()
			{
				fake_options.sorts = [{
					value: 'sort1'
					}
				,	{
					value: 'sort2'
				}];

				list_header = new ListHeader(fake_options);

				var result = list_header.getSort();

				expect(result).toBeUndefined();
			});

			it ('should not return anything if invalid values are passed', function ()
			{
				fake_view.sortOptions = [];

				list_header = new ListHeader(fake_options);

				var result = list_header.getSort('fruit');

				expect(result).toBeUndefined();
			});
		});

		describe('getDisplay', function ()
		{
			it('should return the specified display from the list of dysplayOptions if present', function ()
			{
				fake_options.displays = [{
						id: 'display1'
					}
				,	{
						id: 'display2'
					}];

				list_header = new ListHeader(fake_options);

				var result = list_header.getDisplay('display1');

				expect(result).toBeDefined();
				expect(result).toEqual({id:'display1'});
			});

			it ('should not return anything if nothing is passed', function ()
			{
				fake_options.displays = [{
					id: 'display1'
					}
				,	{
					id: 'display2'
				}];

				list_header = new ListHeader(fake_options);

				var result = list_header.getDisplay();

				expect(result).toBeUndefined();
			});

			it ('should not return anything if invalid values are passed', function ()
			{
				fake_options.displays = [];

				list_header = new ListHeader(fake_options);

				var result = list_header.getDisplay('fruit');

				expect(result).toBeUndefined();
			});
		});

		describe('getFilterFromUrl', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('in case getFilter returns truthy should return it', function ()
			{
				var expected_result = 'my result';
				list_header.getFilter = jasmine.createSpy('fake getFilter').and.callFake(function ()
				{
					return expected_result;
				});

				var result  = list_header.getFilterFromUrl();

				expect(result).toEqual(expected_result);
			});

			it('will return the default filter otherwise', function ()
			{
				var expected_result = 'my result';
				list_header.getDefaultFilter = jasmine.createSpy('fake getDefaultFilter').and.callFake(function()
				{
					return expected_result;
				});
				list_header.getFilter = jasmine.createSpy('fake getFilter').and.callFake(function ()
				{
					return false;
				});

				var result  = list_header.getFilterFromUrl();

				expect(result).toEqual(expected_result);
			});
		});

		describe('getDisplayFromUrl', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('in case getDisplay returns truthy should return it', function ()
			{
				var expected_result = 'my result';
				list_header.getDisplay = jasmine.createSpy('fake getDisplay').and.callFake(function ()
				{
					return expected_result;
				});

				var result  = list_header.getDisplayFromUrl();

				expect(result).toEqual(expected_result);
			});

			it('will return the default display otherwise', function ()
			{
				var expected_result = 'my result';
				list_header.getDefaultDisplay = jasmine.createSpy('fake getDefaultDisplay').and.callFake(function()
				{
					return expected_result;
				});
				list_header.getDisplay = jasmine.createSpy('fake getDisplay').and.callFake(function ()
				{
					return false;
				});

				var result  = list_header.getDisplayFromUrl();

				expect(result).toEqual(expected_result);
			});
		});

		describe('getRangeFromUrl', function()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should throw an exception if an invalid (truthly) value is pass', function()
			{
				expect(function() {list_header.getRangeFromUrl({}); }).toThrow();
				expect(function() {list_header.getRangeFromUrl(123); }).toThrow();
				expect(function() {list_header.getRangeFromUrl(true); }).toThrow();
			});

			it('returns an undefined to and from if the passed value is false', function()
			{
				expect(list_header.getRangeFromUrl(0)).toEqual({from:undefined, to: undefined});
				expect(list_header.getRangeFromUrl('')).toEqual({from:undefined, to: undefined});
				expect(list_header.getRangeFromUrl(false)).toEqual({from:undefined, to: undefined});
			});

			it('in case a string is passed with a "to" will return the splited string', function ()
			{
				var result = list_header.getRangeFromUrl('fromtorest');

				expect(result).toEqual({from: 'from', to: 'rest'});
			});

			it('will take only the first two split if there are many "to\'s"', function ()
			{
				var result = list_header.getRangeFromUrl('FROMtoRESTtoREST2');

				expect(result).toEqual({from: 'FROM', to: 'REST'});
			});

			it('returns the entire string as from if there is not "to"', function ()
			{
				var result = list_header.getRangeFromUrl('FROM');

				expect(result).toEqual({from: 'FROM', to: undefined});
			});
		});

		describe('getSortFromUrl', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('in case getSort returns truthy should return it', function ()
			{
				var expected_result = 'my result';
				list_header.getSort = jasmine.createSpy('fake getSort').and.callFake(function ()
				{
					return expected_result;
				});

				var result  = list_header.getSortFromUrl();

				expect(result).toEqual(expected_result);
			});

			it('will return the default filter otherwise', function ()
			{
				var expected_result = 'my result';
				list_header.getDefaultSort = jasmine.createSpy('fake getDefaultSort').and.callFake(function()
				{
					return expected_result;
				});
				list_header.getSort = jasmine.createSpy('fake getSort').and.callFake(function ()
				{
					return false;
				});

				var result  = list_header.getSortFromUrl();

				expect(result).toEqual(expected_result);
			});
		});

		describe('getOrderFromUrl', function()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it ('should return -1 in case the text passed in is "inverse"', function ()
			{
				var result = list_header.getOrderFromUrl('inverse');

				expect(result).toEqual(-1);
			});

			it ('will return 1 otherwise', function ()
			{
				expect(list_header.getOrderFromUrl('fake')).toEqual(1);
				expect(list_header.getOrderFromUrl(1)).toEqual(1);
				expect(list_header.getOrderFromUrl(false)).toEqual(1);
				expect(list_header.getOrderFromUrl()).toEqual(1);
				expect(list_header.getOrderFromUrl({})).toEqual(1);
			});
		});

		describe('getPageFromUrl', function()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it ('should return the integer number passed', function ()
			{
				var int_number = 34
				,	result = list_header.getPageFromUrl(int_number);

				expect(result).toEqual(int_number);
			});

			it ('will return 1 otherwise', function ()
			{
				expect(list_header.getPageFromUrl('fake')).toEqual(1);
				expect(list_header.getPageFromUrl(1)).toEqual(1);
				expect(list_header.getPageFromUrl(0)).toEqual(1);
				expect(list_header.getPageFromUrl(-12)).toEqual(1);
				expect(list_header.getPageFromUrl(false)).toEqual(1);
				expect(list_header.getPageFromUrl()).toEqual(1);
				expect(list_header.getPageFromUrl({})).toEqual(1);
			});
		});

		describe('getDefaultFilter', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should return return default value if it is set', function ()
			{
				list_header.defaultFilter = 'expected value';

				var result = list_header.getDefaultFilter();

				expect(result).toEqual(list_header.defaultFilter);
			});

			it('if the default filter is not set should set it and retur form the filter list', function ()
			{
				var expected_value = {
						name: 'Second'
					,	selected : true
					};

				list_header.filters = [{
						name: 'First'
					}
				,	expected_value];

				var result = list_header.getDefaultFilter();

				expect(result).toEqual(expected_value);
				expect(list_header.defaultFilter).toEqual(expected_value);
			});

			it('otherwise will return the first of the list setting the detault filter', function ()
			{
				var expected_result = {
						name: 'First'
					};

				list_header.filters = [expected_result];

				var result = list_header.getDefaultFilter();

				expect(result).toEqual(expected_result);
				expect(list_header.defaultFilter).toEqual(expected_result);
			});
		});

		describe('getDefaultSort', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should return return default value if it is set', function ()
			{
				list_header.defaultSort = 'expected value';

				var result = list_header.getDefaultSort();

				expect(result).toEqual(list_header.defaultSort);
			});

			it('if the default Sort is not set should set it and retur form the filter list', function ()
			{
				var expected_value = {
						name: 'Second'
					,	selected : true
					};

				list_header.sorts = [{
						name: 'First'
					}
				,	expected_value];

				var result = list_header.getDefaultSort();

				expect(result).toEqual(expected_value);
				expect(list_header.defaultSort).toEqual(expected_value);
			});

			it('otherwise will return the first of the list setting the detault filter', function ()
			{
				var expected_result = {
						name: 'First'
					};

				list_header.sorts = [expected_result];

				var result = list_header.getDefaultSort();

				expect(result).toEqual(expected_result);
				expect(list_header.defaultSort).toEqual(expected_result);
			});
		});

		describe('getDefaultDisplay', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should return return default value if it is set', function ()
			{
				list_header.defaultDisplay = 'expected value';

				var result = list_header.getDefaultDisplay();

				expect(result).toEqual(list_header.defaultDisplay);
			});

			it('if the default filter is not set should set it and retur form the filter list', function ()
			{
				var expected_value = {
						name: 'Second'
					,	selected : true
					};

				list_header.displays = [{
						name: 'First'
					}
				,	expected_value];

				var result = list_header.getDefaultDisplay();

				expect(result).toEqual(expected_value);
				expect(list_header.defaultDisplay).toEqual(expected_value);
			});

			it('otherwise will return the first of the list setting the detault filter', function ()
			{
				var expected_result = {
						name: 'First'
					};

				list_header.displays = [expected_result];

				var result = list_header.getDefaultDisplay();

				expect(result).toEqual(expected_result);
				expect(list_header.defaultDisplay).toEqual(expected_result);
			});
		});

		describe('isDefaultFilter', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should return true if default filter is exactly the same as the value passed in', function()
			{
				var expected_value = {fake:true};
				list_header.getDefaultFilter = jasmine.createSpy('fake getDefaultFilter').and.callFake(function ()
				{
					return expected_value;
				});

				expect(list_header.isDefaultFilter(expected_value)).toEqual(true);
			});

			it('should return false otherwise', function()
			{
				var expected_value = {fake:true};
				list_header.getDefaultFilter = jasmine.createSpy('fake getDefaultFilter').and.callFake(function ()
				{
					return expected_value;
				});

				expect(list_header.isDefaultFilter({fake:true})).toEqual(false);
				expect(list_header.isDefaultFilter()).toEqual(false);
				expect(list_header.isDefaultFilter(false)).toEqual(false);
				expect(list_header.isDefaultFilter(true)).toEqual(false);
				expect(list_header.isDefaultFilter('')).toEqual(false);
				expect(list_header.isDefaultFilter('some value')).toEqual(false);
			});
		});

		describe('isDefaultSort', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should return true if default filter is exactly the same as the value passed in', function()
			{
				var expected_value = {fake:true};
				list_header.getDefaultSort = jasmine.createSpy('fake getDefaultSort').and.callFake(function ()
				{
					return expected_value;
				});

				expect(list_header.isDefaultSort(expected_value)).toEqual(true);
			});

			it('should return false otherwise', function()
			{
				var expected_value = {fake:true};
				list_header.getDefaultSort = jasmine.createSpy('fake getDefaultSort').and.callFake(function ()
				{
					return expected_value;
				});

				expect(list_header.isDefaultSort({fake:true})).toEqual(false);
				expect(list_header.isDefaultSort()).toEqual(false);
				expect(list_header.isDefaultSort(false)).toEqual(false);
				expect(list_header.isDefaultSort(true)).toEqual(false);
				expect(list_header.isDefaultSort('')).toEqual(false);
				expect(list_header.isDefaultSort('some value')).toEqual(false);
			});
		});

		describe('isDefaultDisplay', function ()
		{
			beforeEach(function()
			{
				list_header = new ListHeader(fake_options);
			});

			it('should return true if default display is exactly the same as the value passed in', function()
			{
				var expected_value = {fake:true};
				list_header.getDefaultDisplay = jasmine.createSpy('fake getDefaultDisplay').and.callFake(function ()
				{
					return expected_value;
				});

				expect(list_header.isDefaultDisplay(expected_value)).toEqual(true);
			});

			it('should return false otherwise', function()
			{
				var expected_value = {fake:true};
				list_header.getDefaultDisplay = jasmine.createSpy('fake getDefaultDisplay').and.callFake(function ()
				{
					return expected_value;
				});

				expect(list_header.isDefaultDisplay({fake:true})).toEqual(false);
				expect(list_header.isDefaultDisplay()).toEqual(false);
				expect(list_header.isDefaultDisplay(false)).toEqual(false);
				expect(list_header.isDefaultDisplay(true)).toEqual(false);
				expect(list_header.isDefaultDisplay('')).toEqual(false);
				expect(list_header.isDefaultDisplay('some value')).toEqual(false);
			});
		});

		describe('filterHandler', function ()
		{
			it('should call unselectAll, updateUrl and set selectedFilter', function ()
			{
				list_header = new ListHeader(fake_options);

				list_header.unselectAll = jasmine.createSpy('fake unselectAll');
				list_header.updateUrl = jasmine.createSpy('fake updateUrl').and.callFake(function ()
				{
					return list_header;
				});
				list_header.getFilter = jasmine.createSpy('fake getFilter').and.callFake(function ()
				{
					return 'selected Filter';
				});

				list_header.filterHandler({
					target: {
						value: 'value passed in'
					}
				});

				expect(list_header.unselectAll).toHaveBeenCalled();
				expect(list_header.updateUrl).toHaveBeenCalled();
				expect(list_header.getFilter).toHaveBeenCalledWith('value passed in');
				expect(list_header.selectedFilter).toEqual('selected Filter');
			});
		});

		describe('sortHandler', function ()
		{
			it('should call updateUrl and set selectedSort', function ()
			{
				list_header = new ListHeader(fake_options);

				list_header.updateUrl = jasmine.createSpy('fake updateUrl').and.callFake(function ()
				{
					return list_header;
				});
				list_header.getSort = jasmine.createSpy('fake getSort').and.callFake(function ()
				{
					return 'selected Sort';
				});

				list_header.sortHandler({
					target: {
						value: 'value passed in'
					}
				});

				expect(list_header.updateUrl).toHaveBeenCalled();
				expect(list_header.getSort).toHaveBeenCalledWith('value passed in');
				expect(list_header.selectedSort).toEqual('selected Sort');
			});
		});

		describe('toggleSortHandler', function ()
		{
			it('should change the order and call updateUrl', function ()
			{
				list_header = new ListHeader(fake_options);

				list_header.order = 12;
				list_header.updateUrl = jasmine.createSpy('fake updateUrl').and.callFake(function ()
				{
					return list_header;
				});

				list_header.toggleSortHandler();

				expect(list_header.updateUrl).toHaveBeenCalled();
				expect(list_header.order).toEqual(-12);
			});
		});

		describe('selectAll', function ()
		{
			it('should call selectAll on the view if the view has this prop', function ()
			{
				fake_options.view.selectAll = jasmine.createSpy('fake view select all');
				list_header = new ListHeader(fake_options);

				list_header.selectAll();

				expect(fake_view.selectAll).toHaveBeenCalled();
			});

			it('otherwise dont call anything', function ()
			{
				list_header = new ListHeader(fake_options);

				list_header.selectAll();

				expect(fake_view.selectAll).toBeUndefined();
			});
		});

		describe('unselectAll', function ()
		{
			it('should call unselectAll on the view if the view has this prop', function ()
			{
				fake_options.view.unselectAll = jasmine.createSpy('fake view select all');
				list_header = new ListHeader(fake_options);

				list_header.unselectAll();

				expect(fake_view.unselectAll).toHaveBeenCalled();
			});

			it('otherwise dont call anything', function ()
			{
				list_header = new ListHeader(fake_options);

				list_header.unselectAll();

				expect(fake_view.unselectAll).toBeUndefined();
			});
		});

		xdescribe('rangeFilter', function ()
		{
		});

		describe('pager', function ()
		{
			it('should removes the page parameter if default or not valid', function ()
			{
				Backbone.history.fragment = '#transactionhistory?page=1';
				list_header = new ListHeader(fake_options);

				expect(list_header.pager(1)).toEqual('#transactionhistory');
			});

			it('should removes the page parameter if not valid', function ()
			{
				Backbone.history.fragment = '#transactionhistory?page=yutryutr';
				list_header = new ListHeader(fake_options);

				expect(list_header.pager('yutryutr')).toEqual('#transactionhistory');
			});

			it('should leave the url with the page parameter if it is not the default and is valid', function ()
			{
				Backbone.history.fragment = '#transactionhistory?page=2';
				list_header = new ListHeader(fake_options);

				expect(list_header.pager(2)).toEqual('#transactionhistory?page=2');
				expect(list_header.pager(3)).toEqual('#transactionhistory?page=3');
				expect(list_header.pager(35)).toEqual('#transactionhistory?page=35');
			});
		});

		describe('displayer', function ()
		{
			it('should removes the display parameter if default', function ()
			{
				Backbone.history.fragment = '#productlist/5?display=list';
				list_header = new ListHeader(fake_options);

				var expected_result = {'id': 'list'};
				list_header.getDefaultDisplay = jasmine.createSpy('fake getDefaultDisplay').and.callFake(function()
				{
					return expected_result;
				});

				expect(list_header.displayer('list')).toEqual('#productlist/5');
			});

			it('should leave the url with the display parameter if it is not the default and is valid', function ()
			{
				Backbone.history.fragment = '#productlist/5?display=condensed';
				list_header = new ListHeader(fake_options);

				var expected_result = {'id': 'list'};
				list_header.getDefaultDisplay = jasmine.createSpy('fake getDefaultDisplay').and.callFake(function()
				{
					return expected_result;
				});

				expect(list_header.displayer('condensed')).toEqual('#productlist/5?display=condensed');
			});
		});
	});
});
