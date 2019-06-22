/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.Breadcrumb.View'
,	[	'global_views_breadcrumb.tpl'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function(
		global_views_breadcrumb_tpl

	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class GlobalViews.Breadcrumb.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_breadcrumb_tpl

	,	initialize: function (options)
		{
			var opt_pages = options.pages;

			if (_.isUndefined(opt_pages))
			{
				this.pages = [];
			}
			else if (_.isArray(opt_pages))
			{
				this.pages = opt_pages;
			}
			else
			{
				this.pages = [opt_pages];
			}
		}

		// @method getContext @return GlobalViews.Breadcrumb.View.Context
	,	getContext: function ()
		{
			_.each(this.pages, function(page) 
				{
					if (page['data-touchpoint'])
					{
						page.hasDataTouchpoint = true;
					}

					if (page['data-hashtag'])
					{
						page.hasDataHashtag = true;
					}
				});

			//@class GlobalViews.Breadcrumb.View.Context
			return {
				// @property {Array<Object>} pages
				pages: this.pages
			};
		}
	});
});