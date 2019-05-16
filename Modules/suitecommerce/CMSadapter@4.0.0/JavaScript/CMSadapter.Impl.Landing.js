/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*

@module CMSadapter

@class CMSadapter.Impl.Landing
*/

define('CMSadapter.Impl.Landing'
,	[
		'underscore'
	,	'Backbone'
	,	'jQuery'
	]
,	function (
		_
	,	Backbone
	,	jQuery
	)
{
	'use strict';

	function AdapterLanding(application, CMS, pageRouter)
	{
		this.CMS = CMS;
		this.application = application;
		this.pageRouter = pageRouter;

		if (pageRouter)
		{
			this.listenForCMS();
		}
	}

	AdapterLanding.prototype.listenForCMS = jQuery.noop;

	// landing pages handlers

	// @method realoadLandingPages called when user clicks on 'manage pages mode' in admin.
	// Remember that might be unpublished landing pages and so in the admin navigation to these ones must work even if they aren't real landing pages.
	AdapterLanding.prototype.realoadLandingPages = function (data)
	{
		var self = this;
		
		_.each(data.pages, function(page)
		{
			if (page.type === 1)
			{
				self.pageRouter.addLandingRoute(page);
			}
		});
	};

	// @method addLandingPages NOTE: Add a new page(s) to your collection, also passes a bool value (trigger) that should be used to auto-navigate to the new page.
	AdapterLanding.prototype.addLandingPages = function (data)
	{
		this.pageRouter.addLandingRoute(data.page);

		if (data.trigger)
		{
			Backbone.history.navigate(data.page.url, {trigger:true});
		}
		else
		{
			this.CMS.trigger('adapter:page:changed');
		}
	};

	//@method navigateLandingPage handler called when the user navigates inside the admin. NOTE: Provides url so that the page can be reloaded or navigated to (Backbone History, etc).
	AdapterLanding.prototype.navigateLandingPage = function (data)
	{
		Backbone.history.navigate(data.url, {trigger:true});
	};

	AdapterLanding.prototype.updateLandingPage = function (data)  // Update an existing page with title, header, meta, etc.
	{
		if (data.saving)
		{
			if (data.page.type === 1)
			{
				//update the router internally with possible new urls (virtual - they are not published but for the admin navigation to work correctly)
				this.pageRouter.addLandingRoute(data.page, data.original_url);
			}

			if (data.trigger)
			{
				// Heads up!
				// Edit Live Site > Landing Pages > "Page not found" error for new published landing page
				// navigate wont refresh the page if you are in the same url but it will change the url of the browser
				// loadUrl will navigate to the url but won't change the url of the browser, that's why we use both
				Backbone.history.navigate(data.page.url, { trigger: false });
				Backbone.history.loadUrl(data.page.url);
			}
			else
			{
				this.CMS.trigger('adapter:page:changed');
			}
		}
	};

	return AdapterLanding;
});
