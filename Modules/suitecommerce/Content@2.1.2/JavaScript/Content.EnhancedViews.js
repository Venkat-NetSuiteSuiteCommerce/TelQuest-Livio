/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Content
define('Content.EnhancedViews'
,	[
		'Content.DataModels'
	,	'underscore'
	,	'jQuery'

	,	'Backbone.View'
	,	'Backbone.View.render'
	,	'Backbone.View.Plugins'
	]
,	function (
		DataModels
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class Content.EnhancedViews Provides functions that based in a view, sets the title,
	// meta tags and inject html content in the dom
	var EnhancedViews = {
			previousPlaceholders: []
		};

	_.extend(EnhancedViews, {

		// @method overrideViewSettings Updates attributes of the view with the info coming in the page model passed in
		// @param {Backbone.View} view @param {Pages.Model} page
		overrideViewSettings: function (view, page)
		{
			view.contentZones = view.contentZones || [];

			if (page)
			{
				// All info comming off the page has presedence to whats already defined in the view
				view.title = page.get('title') || view.getTitle();
				view.page_header = page.get('pageheader') || view.page_header;
				view.description = page.get('description') || view.description;
				view.metaDescription = page.get('metadescription') || view.getMetaDescription();
				view.metaKeywords = page.get('metakeywords') || view.getMetaKeywords();
				view.template = page.get('template') || view.template;
				view.addToHead = page.get('metaextra') || view.getAddToHead() || '';
				// Everything but the banners, who are merged with other that the view may have,
				view.contentZones = _.union(view.contentZones, page.get('pagecontent'));
			}

			// If you have a default page (this is a page that is pointed by the * url)
			// it will be always merged
			var default_url = DataModels.Urls.Collection.defaultModel
			,	default_page = default_url && DataModels.Pages.Collection.getInstance().get(default_url.get('pageid'));

			if (default_page)
			{
				view.contentZones = _.union(view.contentZones, default_page.get('pagecontent'));
			}

			return view;
		}

	,	initalizeHead: function ()
		{
			return jQuery('head')
				.not(':has(title)').append('<title/>').end()
				.not(':has(link[rel="canonical"])').append('<link rel="canonical"/>').end()
				.not(':has(meta[name="keywords"])').append('<meta name="keywords"/>').end()
				.not(':has(meta[name="description"])').append('<meta name="description"/>').end();
		}

	,	enhanceHead: function (view)
		{
			var title = view.getTitle();

			if (title)
			{
				document.title = title;
			}
			// Sets the text of the title element if we are in the server
			// we only do it on the server side due to an issue modifying
			// the title tag on IE :(
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				this.$head.find('title').text(title);
			}

			return this.enhanceMetaTags(view).enhanceCanonicalLinks(view);
		}

		// @method enhanceMetaTags Enhance the document's head by adding given view metadata.
		// We enclose the added metatags between two special tags so we can delete them when the url changes. We do this like this because
		// we cannot add any strange parameter to added metatags to reference them. @param {Backbone.View} view
	,	enhanceMetaTags: function (view)
		{
			this.$head
				// then we add the description
				.find('meta[name="description"]').attr('content', view.metaDescription || view.getMetaDescription() || '').end()
				// and keywords meta tags
				.find('meta[name="keywords"]').attr('content', view.metaKeywords ||  view.getMetaKeywords() || '').end()
				// then we append the tags specific to this view
				// excluding any extra descriptions and keywords meta tags
				.append(view.getMetaTags().not('[name="description"]').not('[name="keywords"]'));

			// remove head's elements that are between enhanceMetaTagsStart and enhanceMetaTagsEnd
			var remove_element = false; //flag used to determine when remove elements.

			jQuery('head').children().each(function ()
			{
				var $element = jQuery(this)
				,	element_id = $element.attr('id');

				if (element_id === 'enhanceMetaTagsStart')
				{
					remove_element = true;
				}

				if (remove_element)
				{
					$element.remove();
				}

				if (remove_element && element_id === 'enhanceMetaTagsEnd')
				{
					remove_element = false;
				}
			});


			var addToHead = view.getAddToHead();
			//add meta extra elements between enhanceMetaTagsStart and enhanceMetaTagsEnd
			if (addToHead)
			{
				jQuery('<script id="enhanceMetaTagsStart"></script>' + addToHead + '<script id="enhanceMetaTagsEnd"></script>').appendTo(this.$head);
			}

			return this;
		}

		//@method enhanceCanonicalLinks @param {Backbone.View} view
	,	enhanceCanonicalLinks: function (view)
		{
			this.$head
				.find('link[rel="canonical"]').attr('href', view.getCanonical()).end()
				// we remove any existing next/prev tags every time
				// a page is rendered in case the previous view was paginated
				.find('link[rel="next"], link[rel="prev"]').remove();

			// if the current page is paginated
			// set prev/next link rel
			this.setLinkRel('prev', view.getRelPrev());
			this.setLinkRel('next', view.getRelNext());

			return this;
		}

	,	setLinkRel: function (rel, link)
		{
			link && jQuery('<link />', {
				rel: rel
			,	href: link
			}).appendTo(this.$head);
		}

		// EnhancedViews.enhancePage:
		// enhance the DOM based on the attributes of the view
	,	enhancePage: function (view, Layout)
		{
			this.$head = this.$head || this.initalizeHead();
			// changes the page head based on the view attributes
			this.enhanceHead(view);

			// empties the place holders DOMs element
			EnhancedViews.clearPlaceholders();

			// walks the content zones and injects them in the site
			_.each(view.contentZones || [], function (content_zone)
			{
				// its in the layout
				if (view.$(content_zone.target).length === 0)
				{
					// it's empty
					if (jQuery(content_zone.target + ':empty').length === 0)
					{
						return;
					}
				}

				Layout.trigger('renderEnhancedPageContent', view, content_zone);
			});
		}

	,	renderHTMLContent: function (view, content_zone)
		{
			var target = content_zone.target
			,	layout = view.options.application.getLayout();

			// If the target is inside the view
			if (view.$(target).length)
			{
				view.$(target).html(content_zone.content);
				EnhancedViews.previousPlaceholders.push(content_zone.target);
				layout.trigger('afterAppendView', view);
			}
			else
			{
				// Otherwise, if the target is on the layout
				// we have to make sure it's empty
				layout.$(target).filter(':empty').each(function (index, element)
				{
					jQuery(element).html(content_zone.content);
					EnhancedViews.previousPlaceholders.push(content_zone.target);
				});
				layout.trigger('afterAppendView', layout);
			}
		}

		// EnhancedViews.clearPlaceholders:
		// This clears all content that was previously added to the Layout,
		// this method is called by the EnhancedViews.enhancePage
		// for every new page
	,	clearPlaceholders: function ()
		{
			_.each(EnhancedViews.previousPlaceholders, function (previous_placeholder)
			{
				jQuery(previous_placeholder).empty();
			});

			EnhancedViews.previousPlaceholders = [];
		}
	});

	return EnhancedViews;
});
