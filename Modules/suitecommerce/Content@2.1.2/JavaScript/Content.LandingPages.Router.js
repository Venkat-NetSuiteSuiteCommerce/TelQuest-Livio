/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Content
define(
	'Content.LandingPages.Router'
,	[	'Content.DataModels'
	,	'Content.EnhancedViews'
	,	'Content.LandingPages.View'

	,	'Backbone'
	]
,	function (
		DataModels
	,	EnhancedViews
	,	View

	,	Backbone
	)
{
	'use strict';

	// @class Content.LandingPages.Router
	// The Landing pages Module uses the Content.DataModels to connect to the servers,
	// That's why there is only a view and a router here @extends Backbone.Router
	return Backbone.Router.extend({

		// @property {Object} routes Are created dynamically based on the URLs in the content.mountToApp
		routes: {}

	,	initialize: function (Application)
		{
			this.Application = Application;
		}

		// @method displayLandingPage uses the DataModels.loadPage to load the data and create the model
	,	displayLandingPage: function (option)
		{
			var self = this
			,	page_url = option ? unescape(Backbone.history.fragment).replace('?' + option, '') : Backbone.history.fragment
			,	view = new View({
					application: this.Application
				,	layout: this.Application.getLayout()
				});

			DataModels.loadPage('/' + page_url, function (page)
			{
				if (page)
				{
					EnhancedViews.overrideViewSettings(view, page);
					view.showContent(page);
				}
				else
				{
					self.Application.getLayout().notFound();
				}
			});
		}
	});
});