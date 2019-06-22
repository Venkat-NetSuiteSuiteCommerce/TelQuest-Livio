/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*

@module CMSadapter

@class CMSadapter.Impl.Categories the class that do the actual integration job using the CMS API. Usage:

	var adapter = new CMSadapterImpl(application, CMS);
	adapter.init();

This will start the cms adapter, for example listening to the ESC key to be pressed to load the CMS
administrator and collaborating with with it to accomplish use cases (mostly landing pages).

In addition the PageRouter must be initialized to implement the full pages experience.

*/
define('CMSadapter.Impl.Categories'
,	[
		'Facets.Model'
	,	'Facets.Helper'
	,	'Facets.Browse.View'
	,	'Facets.Router'
	,	'Categories'
	,	'Categories.Model'
	,	'Categories.Collection'
	,	'AjaxRequestsKiller'
	,	'jQuery'
	,	'underscore'
	,	'Backbone'
	]
,	function (
		FacetsModel
	,	FacetsHelper
	,	FacetsBrowseView
	,	FacetsRouter
	,	Categories
	,	CategoriesModel
	,	CategoriesCollection
	,	AjaxRequestsKiller
	,	jQuery
	,	_
	,	Backbone
	)
{
	'use strict';

	function AdapterCategories(application, CMS)
	{
		this.CMS = CMS;
		this.application = application;

		this.listenForCMS();
	}

	AdapterCategories.prototype.listenForCMS = jQuery.noop;

	AdapterCategories.prototype._convertToCategory = function _convertToCategory (categoryData)
	{
		//TODO: manage overrides

		return {
			'name': categoryData.name
		,	'description': categoryData.description
		,	'pagetitle': categoryData.page_title
		,	'pageheading': categoryData.page_header
		,	'pagebanner': ''
		,	'addtohead': categoryData.add_to_head
		,	'metakeywords': categoryData.meta_keywords
		,	'metadescription': categoryData.meta_description
		,	'categories': []
		,	'breadcrumb': [{
				'name': categoryData.name
			,	'fullurl': ''
			}]
		};

		/*
		//TODO: manage add sub category

		var category = this.category ? this.category : { 'breadcrumb': [{ 'name': '', 'fullurl': '' }] };

		category.name = categoryData.overrides && categoryData.overrides.name ? categoryData.overrides.name : categoryData.name;
		category.description = categoryData.overrides && categoryData.overrides.description ? categoryData.overrides.description : categoryData.description;
		category.pagetitle = categoryData.overrides && categoryData.overrides.page_title ? categoryData.overrides.page_title : categoryData.page_title;
		category.pageheading = categoryData.overrides && categoryData.overrides.page_header ? categoryData.overrides.page_header : categoryData.page_header;
		category.addtohead = categoryData.overrides && categoryData.overrides.add_to_head ? categoryData.overrides.add_to_head : categoryData.add_to_head;
		category.metakeywords = categoryData.overrides && categoryData.overrides.meta_keywords ? categoryData.overrides.meta_keywords : categoryData.meta_keywords;
		category.metadescription = categoryData.overrides && categoryData.overrides.meta_description ? categoryData.overrides.meta_description : categoryData.meta_description;

		category.breadcrumb[category.breadcrumb.length - 1].name = category.name;

		return category;

		*/
	};

	AdapterCategories.prototype.showCategory = function (categoryData, functionToCallback)
	{
		var self = this;
		var translatorConfig = this.application.translatorConfig;
		var fullurl = categoryData.urls && categoryData.urls.length && categoryData.urls[0] === 'temp_cms_new_category_url' ? '' : Backbone.history.fragment;
		var translator = FacetsHelper.parseUrl(fullurl, translatorConfig, true);

		var categoryModel = new CategoriesModel(this._convertToCategory(categoryData));
		var facetsModel = new FacetsModel({ 'items': [], 'facets': [], 'total': 0 });
		facetsModel.set('category', categoryModel);

		facetsModel.fetch({
			data: translator.getApiParams()
		,	killerId: AjaxRequestsKiller.getKillerId()
		}).done(function()
		{
			var view = new FacetsBrowseView({
				translator: translator
			,	translatorConfig: translatorConfig
			,	application: self.application
			,	model: facetsModel
			});

			translator.setLabelsFromFacets(facetsModel.get('facets') || []);
			view.showContent();
			
			functionToCallback();
		});
	};

	AdapterCategories.prototype.updateCategory = function (data, application, functionToCallback)
	{
		if (data.saving)
		{
			var collection = new CategoriesCollection();

			collection.fetch()
				.done(function(menu)
				{
					Categories.addToNavigationTabs(menu);

					// IF is a root category AND (it was just created OR the fragment url have changed) THEN we add the url to the router
					if (!data.category.parents.length && (!data.category.last_modified || data.original_url !== data.category.urls[0]))
					{
						var router = new FacetsRouter(application);

						router.addUrl(data.category.urls, 'categoryLoading');
					}

					functionToCallback();
				});
		}
		else
		{
			// To show the changes before saving it, we need to show the category data that sends the CMS admin
			this.showCategory(data.category, functionToCallback);
		}
	};

	AdapterCategories.prototype.removeCategory = function (functionToCallback) 
	{
		var collection = new CategoriesCollection();

		collection.fetch().done(function(menu)
		{
			Categories.addToNavigationTabs(menu);

			Backbone.history.navigate('/', {trigger:true});

			functionToCallback();
		});
	};

	AdapterCategories.prototype.navigate = function (data, functionToCallback) 
	{
		var categoryModel = new CategoriesModel();

		categoryModel.options = {
			data: { 'fullurl': data.url[0] !== '/' ? '/' + data.url : data.url }
		,	killerId: AjaxRequestsKiller.getKillerId()
		};

		var self = this;

		categoryModel.fetch({}).done(function(cat)
		{
			self.category = cat;

			Backbone.history.navigate(data.url, { trigger: false });
			Backbone.history.loadUrl(data.url);

			functionToCallback();
		});
	};

	AdapterCategories.prototype.getItems = function (filters, cmsFieldset, functionToCallback)
	{
		var model = new FacetsModel(cmsFieldset);

		model.fetch({
			data: _.extend(filters, {})
		,	killerId: AjaxRequestsKiller.getKillerId()
		})
		.done(function()
		{
			var items = [];

			model.get('items').each(function (item)
			{
				items.push({
					name: item.get('_name')
				,	internal_id: item.get('internalid')
				,	unique_identifier: '' + item.get('internalid')
				,	price: item.get('_price_formatted')
				,	image_url: item.get('_thumbnail').url
				});
			});

			functionToCallback(items);
		});
	};

	return AdapterCategories;
});
