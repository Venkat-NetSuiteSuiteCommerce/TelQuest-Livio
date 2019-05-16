/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module CMSadapter

@class CMSadapter.Impl.Categories.v3 
*/
define('CMSadapter.Impl.Categories.v3'
,	[
		'CMSadapter.Impl.Categories'
	]
,	function (
		CMSadapterImplCategories
	)
{
	'use strict';

	var CMSadapterImplCategories3 = function (application, CMS)
	{
		CMSadapterImplCategories.call(this, application, CMS);
	};

	CMSadapterImplCategories3.prototype = Object.create(CMSadapterImplCategories.prototype);

	CMSadapterImplCategories3.prototype.listenForCMS = function listenForCMS ()
	{
		// CMS listeners - CMS tells us to do something, could fire anytime.
		var self = this;

		// Categories
		self.CMS.on('categories:add', function (promise, data)
		{
			self.showCategory(data.category, promise);
		});

		self.CMS.on('categories:item:update', function (promise)
		{
			promise.resolve();
		});

		self.CMS.on('categories:update', function (promise, data)
		{
			self.updateCategory(data, self.application, function () {
				promise.resolve();
			});
		});

		self.CMS.on('categories:hierarchy:change', function (promise)
		{
			promise.resolve();
		});

		self.CMS.on('categories:remove', function (promise)
		{
			self.removeCategory(function () 
			{
				promise.resolve();
			});
		});

		self.CMS.on('categories:reload', function (promise)
		{
			promise.resolve();
		});

		self.CMS.on('categories:navigate', function (promise, data)
		{
			self.navigate(data, function () 
			{
				promise.resolve();
			});
		});

		self.CMS.on('items:search', function (promise, filters)
		{
			self.getItems(filters, null, function (items) 
			{
				promise.resolve(items);
			});
		});
	};

	return CMSadapterImplCategories3;
});
