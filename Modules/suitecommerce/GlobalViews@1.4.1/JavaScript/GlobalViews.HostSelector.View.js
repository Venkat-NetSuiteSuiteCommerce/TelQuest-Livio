/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.HostSelector.View'
,	[
		'SC.Configuration'

	,	'global_views_host_selector.tpl'

	,	'Backbone'
	,	'Utils'
	,	'underscore'
	,	'jQuery'
	]
,	function(
		Configuration

	,	global_views_host_selector_tpl

	,	Backbone
	,	Utils
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class GlobalViews.HostSelector.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_host_selector_tpl

	,	events: {
			'change select[data-toggle="host-selector"]' : 'selectHost'
		,	'click select[data-toggle="host-selector"]' : 'selectHostClick'
		}

		// @method selectHostClick @param {HTMLEvent} e
	,	selectHostClick: function (e)
		{
			e.stopPropagation();
		}

		// @method selectHost @param {HTMLEvent} e
	,	selectHost: function(e)
		{
			if (Configuration.currentTouchpoint === 'home')
			{
				this.setHost(e);
			}
			else
			{
				this.setLang(e);
			}
		}

		// @method setHref @param {String} url
	,	setHref: function (url)
		{
			window.location.href = location.protocol + '//' + url;
		}

		// @method setSearch @param {String} search
	,	setSearch: function (search)
		{
			window.location.search = search;
		}

		// @method getCurrentPath @returns {String}
	,	getCurrentPath: function ()
		{
			return location.pathname;
		}

		// @method setHost @param {HTMLEvent} e
	,	setHost: function (e)
		{
			var host = jQuery(e.target).val()
			,	url;

			if (Backbone.history._hasPushState)
			{
				// Seo Engine is on, send him to the root
				url = host;
			}
			else
			{
				// send it to the current path, it's probably a test site
				url = host + this.getCurrentPath();
			}

			// add session parameters to target host
			url = Utils.addParamsToUrl(url, Utils.getSessionParams(SC.ENVIRONMENT.siteSettings.touchpoints));

			// redirects to url
			this.setHref(url);
		}

		// @method setLang @param {HTMLEvent} e
	,	setLang: function (e)
		{
			var selected_host = jQuery(e.target).val()
			,	available_hosts = SC.ENVIRONMENT.availableHosts
			,	selected_language;

			for(var i = 0; i < available_hosts.length; i++)
			{
				var host = available_hosts[i]
				,	lang = _(host.languages).findWhere({host: selected_host});

				if (lang && lang.locale)
				{
					selected_language = lang;
					break;
				}
			}

			// use the param **"lang"** to pass this to the ssp environment
			if (selected_language && selected_language.locale)
			{
				var current_search = Utils.parseUrlOptions(window.location.search);

				current_search.lang = selected_language.locale;

				var search =  _.reduce(current_search, function (memo, val, name)
				{
					return val ? memo + name + '=' + val + '&' : memo;
				}, '?');

				this.setSearch(search);

				return search;
			}
		}

		// @method getContext @return GlobalViews.HostSelector.View.Context
	,	getContext: function()
		{
			var is_home_touchpoint = Configuration.currentTouchpoint === 'home';

			var use_parameter = !is_home_touchpoint
			,	current_host = is_home_touchpoint ? SC.ENVIRONMENT.currentHostString : SC.ENVIRONMENT.currentLanguage.locale
			,	available_hosts = _.map(SC.ENVIRONMENT.availableHosts, function(host)
			{
				// @class GlobalViews.HostSelector.View.Context.Host
				return {
					// @property {Boolean} hasLanguages
					hasLanguages: host.languages && host.languages.length
					// @property {String} title
				,	title: host.title
					// @property {Array<GlobalViews.HostSelector.View.Context.Host.Language>} languages
				,	languages: _.map(host.languages, function(language)
					{
						//@class GlobalViews.HostSelector.View.Context.Host.Language
						return {
							// @property {String} host
							host: language.host
							// @property {String} displayName
						,	displayName: language.title || language.name
							// @property {Boolean} isSelected
						,	isSelected: !!((use_parameter && language.locale === current_host) ||  language.host === current_host)
						};
					})
				};
			});

			// @class GlobalViews.HostSelector.View.Context
			return {
				// @property {Boolean} showHosts
				showHosts: !!(available_hosts && available_hosts.length > 1)
				// @property {Array<GlobalViews.HostSelector.View.Context.Host>} availableHosts
			,	availableHosts: available_hosts
				// @property {String} currentHost
			,	currentHost: current_host
				// @param {Boolean} useParameter
			,	useParameter: use_parameter
			};
		}
	});
});