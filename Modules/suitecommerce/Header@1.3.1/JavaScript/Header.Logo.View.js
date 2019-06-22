/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Header
define(
	'Header.Logo.View'
,	[
		'SC.Configuration'
	,	'header_logo.tpl'
	,	'Backbone'
	,	'Utils'
	]
,	function(
		Configuration
	,	header_logo_tpl
	,	Backbone
	,	Utils
	)
{
	'use strict';

	// @class Header.Logo.View @extends Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: header_logo_tpl

		// @method initialize
		// @param {Header.LogoView.Initialize.Options} options
		// @return {Void}

		// @method getContext @return {Header.Logo.View.Context}
	,	getContext: function()
		{
			// @class Header.Logo.View.Context
			return {
				// @property {String} logoUrl
				logoUrl: Utils.getAbsoluteUrlOfNonManagedResources(Configuration.get('header.logoUrl'))
				// @property {String} headerLinkHref
			,	headerLinkHref: this.options.headerLinkHref || '/'
				// @property {String} headerLinkTouchPoint
			,	headerLinkTouchPoint: this.options.headerLinkTouchPoint || 'home'
				// @property {String} headerLinkHashtag
			,	headerLinkHashtag: this.options.headerLinkHashtag || '#'
				// @property {String} headerLinkTitle
			,	headerLinkTitle: this.options.headerLinkTitle || SC.ENVIRONMENT.siteSettings.displayname
			};
		}
	});
});
// @class Header.LogoView.Initialize.Options
// @property {String} headerLinkHref This is the URL the header uses
// @property {String} headerLinkTouchPoint
// @property {String} headerLinkHashtag
// @property {String} headerLinkTitle
