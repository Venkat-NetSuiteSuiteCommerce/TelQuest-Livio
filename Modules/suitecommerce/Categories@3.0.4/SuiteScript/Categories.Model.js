/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Category.js
// -----------
// Handles the Category tree
define(
	'Categories.Model'
,	[
		'SC.Model'
	,	'SC.Models.Init'
	,	'Application'
	,	'Configuration'
	,	'underscore'
	]
,	function (
		SCModel
	,	ModelsInit
	,	Application
	,	Configuration
	,	_
	)
{
	'use strict';
	return SCModel.extend({
		name: 'Category'

	,	categoryColumns: {
			boolean: [
				'displayinsite'
			,	'isinactive'
			,	'isprimaryurl'
			]

		,	sideMenu: {
				'sortBy': 'sequencenumber'
			,	'fields': [
					'name'
				,	'internalid'
				,	'sequencenumber'
				,	'urlfragment'
				,	'displayinsite'
				]
			}

		,	subCategories: {
				'sortBy': 'sequencenumber'
			,	'fields': [
					'name'
				,	'description'
				,	'internalid'
				,	'sequencenumber'
				,	'urlfragment'
				,	'thumbnailurl'
				,	'displayinsite'
				]
			}

		,	category: {
				'fields': [
					'internalid'
				,	'name'
				,	'description'
				,	'pagetitle'
				,	'pageheading'
				,	'pagebannerurl'
				,	'addtohead'
				,	'metakeywords'
				,	'metadescription'
				,	'displayinsite'
				,	'urlfragment'

				,	'idpath' // needed for breadcrumb
				,	'fullurl' // needed for canonical path
				,	'isprimaryurl' // needed for canonical path
				]
			}

		,	breadcrumb: {
				'fields': [
					'internalid'
				,	'name'
				,	'displayinsite'
				]
			}

		,	menu: {
				'sortBy': 'sequencenumber'
			,	'fields': [
					'internalid'
				,	'name'
				,	'sequencenumber'
				,	'displayinsite'
				]
			}

		,	mapping: {
				'internalid': 'subcatid'
			,	'name': 'subcatnameoverride'
			,	'description': 'subcatdescoverride'
			,	'pagetitle': 'subcatpagetitleoverride'
			,	'pageheading': 'subcatpageheadingoverride'
			,	'pagebannerurl': 'subcatpagebannerurloverride'
			,	'addtohead': 'subcataddtoheadoverride'
			,	'metakeywords': 'subcatmetakeywordsoverride'
			,	'metadescription': 'subcatmetadescoverride'
			,	'displayinsite': 'subcatdisplayinsiteoverride'
			,	'sequencenumber': 'subcatsequencenumber'
			,	'thumbnailurl': 'subcatthumbnailurloverride'
			,	'urlfragment': 'subcaturlfragmentoverride'
			}
		}

	,	getColumns: function (element)
		{
			var config = Configuration.categories;

			return _.union(this.categoryColumns[element].fields, config[element].fields);
		}

	,	getSortBy: function (element)
		{
			var config = Configuration.categories;

			return config[element].sortBy || this.categoryColumns[element].sortBy;
		}

	,	get: function (fullurl)
		{
			var cmsRequestT0 = new Date().getTime();

			var self = this;

			var category = {
				parenturl: fullurl.substring(0, fullurl.lastIndexOf('/'))
			,	urlfragment: fullurl.substring(fullurl.lastIndexOf('/') + 1)
			};

			if (category.parenturl)
			{
				category.siblings = this.getCategories(category.parenturl, null, this.getColumns('sideMenu'));

				_.each(category.siblings, function(sibling)
				{
					if (sibling.urlfragment === category.urlfragment)
					{
						category.internalid = sibling.internalid;
					}

					self.fixBooleans(sibling);
				});

				this.sortBy(category.siblings, this.getSortBy('sideMenu'));
			}

			if (category.internalid || (!category.internalid && !category.parenturl))
			{
				var categories = this.getCategories(category.parenturl, { 'internalid': category.internalid, 'fullurl': fullurl }, this.getColumns('category'));

				if (categories.length)
				{
					_.extend(category, categories[0]);
				}
				else
				{
					throw notFoundError;
				}
			}
			else
			{
				throw notFoundError;
			}

			category.categories = this.getCategories(fullurl, null, this.getColumns('subCategories'));

			_.each(category.categories, function(subcategory)
			{
				self.fixBooleans(subcategory);
			});

			this.sortBy(category.categories, this.getSortBy('subCategories'));

			category.breadcrumb = this.getBreadcrumb(category.idpath);
			this.fixBooleans(category);

			var bread = { 'fullurl': category.fullurl };

			_.each(this.getColumns('breadcrumb'), function(column)
			{
				bread[column] = category[column];
			});

			category.breadcrumb.push(bread);

			category._debug_requestTime = (new Date().getTime()) - cmsRequestT0;

			return category;
		}

	,	getCategories: function (parenturl, categoryIds, columns)
		{
			var categories = [];
			var categoriesData;

			if (parenturl)
			{
				var categoriesOverride = this.getCategoriesOverride(parenturl, categoryIds ? categoryIds.internalid : null, columns);
				var i = categoriesOverride.length;

				if (i)
				{
					var categoryids = categoryIds ? categoryIds : _.pluck(categoriesOverride, 'internalid');
					categoriesData = this.getCategoriesData(parenturl, categoryids, columns);

					var processColumn = function (column)
					{
						category[column] = category[column] || categoryData[column];
					};

					while (i--)
					{
						var categoryData = categoriesData[categoriesOverride[i].internalid];

						if (categoryData)
						{
							var category = categoriesOverride[i];

							_.each(columns, processColumn);

							category.fullurl = parenturl + '/' + category.urlfragment;
							category.canonical = categoryData.canonical;

							if (category.displayinsite === 'T')
							{
								categories.push(category);
							}
						}
					}
				}
			}
			else
			{
				categoriesData = _.values(this.getCategoriesData(parenturl, categoryIds, columns));

				_.each(categoriesData, function(category)
				{
					if (category.displayinsite === 'T')
					{
						category.fullurl = '/' + category.urlfragment;
						categories.push(category);
					}
				});
			}

			return categories;
		}

	,	getCategoriesOverride: function (parenturl, categoryid, columns)
		{
			var overrides = []
			,	siteId = ModelsInit.session.getSiteSettings(['siteid']).siteid
			,	searchFilters = [
					new nlobjSearchFilter('fullurl', null, 'is', parenturl)
				,	new nlobjSearchFilter('site', null, 'is', siteId)
				]
			,	searchColumns = []
			,	toSubCategory = this.categoryColumns.mapping;

			if (categoryid)
			{
				searchFilters.push(new nlobjSearchFilter('subcatid', null, 'is', categoryid));
			}

			_.each(columns, function(column)
			{
				toSubCategory[column] && searchColumns.push(new nlobjSearchColumn(toSubCategory[column]));
			});

			var result = Application.getAllSearchResults('commercecategory', searchFilters, searchColumns);

			_.each(result, function(line)
			{
				if (line.getValue(toSubCategory.internalid))
				{
					var override = {};

					_.each(columns, function(column)
					{
						override[column] = line.getValue(toSubCategory[column]);
					});

					overrides.push(override);
				}
			});

			return overrides;
		}

	,	getCategoriesData: function (parenturl, categoryIds, columns)
		{
			var categories = {}
			,	siteId = ModelsInit.session.getSiteSettings(['siteid']).siteid
			,	searchFilters = [
					new nlobjSearchFilter('isinactive', null, 'is', 'F')
				,	new nlobjSearchFilter('site', null, 'is', siteId)
				]
			,	searchColumns = [];

			if (_.isArray(categoryIds))
			{
				searchFilters.push(new nlobjSearchFilter('internalid', null, 'anyof', categoryIds));
				searchFilters.push(new nlobjSearchFilter('isprimaryurl', null, 'is', 'T'));
			}
			else
			{
				//get idpath of the current url and the fullurl of the canonical
				//categoryIds starts with '/', is an url
				var fullurlFilter = new nlobjSearchFilter('fullurl', null, 'is', categoryIds.fullurl);

				searchFilters.push(fullurlFilter);

				if (categoryIds.internalid)
				{
					fullurlFilter.setLeftParens(1).setOr(true);
					searchFilters.push(new nlobjSearchFilter('isprimaryurl', null, 'is', 'T').setLeftParens(1));
					searchFilters.push(new nlobjSearchFilter('internalid', null, 'is', categoryIds.internalid).setRightParens(2));
				}
			}

			_.each(columns, function(column)
			{
				searchColumns.push(new nlobjSearchColumn(column));
			});

			var result = Application.getAllSearchResults('commercecategory', searchFilters, searchColumns);

			_.each(result, function (line)
			{
				var category = {};

				_.each(columns, function(column)
				{
					category[column] = line.getValue(column);
				});

				var cat = categories[line.getValue('internalid')];

				if (cat)
				{
					if (cat.isprimaryurl)
					{
						cat.idpath = category.idpath;
						cat.canonical = cat.fullurl;
					}
					else
					{
						cat.canonical = category.fullurl;
					}
				}
				else
				{
					categories[line.getValue('internalid')] = category;
				}

			});

			return categories;
		}

	,	fixBooleans: function(catObject)
		{
			_.each(this.categoryColumns.boolean, function(column)
			{
				if (catObject[column])
				{
					catObject[column] = catObject[column] ? (catObject[column] === 'T' ? true : false) : '';
				}
			});
		}

	,	getBreadcrumb: function (idpath)
		{
			var self = this
			,	ids = idpath.split('|')
			,	breadcrumb = []
			,	siteId = ModelsInit.session.getSiteSettings(['siteid']).siteid
			,	filters = [
					new nlobjSearchFilter('site', null, 'is', siteId)
				]
			,	searchColumns = [
					new nlobjSearchColumn('isinactive')
				,	new nlobjSearchColumn('fullurl')
				,	new nlobjSearchColumn('idpath').setSort(false)
				]
			,	columns = this.getColumns('breadcrumb')
			,	toSubCategory = this.categoryColumns.mapping;

			_.each(columns, function(column)
			{
				searchColumns.push(new nlobjSearchColumn(column));
				toSubCategory[column] && searchColumns.push(new nlobjSearchColumn(toSubCategory[column]));
			});

			ids.splice(ids.length - 1, 1);

			for (var i = 1; i < ids.length - 1; i++)
			{
				var current = new nlobjSearchFilter('internalid', null, 'is', ids[i]);

				if (i === 1)
				{
					current.setLeftParens(2);
				}
				else
				{
					current.setLeftParens(1);
				}

				var currentChildren = new nlobjSearchFilter('subcatid', null, 'is', ids[i + 1]);

				if (i === ids.length - 2)
				{
					currentChildren.setRightParens(2);
				}
				else
				{
					currentChildren.setRightParens(1).setOr(true);
				}

				filters.push(current);
				filters.push(new nlobjSearchFilter('idpath', null, 'is', ids.slice(0, i + 1).join('|') + '|'));
				filters.push(currentChildren);
			}

			if (filters.length > 1)
			{
				var result = Application.getAllSearchResults('commercecategory', filters, searchColumns);

				var category = {};

				_.each(result, function(crumb, index)
				{

					if (crumb.getValue('isinactive') === 'T')
					{
						throw notFoundError;
					}

					_.each(columns, function(column)
					{
						category[column] = category[column] || crumb.getValue(column);
					});

					if (category.displayinsite === 'F')
					{
						throw notFoundError;
					}

					category.fullurl = crumb.getValue('fullurl');

					breadcrumb.push(category);

					if (index !== result.length - 1)
					{
						category = {};

						_.each(columns, function(column)
						{
							category[column] = crumb.getValue(toSubCategory[column]);
						});
					}
				});
			}

			_.each(breadcrumb, function(category)
			{
				self.fixBooleans(category);
			});

			return breadcrumb;
		}

	,	getCategoryTree: function (level)
		{
			var cmsRequestT0 = new Date().getTime();

			var self = this
			,	result = []
			,	siteId = ModelsInit.session.getSiteSettings(['siteid']).siteid
			,	filters = [
					new nlobjSearchFilter('nestlevel', null, 'lessthanorequalto', level)
				,	new nlobjSearchFilter('isinactive', null, 'is', 'F')
				,	new nlobjSearchFilter('site', null, 'is', siteId)
				]
			,	searchColumns = [
					new nlobjSearchColumn('fullurl')
				,	new nlobjSearchColumn('nestlevel')
				,	new nlobjSearchColumn('idpath').setSort(false)
				]
			,	bag = {}
			,	overrides = {}
			,	columns = this.getColumns('menu')
			,	toSubCategory = this.categoryColumns.mapping;

			_.each(columns, function(column)
			{
				searchColumns.push(new nlobjSearchColumn(column));
				toSubCategory[column] && searchColumns.push(new nlobjSearchColumn(toSubCategory[column]));
			});

			Application.getAllSearchResults('commercecategory', filters, searchColumns).forEach(function (line)
			{
				var idPath = line.getValue('idpath');

				if (!bag[idPath])
				{
					var current = {	categories: [] }
					,	override = overrides[idPath];

					_.each(columns, function(column)
					{
						current[column] = (override && override[column]) ||  line.getValue(column);
					});

					self.fixBooleans(current);

					current.fullurl = line.getValue('fullurl');
					current.level = line.getValue('nestlevel');

					var parentIdPathArr = idPath.split('|');

					if (parentIdPathArr.length > 3)
					{
						parentIdPathArr.splice(parentIdPathArr.length - 2, 1);
					}
					else
					{
						parentIdPathArr = [];
					}

					// Find the idPath of the parent
					current.parentIdPath = parentIdPathArr.join('|');

					if (current.displayinsite)
					{

						if (!current.parentIdPath)
						{
							// Add the roots categories to the result var
							result.push(current);
						}
						else
						{
							// Adding subcategories to parent, by reference is added to result
							bag[current.parentIdPath] && bag[current.parentIdPath].categories.push(current);
						}

						bag[idPath] = current;
					}
				}

				var childId = line.getValue('subcatid');

				if (childId)
				{
					var childIdPath = idPath + childId + '|';

					var child = {};

					_.each(columns, function(column)
					{
						child[column] = line.getValue(toSubCategory[column]);
					});

					overrides[childIdPath] = child;
				}

			});

			this.sortBy(result, this.getSortBy('menu'));

			if (result.length)
			{
				result[0]._debug_requestTime = (new Date().getTime()) - cmsRequestT0;
			}

			return result;
		}

	,	sortBy: function (categories, property)
		{
			if (categories)
			{
				var self = this;
				property = property || 'sequencenumber';

				_.each(categories, function(category)
				{
					self.sortBy(category.categories, property);
				});

				categories.sort(function (a, b)
				{
					//This works with Strings, Numbers, and Numbers as Strings. ie: ['a', 'b', 'c'] OR [1, 3, 20] OR ['1', '3', '20']
					var numberA = Number(a[property])
					,	numberB = Number(b[property]);

					if (!isNaN(numberA) && !isNaN(numberB))
					{
						return numberA - numberB;
					}
					else
					{
						return (a[property] + '').localeCompare(b[property] + '', {}, { numeric: true });
					}
				});
			}
		}
	});
});
