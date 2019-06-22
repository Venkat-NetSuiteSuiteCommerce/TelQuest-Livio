/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module CMSadapter

@class CMSadapter.Impl.Landing.v3
*/

define('CMSadapter.Impl.Landing.v3'
,	[
		'CMSadapter.Impl.Landing'
	]
,	function (
		CMSadapterImplLanding
	)
{
	'use strict';

	var CMSadapterImplLanding3 = function (application, CMS, pageRouter)
	{
		CMSadapterImplLanding.call(this, application, CMS, pageRouter);
	};

	CMSadapterImplLanding3.prototype = Object.create(CMSadapterImplLanding.prototype);

	CMSadapterImplLanding3.prototype.listenForCMS = function listenForCMS()
	{
		// CMS listeners - CMS tells us to do something, could fire anytime.
		var self = this;

		self.CMS.on('landing-pages:reload', function (promise, data)
		{
			self.realoadLandingPages(data);
			promise.resolve();
		});

		self.CMS.on('landing-pages:add', function (promise, data)
		{
			self.addLandingPages(data);
			promise.resolve();
		});

		self.CMS.on('landing-pages:navigate', function (promise, data)
		{
			// triggered when user selects a landing page in the 'manage pages mode' in cms administrator
			self.navigateLandingPage(data);
			promise.resolve();
		});

		self.CMS.on('landing-pages:update', function (promise, data)
		{
			// triggered when user clicks the 'edit' button of a landing page in the 'manage pages mode' in cms administrator
			self.updateLandingPage(data);
			promise.resolve();
		});

		self.CMS.on('landing-pages:remove', function (promise)
		{
			promise.resolve();
		});
	};

	return CMSadapterImplLanding3;
});
