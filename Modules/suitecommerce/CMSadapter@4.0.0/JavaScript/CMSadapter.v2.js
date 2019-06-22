/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CMSadapter
// @class CMSadapter.v2
define('CMSadapter.v2'
,	[	'CMSadapter'
	,	'CMSadapter.Impl.Core.v2'
	,	'CMSadapter.Impl.Landing.v2'
	,	'CMSadapter.Impl.Categories.v2'
	
	,	'underscore'
	]
,	function (
		CMSadapter
	,	CMSadapterImplCore2
	,	CMSadapterImplLanding2
	,	CMSadapterImplCategories2
	
	,	_
	)
{
	'use strict';


	// @class CMSadapter2 responsible of starting both the adapter implementation and cms landing pages router.
	// Assumes cms.js is already loaded
	// @extend ApplicationModule
	return _.extend({}, CMSadapter, 
	{
		initAdapterImpls: function initAdapterImpls(application, cmsObject, landingRouter)
		{
			this.adapterCore = new CMSadapterImplCore2(application, cmsObject);
			this.adapterLanding = new CMSadapterImplLanding2(application, cmsObject, landingRouter);
			this.adapterCategories = new CMSadapterImplCategories2(application, cmsObject);
		}
	});
});
