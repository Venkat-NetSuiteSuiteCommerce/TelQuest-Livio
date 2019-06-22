/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module CMSadapter
@class CMSadapterImpl.CustomContentType the class that has the core integration using the CMS API.
*/
define('CMSadapter.Impl.CustomContentType'
,	[
		'CMSadapter.Component'
	,	'underscore'
	]
,	function (
		CMSadapterComponent
	,	_
	)
{
	'use strict';

	function AdapterCustomContentType(application, CMS)
	{
		this.CMS = CMS;
		this.application = application;

		this.listenForCMS();
	}

	_.extend(AdapterCustomContentType.prototype, {

		listenForCMS: function listenForCMS()
		{
			// CMS listeners - CMS tells us to do something, could fire anytime.
			var self = this;

			self.CMS.on('page:content:set', function (promise, ccts)
			{
				//cct_id, cct_instance_id, cct_selector, cct_settings, render_settings
				CMSadapterComponent.addContents(_.map(ccts, function(cct)
				{
					return {
						id: cct.type
					,	instance_id: cct.instance_id
					,	selector: { 'data-cms-area': cct.context.area }
					,	settings: cct.settings
					,	render_settings: {
							position: cct.context.sequence
						,	classes: cct.classes
						}
					};
				})).then(promise.resolve, promise.reject);
			});

			self.CMS.on('content:types:get', function (promise)
			{
				var content_types = _.map(CMSadapterComponent.getContentIds(), function (cct_id)
					{
						return { type: cct_id };
					});

				promise.resolve(content_types);
			});

			self.CMS.on('content:add', function (promise, cct)
			{
				CMSadapterComponent.addContent(
						cct.type
					,	cct.instance_id
					,	{ 'data-cms-area': cct.context.area }
					,	cct.settings
					,	{
							position: cct.context.sequence
						,	classes: cct.classes
						})
						.then(promise.resolve, promise.reject);
			});

			self.CMS.on('content:update', function (promise, cct)
			{
				CMSadapterComponent.updateContent(
						cct.instance_id
					,	{ 'data-cms-area': cct.context.area }
					,	cct.settings
					,	{
							position: cct.context.sequence
						,	classes: cct.classes
						}
				)
				.then(promise.resolve, promise.reject);
			});

			self.CMS.on('content:remove', function (promise, cct)
			{
				CMSadapterComponent.removeContent(cct.instance_id, true)
				.then(promise.resolve, promise.reject);
			});
		}
	});

	return AdapterCustomContentType;
});
