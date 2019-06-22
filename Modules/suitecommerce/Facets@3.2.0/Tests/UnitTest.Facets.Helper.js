/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*global SC:false, _:false, require: false, it:false, describe:false, define:false, expect:false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Facets.Helper.js
// --------------------
// Testing Facets Helper & Facets Translator modules.
define('UnitTest.Facets.Helper'
,	[	'jQuery'
	,	'Facets'
	,	'Facets.Helper'
	,	'Utils'
	,	'Application'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		jQuery
	,	facets
	,	facets_helper
	,	Utils
	)
{
	'use strict';

	describe('Facets.Helper', function () {

		var application
		,	current
		,	previous
		,	bike_color_map = {
				'Black': 'black'
			,	'Blue': 'blue'
			,	'Gray': 'gray'
			,	'Green': 'green'
			,	'Red': 'red'
			,	'Silver Black': '#333'
			,	'Violet': 'violet'
			,	'White': 'white'
			,	'Chrome': '#F5F5F5'
			,	'Silver': 'silver'
			};

		beforeEach(function (cb)
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('Facets.Helper');
			var applcation_loaded = jQuery.Deferred();

			// // This is the configuration needed by the modules in order to run
			application.Configuration =  {
					modules: [ 'Facets', 'UrlHelper' ]
				,	get: function (path, defaultValue)
					{
						return Utils.getPathFromObject(this, path, defaultValue);
					}
				,	searchApiMasterOptions: {
						Facets: {
							include: 'facets'
						,	fieldset: 'search'
						//,	custitem_exclude_from_search: 'false'
						}
					,	itemDetails: {
							fieldset: 'details'
						}
					}

					// Facet View

				,	facets: [
						{
							id: 'category'
						,	name: 'Category'
						,	max: 10
						,	behavior: 'single'
						,	url: ''
						,	macro: 'facetCategories'
						,	priority: 11
						,	uncollapsible: true
						}
					,	{
							id: 'custitem_bike_brands'
						,	name: 'Brand'
						,	max: 10
						,	behavior: 'single'
						,	url: 'brand'
						,	priority: 10
						,	uncollapsible: true
						}
					,	{
							id: 'custitem_bike_type'
						,	name: 'Style'
						,	max: 10
						,	behavior: 'multi'
						,	url: 'style'
						,	priority: 9
						,	uncollapsible: true
						}
					,	{
							id: 'custitem_bike_colors'
						,	name: 'Color'
						,	max: 5
						,	behavior: 'multi'
						,	url: 'color'
						,	macro: 'facetColor'
						,	priority: 8
						,	colors: bike_color_map
						}
					,	{
							id: 'custitem_gt_matrix_colors'
						,	name: 'GT Colors'
						,	max: 5
						,	behavior: 'multi'
						,	url: 'gt-colors'
						,	macro: 'facetColor'
						,	priority: 6
						,	colors: bike_color_map
						}
					,	{
							id: 'custitem_matrix_tire_size'
						,	name: 'Matrix Tire Size'
						,	max: 5
						,	behavior: 'multi'
						,	url: 'mtire'
						,	priority: 2
						}
					,	{
							id: 'custitem_tire_size'
						,	name: 'Tire Size'
						,	max: 5
						,	behavior: 'multi'
						,	url: 'tire'
						,	priority: 2
						}
					,	{
							id: 'pricelevel5'
						,	name: 'Price'
						,	url: 'price'
						,	priority: 0
						,	max: 5
						,	behavior: 'range'
						,	macro: 'facetRange'
						,	step: 50
						,	parser: function (value)
							{
								return _.formatCurrency(value);
							}
						}
					]

				,	facetDelimiters: {
						betweenFacetNameAndValue: '/'
					,	betweenDifferentFacets: '/'
					,	betweenDifferentFacetsValues: ','
					,	betweenRangeFacetsValues: 'to'
					,	betweenFacetsAndOptions: '?'
					,	betweenOptionNameAndValue: '='
					,	betweenDifferentOptions: '&'
					}
				,	resultsPerPage: [
						{ items: 10, name: '10 Items' }
					,	{ items: 25, name: '25 Items', isDefault: true }
					,	{ items: 50, name: '50 Items' }
					]

				,	itemsDisplayOptions: [
						{ id: 'list', name: 'List', macro: 'itemListingDisplayList', columns: 1, icon: 'icon-th-list' }
					,	{ id: 'table', name: 'Table', macro: 'itemListingDisplayTable', columns: 2, icon: 'icon-th-large' }
					,	{ id: 'grid', name: 'Grid', macro: 'itemListingDisplayGrid', columns: 4, icon: 'icon-th', isDefault: true }
					]

				,	sortOptions: [
						{ id: 'relevance:asc', name: 'Relevance', isDefault: true }
					,	{ id: 'pricelevel5:asc', name: 'Price, Low to High' }
					,	{ id: 'pricelevel5:desc', name: 'Price, High to Low ' }
					]
			};

			// Starts the application
			application.start([facets], function (){ applcation_loaded.resolve(); });

			applcation_loaded.then(function ()
			{
				if (facets_helper)
				{
					current = facets_helper.parseUrl();
					previous = facets_helper.parseUrl();

					// Resets the Stack
					facets_helper.settings_stack = [];

					// Creates the stack
					facets_helper.setCurrent(previous);
					facets_helper.setCurrent(current);
				}

				if (facets_helper && facets)
				{
					cb();
				}
			});

		});

		it('#1 should provide a utility method to parse a url (facets_helper.parseUrl())', function ()
		{
			 expect(facets_helper.parseUrl).toBeA(Function);
		});

		it('#2 facets_helper.parseUrl() should return a Facets.Translator', function ()
		{
			expect(facets_helper.parseUrl('')).toBeA(facets.Translator);
		});

		it('#3 should allow me to set the current Facets.Translator', function ()
		{
			expect(facets_helper.setCurrent).toBeA(Function);

			expect(facets_helper.settings_stack).toContain(current);
		});

		it('#4 should provide a method to point to the last added Translator', function ()
		{
			expect(facets_helper.getCurrent).toBeA(Function);

			expect(facets_helper.getCurrent()).toBe(current);
		});

		it('#5 should provide a method to point to the Previously added Translator', function ()
		{
			expect(facets_helper.getPrevious).toBeA(Function);

			expect(facets_helper.getPrevious()).toBe(previous);
		});
	});

});