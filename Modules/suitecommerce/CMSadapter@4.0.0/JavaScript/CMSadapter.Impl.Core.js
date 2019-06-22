/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module CMSadapter
@class CMSadapter.Impl.Core the class that has the core integration using the CMS API.
*/

define('CMSadapter.Impl.Core'
,	[
		'underscore'
	,	'Backbone'
	,	'jQuery'
	]
,	function (
		_
	,	Backbone
	,	jQuery
	)
{
	'use strict';

	var AdapterCore = function (application, CMS)
	{
		this.CMS = CMS;
		this.application = application;

		this.init();
		this.listenForCMS();
	};

	AdapterCore.prototype.init = jQuery.noop; 

	AdapterCore.prototype.listenForCMS = jQuery.noop;

	AdapterCore.prototype.getSetupOptions = jQuery.noop;

	AdapterCore.prototype.getCmsContext = function getCmsContext ()
	{
		var url = Backbone.history.fragment.split('?')[0]
		,	path = url[0] === '/' ? url : '/' + url;

		var context = {
			path: path
		,	site_id: this.application.getConfig('siteSettings.siteid')
		,	page_type: this.application.getLayout().currentView ? this.application.getLayout().currentView.el.id : ''
		};

		return context;
	};

	return AdapterCore;
});
