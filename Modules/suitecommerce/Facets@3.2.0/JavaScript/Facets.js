/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets AKA Item List.
// @class Facets This is the index, routes in the router are assigned here
// @extends ApplicationModule
define(
	'Facets'
,	[	'Facets.Translator'
	,	'Facets.Model'
	,	'Facets.Router'
	,	'Categories'

	,	'underscore'
	,	'Utils'

	// loading declared templates in configuration > resource.template
	,	'facets_item_cell_grid.tpl'
	,	'facets_item_cell_table.tpl'
	,	'facets_item_cell_list.tpl'
	,	'facets_faceted_navigation_item.tpl'
	,	'facets_faceted_navigation_item_color.tpl'
	,	'facets_faceted_navigation_item_range.tpl'
	]
,	function (
		Translator
	,	Model
	,	Router
	,	Categories

	,	_
	,	Utils
	)
{
	'use strict';

	function prepareRouter (application, router)
	{
		// we are constructing this regexp like:
		// /^\b(toplevelcategory1|toplevelcategory2|facetname1|facetname2|defaulturl)\b\/(.*?)$/
		// and adding it as a route

		var facets_to_include = new Translator().getFacetsToInclude();

		// Here we generate an array with:
		// * The default url
		// * The Names of the facets that are in the siteSettings.facetfield config
		// * And the url of the top level categories
		var components = _.compact(_.union(
			[application.translatorConfig.fallbackUrl]
		,	facets_to_include || []
		));

		router.addUrl(components, 'facetLoading');

		var categoriesTopLevelUrl = Categories.getTopLevelCategoriesUrlComponent();

		router.addUrl(categoriesTopLevelUrl, 'categoryLoading');
	}

	function setTranslatorConfig (application)
	{
		// Formats a configuration object in the way the translator is expecting it
		application.translatorConfig = {
			fallbackUrl: application.getConfig('defaultSearchUrl')
		,	defaultShow: _.result(_.find(application.getConfig('resultsPerPage'), function (show) { return show.isDefault; }) || application.getConfig('resultsPerPage')[0], 'items')
		,	defaultOrder: _.result(_.find(application.getConfig('sortOptions'), function (sort) { return sort.isDefault; }) || application.getConfig('sortOptions')[0], 'id')
		,	defaultDisplay: _.result(_.find(application.getConfig('itemsDisplayOptions'), function (display) { return display.isDefault; }) || application.getConfig('itemsDisplayOptions')[0], 'id')
		,	facets: application.getConfig('facets')
		,	facetsAsUrlParameters: application.getConfig('facetsAsUrlParameters')
		,	facetDelimiters: application.getConfig('facetDelimiters')
		,	facetsSeoLimits: application.getConfig('facetsSeoLimits')
		};
	}

	function prepareItemDisplayOptions (application)
	{
		/*---------------------------
		itemsDisplayOptions is set when the user loads the page with the current width of the screen device, NOT the width of the browser.
		This option is NOT responsive, so if the user loads the page with the desktop resolution, even if he resize the browser, he will still see the view of the desktop.

		Display type and columns supported by screen resolution:

		Mobile
		Display types -> List, Table
			List -> columns  [1, 2]
			Table -> columns [1, 2]

		Tablet
		Display types  -> List, Table
			List -> columns [1, 2, 3, 4, 6, 12]
			Table -> columns [1, 2, 3, 4, 6, 12]

		Desktop
		Display types	->
			List -> columns [1, 2, 3, 4, 6, 12]
			Table -> columns [1, 2, 3, 4, 6, 12]
			Grid -> columns [1, 2, 3, 4, 6, 12]
		--------------------------*/

		if (!Utils.isPageGenerator())
		{
			var screenType = Utils.getDeviceType();

			// Phone Specific
			if (screenType === 'phone')
			{
				application.Configuration.itemsDisplayOptions = application.Configuration.itemsDisplayOptionsPhone;
				application.Configuration.sortOptions = application.Configuration.sortOptionsPhone;
				application.Configuration.defaultPaginationSettings = application.Configuration.defaultPaginationSettingsPhone;
			}
			// Tablet Specific
			else if (screenType === 'tablet')
			{
				application.Configuration.itemsDisplayOptions = application.Configuration.itemsDisplayOptionsTablet;
				application.Configuration.sortOptions = application.Configuration.sortOptionsTablet;
				application.Configuration.defaultPaginationSettings = application.Configuration.defaultPaginationSettingsTablet;
			}
		}
	}

	return {
		// @property {Class<FacetsTranslator>} Translator the facets translator class
		Translator: Translator

	,	Model:  Model

	,	Router: Router

	,	setTranslatorConfig: setTranslatorConfig

		// @method prepareRouter
	,	prepareRouter: prepareRouter

		// @property {Object} facetConfigParsers configuration facet parsers available in the configuration: facets->parser properties. Third party modules could add new here.
	,	facetConfigParsers: {
			currency: function (value)
			{
				return Utils.formatCurrency(value);
			}
		,	quantity: function (value)
			{
				return Utils.formatQuantity(value);
			}
		,	'default': function (value)
			{
				return value;
			}
		}

	,	mountToApp: function (application)
		{
			//Post-process the configuration
			application.Configuration.facets = application.Configuration.facets || [];

			prepareItemDisplayOptions(application);

			var facets = application.Configuration.get('facets');

			facets = _.sortBy(facets, function (facet1, facet2)
			{
				return facet1.priority > facet2.priority ? 0 : 1;
			});

			_.each(facets, function (facet)
			{
				facet.colors = application.getLayout().getColorPalette(facet.colors);
			});

			setTranslatorConfig(application);

			var routerInstance = new Router(application);

			prepareRouter(application, routerInstance);

			// set up facet configuration parsers
			var self = this;

			_.each(application.Configuration.get('facets'), function(facet)
			{
				if (facet.parser)
				{
					facet.parser = self.facetConfigParsers[facet.parser];
				}

				if (!facet.parser)
				{
					facet.parser = self.facetConfigParsers['default'];
				}
			});

			return routerInstance;
		}
	};
});
