/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module NavigationHelper
define('NavigationHelper.Plugins.Standard'
,	[	'underscore'
	,	'Backbone'

	,	'UrlHelper'
	,	'Utils'
	]
,	function (
		_
	,	Backbone
	)
{
	'use strict';

	// @class NavigationHelper.Plugins.Standard Contains the standard navigation helper behavior. @extends ApplicationModule
	var standardPlugins = {

		//@method isNOTURLHashtagPart Determines if the passed in string URL is intended to be used as a hashtag.
		//IMPORTANT: This function also evaluate Backbone.history.options.pushState.
		//@param {String} url
		//@return {Boolean}
		isNOTURLHashtagPart: function (url)
		{
			return 	Backbone.history.options.pushState ||
					url === '#' ||
					url.indexOf('http://') === 0 ||
					url.indexOf('https://') === 0 ||
					url.indexOf('mailto:') === 0 ||
					url.indexOf('tel:') === 0;
		}

		//@method correctURL Intercepts mousedown events on all anchors with no data-touchpoint attribute and fix its href attribute to work when opening a link
		//@param {ApplicationSkeleton.Layout} layout General application layout
		//@param {jQuery.Event} e jQuery event
		//@return {jQuery.Event} e
	,	correctURL: function (layout, e)
		{
			var context = layout.generateNavigationContext(e)
			,	window_obj = _.getWindow()
			,	href = layout.getUrl(context) || '#';

			if (!context.target_data.touchpoint && !standardPlugins.isNOTURLHashtagPart(href))
			{
				if (context.target_data.toggle === 'show-in-modal' || context.target_data.toggle === 'show-in-pusher')
				{
					context.$target.data('original-href', href);
					href = window_obj.location.href;
				}
				else if (window_obj.location.hash)
				{
					href = window_obj.location.href.replace(/#.*$/, '#' + href);
				}
				else if (window_obj.location.href.lastIndexOf('#')  ===  window_obj.location.href.length - 1)
				{
					href = window_obj.location.href +  href;
				}
				else
				{
					href = window_obj.location.href + '#' + href;
				}

				layout.setUrl(context.$target, href);
			}

			return e;
		}

		//@method clickNavigation Handle standard click navigation for the cases were the target is NOT a modal
		//@param {ApplicationSkeleton.Layout} layout General application layout
		//@param {jQuery.Event} e jQuery event
		//@return {jQuery.Event} e
	,	clickNavigation: function (layout, e)
		{
			e.preventDefault();

			// Grabs info from the event element
			var context = layout.generateNavigationContext(e)
			,	href = layout.getUrl(context) || ''
			,	target_is_blank = layout.isTargetBlank(e) || e.button === 1
			,	target_is_modal_or_pusher = context.target_data.toggle === 'show-in-modal' || (context.target_data.toggle === 'show-in-pusher' && _.isPhoneDevice())
			,	is_disabled = context.$target.attr('disabled')
			,	is_dropdown = context.target_data.toggle === 'dropdown'
			,	is_external;

			if (is_disabled)
			{
				e.stopPropagation();
				return e;
			}

			if (context.target_data.originalHref && !target_is_blank)
			{
				href = context.target_data.originalHref;
			}

			// Pusher fix
			layout.$el.removeClass('sc-pushing');

			if (href === '#' || href === '' || is_dropdown)
			{
				return e;
			}

			// The navigation is within the same browser window
			if (!target_is_blank)
			{
				// There is a modal open
				if (layout.$containerModal)
				{
					layout.$containerModal.modal('hide');
				}

				//Wants to open this link in a modal or pusher
				if (!target_is_modal_or_pusher)
				{
					is_external = ~href.indexOf('http:') || ~href.indexOf('https:') || ~href.indexOf('mailto:') || ~href.indexOf('tel:');

					if (is_external)
					{
						_.getWindow().document.location.href = href;
					}
					else
					{
						Backbone.history.navigate(href, {trigger: true});
					}
				}
			}
			else
			{
				_.getWindow().open(href, _.uniqueId('window'));
			}

			return e;
		}

		//@method mountToApp
		//@param {ApplicationSkeleton} application
	,	mountToApp: function (application)
		{
			var layout = application.getLayout();

			//Install Standard Navigation Plugins

			layout.mouseDown.install({
				name: 'mouseDownFixHref'
			,	priority: 10
			,	execute: function (e)
				{
					return standardPlugins.correctURL(layout, e);
				}
			});

			layout.touchStart.install({
				name: 'touchStartFixHref'
			,	priority: 10
			,	execute: function (e)
				{
					return standardPlugins.correctURL(layout, e);
				}
			});

			layout.click.install({
				name: 'standardNavigation'
			,	priority: 20
			,	execute: function (e)
				{
					return standardPlugins.clickNavigation(layout, e);
				}
			});
		}
	};

	return standardPlugins;
});
