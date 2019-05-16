/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Overview.Banner.View.js
// -----------------------

define('Overview.Banner.View'
,	[
		'SC.Configuration'

	,	'overview_banner.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	,	'Utils'
	]
,	function(
		Configuration

	,	overview_banner_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	// home page view
	return Backbone.View.extend({

		template: overview_banner_tpl

	,	initialize: function ()
		{
			BackboneCompositeView.add(this);
		}

		//@method getContext @returns {Overview.Banner.View.Context}
	,	getContext: function()
		{
			var bannersConfig = Configuration.get('overview.homeBanners')
			,	banners = _.isArray(bannersConfig) ? bannersConfig : [bannersConfig]
			,	random_banner = banners[Math.floor(Math.random() * banners.length)];

			//@class Overview.Banner.View.Context
			return {
				//@property {Boolean} hasBanner
				hasBanner: !!random_banner
				//@property {Boolean} hasLink
			,	hasLink:  !!(random_banner && random_banner.linkUrl)
				//@property {String} linkUrl
			,	linkUrl: random_banner && random_banner.linkUrl
				//@property {String} linkTarget
			,	linkTarget: random_banner && random_banner.linkTarget
				//@property {String} imageSource
			,	imageSource: random_banner && random_banner.imageSource
			};
		}
	});
});
