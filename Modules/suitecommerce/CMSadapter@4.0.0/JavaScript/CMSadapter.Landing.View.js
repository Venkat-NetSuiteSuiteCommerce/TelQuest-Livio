/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CMSadapter
define(
	'CMSadapter.Landing.View'
,	[
		'cms_landing_page.tpl'

	,	'Backbone'
	]
,	function (
		cms_landing_page_tpl

	,	Backbone
	)
{
	'use strict';

	// @class CMSadapter.Landing.View @extends Backbone.View
	return Backbone.View.extend({

		template: cms_landing_page_tpl

	,	title: ''

	,	page_header: ''

	,	attributes: {
			'id': 'cms-landing-page'
		,	'class': 'cms-landing-page'
		}

	,	initialize: function initialize(options)
		{
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.model = options.model;
		}

	,	getBreadcrumbPages: function getBreadcrumbPages()
		{
			var url = this.model.get('url')
			,	path = url[0] === '/' ? url : '/' + url;

			return [{ href: path, text: this.model.get('page_title') }];
		}

		// @method getContext
		// @returns {CMSadapter.Landing.View.Context}
	,	getContext: function getContext()
		{
			// @class CMSadapter.Landing.View.Context
			return {
				// @property {Boolean} inModal
				inModal: this.inModal
				// @property {String} title
			,	title: this.title
				// @property {String} pageHeader
			,	pageHeader: this.page_header
				// @property {CMSadapter.Page.Model} model
			,	model: this.model
			};
			// @class CMSadapter.Landing.View
		}
	});
});
