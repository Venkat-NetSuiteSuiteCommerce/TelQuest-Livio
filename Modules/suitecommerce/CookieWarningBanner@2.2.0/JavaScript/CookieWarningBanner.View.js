/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CookieWarningBanner
define('CookieWarningBanner.View'
,	[
		'SC.Configuration'
	,	'cookie_warning_banner_view.tpl'

	,	'jQuery'
	,	'Backbone'
	,	'jquery.cookie'
	]
,	function (
		Configuration
	,	cookie_warning_banner_view_tpl

	,	jQuery
	,	Backbone
	)
{
	'use strict';

	//@class CookieWarningBanner.View @extend Backbone.View
	return Backbone.View.extend({

		template: cookie_warning_banner_view_tpl

	,	events: {
			'click [data-action="close-message"]': 'closeMessage'
		}

		//@method initialize Override default method to initialize the jQuery cookie JSON property
		//@return {Void}
	,	initialize: function initialize ()
		{
			Backbone.View.prototype.initialize.apply(this, arguments);
			jQuery.cookie.json = true;
		}

		//@method closeMessage Event handle for the close action
	,	closeMessage: function closeMessage ()
		{
			jQuery.cookie('isCookieWarningClosed', true);
		}

		//@method showBanner Indicate if this current message should be shown or not
		//@return {Boolean}
	,	showBanner: function showBanner ()
		{
			return Configuration.get('siteSettings.showcookieconsentbanner') === 'T' && !(Configuration.get('cookieWarningBanner.saveInCookie', false) && jQuery.cookie('isCookieWarningClosed'));
		}

		//@method getContext
		//@return {CookieWarningBanner.View.Context}
	,	getContext: function getContext()
		{
			//@class CookieWarningBanner.View.Context
			return {
				//@property {Boolean} showBanner
				showBanner: this.showBanner()
				//@property {String} cookieMessage
			,	cookieMessage: Configuration.get('cookieWarningBanner.message', '')
				//@property {Boolean} showLink
			,	showLink: !!Configuration.get('siteSettings.cookiepolicy', false)
				//@property {String} linkHref
			,	linkHref: Configuration.get('siteSettings.cookiepolicy', false)
				//@property {String} linkContent
			,	linkContent: Configuration.get('cookieWarningBanner.anchorText', '')
				//@property {Boolean} showLink
			,	closable: Configuration.get('cookieWarningBanner.closable', true)
			};
			//@class CookieWarningBanner.View
		}
	});
});