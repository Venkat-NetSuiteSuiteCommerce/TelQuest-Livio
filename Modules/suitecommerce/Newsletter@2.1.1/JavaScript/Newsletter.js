/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Newsletter
define(
	'Newsletter'
,   [
		'Footer.View'
	,	'Newsletter.Model'
	,	'Newsletter.View'
	]
,   function (
		FooterView
	,	NewsletterModel
	,	NewsletterView
	)
{
	'use strict';

	//@class Newsletter @extend ApplicationModule
	return  {

		//@method mountToApp
		//@param {ApplicationSkeleton} application
		//@return {Void}
		mountToApp: function mountToApp (application)
		{
			//Set the Newsletter subscription form on the footer
			FooterView.addChildViews && FooterView.addChildViews({
				'FooterContent': function wrapperFunction ()
				{
					return function ()
					{
						return new NewsletterView(
						{
							'model': new NewsletterModel()
						,	'application': application
						});
					};
				}
			});
		}
	};
});