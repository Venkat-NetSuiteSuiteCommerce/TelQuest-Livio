/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*

@module CMSadapter

@class CMSadapter.Impl.Landing.v2
*/

define('CMSadapter.Impl.Landing.v2'
,	[
		'CMSadapter.Impl.Landing'
	]
,	function (
		CMSadapterImplLanding
	)
{
	'use strict';

	var CMSadapterImplLanding2 = function (application, CMS, pageRouter)
	{
		CMSadapterImplLanding.call(this, application, CMS, pageRouter);
	};

	CMSadapterImplLanding2.prototype = Object.create(CMSadapterImplLanding.prototype);

	CMSadapterImplLanding2.prototype.listenForCMS = function listenForCMS()
	{
		// CMS listeners - CMS tells us to do something, could fire anytime.
		var self = this;

		self.CMS.on('adapter:landing:pages:reload', function (data, callback)
		{
			callback(self.realoadLandingPages(data));
		});
		self.CMS.on('adapter:landing:pages:add', function (data, callback)
		{
			callback(self.addLandingPages(data));
		});
		self.CMS.on('adapter:landing:page:navigate', function (data, callback)
		{
			// triggered when user selects a landing page in the 'manage pages mode' in cms administrator
			callback(self.navigateLandingPage(data));
		});
		self.CMS.on('adapter:landing:page:update', function (data, callback)
		{
			// triggered when user clicks the 'edit' button of a landing page in the 'manage pages mode' in cms administrator
			callback(self.updateLandingPage(data));
		});
	};

	return CMSadapterImplLanding2;
});
