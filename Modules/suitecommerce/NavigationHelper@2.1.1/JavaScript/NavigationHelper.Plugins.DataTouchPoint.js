/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module NavigationHelper
define('NavigationHelper.Plugins.DataTouchPoint'
,	[	'Tracker'
	,	'Session'
	,	'underscore'
	,	'Backbone'
	,	'Utils'
	,	'UrlHelper'
	]
,	function (
		Tracker
	,	Session
	,	_
	,	Backbone
	,	Utils
	)
{
	'use strict';
	// @class NavigationHelper.Plugins.DataTouchPoint Contains the plugins that implement the touchpoints link behavior.
	// This is a link like ```<a data-touchpoint="home" data-hashtag="search">Shop</a>``` will always navigate to Shopping search page, no matter where it is defined.
	// @extends ApplicationModule
	var dataTouchPointPlugins = {

		//@method getLocaleHost @returns the host for the language specified
		//@param {String} locale locale to look for
		//@return {String} locale host
		getLocaleHost: function (locale)
		{
			var available_hosts = SC.ENVIRONMENT.availableHosts
			,	target_host;

			if (available_hosts && available_hosts.length)
			{
				for (var i = 0; i < available_hosts.length; i++)
				{
					var host = available_hosts[i]
					,	lang = _(host.languages).findWhere({locale: locale});

					if (lang && lang.host)
					{
						target_host = lang.host;
						break;
					}
				}
			}

			return target_host;
		}

		//@method preserveLanguage Given a URL, if not secure (not my account nor checkout), replace the host based on the current language
		//@param {NavigationContext} context
		//@param {ApplicationSkeleton} application
		//@return {NavigationContext}
	,	preserveLanguage: function (context, application)
		{
			var url = context.url;

			if (Utils.isShoppingDomain())
			{
				var locale_host = dataTouchPointPlugins.getLocaleHost(SC.ENVIRONMENT.currentLanguage.locale);
				if (locale_host)
				{
					url = url.replace(/(http:\/\/)([^/?#]*)([^>]*)/gi, function (all, protocol, host, rest)
					{
						return protocol + locale_host + rest;
					});
				}

				// Add session parameters to target host
				// we do this because when navigating from secure domain (myAccount or Checkout) to Shopping, or when changing the language in shopping,
				// as the language in shopping is determined by the host, we end it up loosing the shopper session. By adding the the ck and cktime parameters
				// NetSuite use the same cookies and the session is not lost
				if (context.target_data.touchpoint !== application.getConfig('currentTouchpoint'))
				{
					url = Utils.addParamsToUrl(url, Utils.getSessionParams(Session.get('touchpoints.login')));
				}

				if (/\?$/.test(url))
				{
					url = url.substring(0, url.length-1);
				}

				context.url = url;
			}
			else
			{
				var current_language = SC.ENVIRONMENT.currentLanguage;
				if (current_language)
				{
					context.target_data.parameters = context.target_data.parameters ?
						context.target_data.parameters + '&lang=' + current_language.locale :
						'lang=' + current_language.locale;
				}
			}

			return context;
		}

		//@method addParametersToTouchpoint Add data- parameters specified in the target element into the final target touchpoint
		//@param {NavigationContext} context
		//@return {NavigationContext}
	,	addParametersToUrl: function (context)
		{
			if (context.target_data.parameters)
			{
				context.url += (~context.url.indexOf('?') ? '&' : '?') + context.target_data.parameters;
			}

			return context;
		}

		//@method addHashtagToTouchPoint Adds any hashtag from the context into the final target touchpoint
		//@param {NavigationContext} context
		//@return {NavigationContext}
	,	addHashtagToTouchPoint: function (context)
		{
			if (SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED' && context.hashtag && context.hashtag !== '#' && context.hashtag !== '#/')
			{
				context.target_touchpoint += (~context.target_touchpoint.indexOf('?') ? '&' : '?') + 'fragment=' + context.clean_hashtag;
			}

			return context;
		}

		//@method generateUrl Based on an already processed context it generate the final URL
		//@param {NavigationContext} context
		//@param {ApplicationSkeleton} application
		//@param {ApplicationSkeleton.Layout} layout
		//@return {NavigationContext}
	,	generateUrl: function (context, application, layout)
		{
			if (context.original_touchpoint === application.getConfig('currentTouchpoint'))
			{
				var prefix = '#';

				if (Backbone.history.options && Backbone.history.options.pushState)
				{
					prefix = context.clean_hashtag.indexOf('/') === 0 ? '' : '/';
				}

				context.url = context.clean_hashtag ? (prefix + context.clean_hashtag) : layout.getUrl(context);
			}
			else
			{
				if (context.clean_hashtag && context.clean_hashtag.indexOf('http') !== -1)
				{
					context.url = _.addParamsToUrl(context.clean_hashtag, _.parseUrlOptions(context.target_touchpoint));
				}
				else
				{
					context.url = _.fixUrl(context.target_touchpoint);

					// We need to make this url absolute in order for this to navigate
					// instead of being triggered as a hash
					if (context.url && !(~context.url.indexOf('http:') || ~context.url.indexOf('https:')))
					{
						context.url = location.protocol + '//' + location.host + context.url;
					}
				}
			}

			return context;
		}

		//@method addCrosDomainParams Add extra cross domain parameters into the final URL
		//@param {NavigationContext} context
		//@return {NavigationContext} context
	,	addCrosDomainParams: function (context)
		{
			// Cross Domain Cookie Tracking:
			// Trackers like Google Analytics require us to send special parameters in the URL
			// to keep tracking the user as one entity even when moving to a different domain
			if (Tracker.getInstance().addCrossDomainParameters)
			{
				context.url = Tracker.getInstance().addCrossDomainParameters(context.url);
			}

			return context;
		}

		//@method getTargetUrl Apply the entire process of generating the final URL and return it
		//@param {NavigationContext} context
		//@param {ApplicationSkeleton} application
		//@param {ApplicationSkeleton.Layout} layout
		//@return {String}
	,	getTargetUrl: function (context, application, layout)
		{
			context = dataTouchPointPlugins.addHashtagToTouchPoint(context);
			context = dataTouchPointPlugins.generateUrl(context, application, layout);
			context = dataTouchPointPlugins.preserveLanguage(context, application);
			context = dataTouchPointPlugins.addParametersToUrl(context);
			context = dataTouchPointPlugins.addCrosDomainParams(context);

			return context.url;
		}

		//@method correctURL Public plugin to fix data-touchpoint URLs
		//@param {ApplicationSkeleton.Layout} layout
		//@param {ApplicationSkeleton} application
		//@param {jQuery.Event} e
		//@return {jQuery.Event} e
	,	correctURL: function (layout, application, e)
		{
			var context = layout.generateNavigationContext(e);

			if (context.target_data.touchpoint)
			{
				layout.isTouchMoveEvent = false;

				if (e.type === 'touchstart')
				{
					e.stopPropagation();
				}

				// 2 = middle click, 3 = right click
				if (e.which === 2 || e.which === 3)
				{
					e.preventDefault();
					e.stopPropagation();
				}

				var new_url = dataTouchPointPlugins.getTargetUrl(context, application, layout);

				layout.setUrl(context.$target, new_url);
			}

			return e;
		}

		//@method setHashtag Detects if you are trying to access a different hashtag within the same touchpoint
		//@param {ApplicationSkeleton.Layout} layout
		//@param {ApplicationSkeleton} application
		//@param {jQuery.Event} e
		//@return {jQuery.Event} e
	,	setHashtag: function (layout, application, e)
		{
			var context = layout.generateNavigationContext(e)
			,	target_is_blank = layout.isTargetBlank(e) || (e.button && e.button !== 0);

			if (context.target_data.touchpoint)
			{
				if (!target_is_blank && context.target_data.hashtag &&
					application.getConfig('currentTouchpoint') &&
					application.getConfig('currentTouchpoint') === context.target_data.touchpoint)
				{

					var new_url = context.target_data.hashtag;
					// Removes the hastag if it's there remove it
					new_url = new_url[0] === '#' ? new_url.substring(1) : new_url;
					// if it does not has a slash add it
					new_url = new_url[0] === '/' ? new_url : '/' + new_url;
					// we just set the hastag as a relative href and the app should take care of itself

					layout.setUrl(context.$target, new_url);
				}

				if (e.type === 'touchend' && !layout.isTouchMoveEvent)
				{
					e.stopPropagation();
					e.preventDefault();

					context.$target.trigger('click');
				}
			}

			return e;
		}

		//@method mountToApp Mount to Application
	,	mountToApp: function (application)
		{
			var layout = application.getLayout();

			//INSTALL DEFAULT NAVIGATION PLUGINS
			layout.mouseDown.install({
				name: 'mouseDownFixHrefDataTouchPoint'
			,	priority: 10
			,	execute: function (e)
				{
					return dataTouchPointPlugins.correctURL(layout, application, e);
				}
			});

			layout.touchStart.install({
				name: 'touchStartFixHrefDataTouchPoint'
			,	priority: 10
			,	execute: function (e)
				{
					return dataTouchPointPlugins.correctURL(layout, application, e);
				}
			});


			layout.mouseUp.install({
				name: 'correctHashtagsDataTouch'
			,	priority: 10
			,	execute: function (e)
				{
					return dataTouchPointPlugins.setHashtag(layout, application, e);
				}
			});

			layout.touchEnd.install({
				name: 'correctHashtagsDataTouch'
			,	priority: 10
			,	execute: function (e)
				{
					return dataTouchPointPlugins.setHashtag(layout, application, e);
				}
			});

		}
	};

	return dataTouchPointPlugins;
});
