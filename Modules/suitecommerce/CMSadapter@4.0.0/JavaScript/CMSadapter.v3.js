/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global CMS: false */
// @module CMSadapter
// @class CMSadapter.v3
define('CMSadapter.v3'
,	[	'Backbone'
	,	'CMSadapter'
	,	'CMSadapter.Impl.Core.v3'
	,	'CMSadapter.Impl.Landing.v3'
	,	'CMSadapter.Impl.Categories.v3'
	,	'CMSadapter.Impl.CustomContentType'
	,	'CMSadapter.Plugin.RecollectCMSSelectors'
	,	'CMSadapter.Plugin.PostRender'
	,	'CMSadapter.Component'

	,	'underscore'
	]
,	function (
		Backbone
	,	CMSadapter
	,	CMSadapterImplCore3
	,	CMSadapterImplLanding3
	,	CMSadapterImplCategories3
	,	CMSadapterImplCustomContentType
	,	CMSadapterPluginRecollectCMSSelectors
	,	CMSadapterPluginPostRender
	,	CMSadapterComponent

	,	_
	)
{
	'use strict';

	// @class CMSadapter responsible of starting both the adapter implementation and cms landing pages router.
	// Assumes cms.js is already loaded
	// @extend ApplicationModule
	return _.extend({}, CMSadapter, {
		
		installBackboneViewPlugins: function installBackboneViewPlugins()
		{ 
			Backbone.View.postCompile.install(CMSadapterPluginRecollectCMSSelectors(CMSadapterComponent));
			Backbone.View.postRender.install(CMSadapterPluginPostRender(CMSadapterComponent));
		}

	,	initAdapterImpls: function initAdapterImpls(application, cmsObject, landingRouter)
		{
			this.adapterCore = new CMSadapterImplCore3(application, CMS);
			this.adapterLanding = new CMSadapterImplLanding3(application, CMS, landingRouter);
			this.adapterCategories = new CMSadapterImplCategories3(application, CMS);
			this.adapterCustomContentTypes = new CMSadapterImplCustomContentType(application, cmsObject);
		}

	,	postMountAdapter: function postMountAdapter()
		{
			return CMSadapterComponent;
		}
	});
});
