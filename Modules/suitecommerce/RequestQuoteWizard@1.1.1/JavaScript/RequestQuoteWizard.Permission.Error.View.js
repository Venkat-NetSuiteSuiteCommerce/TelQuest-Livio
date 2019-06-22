/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module RequestQuoteWizard
define('RequestQuoteWizard.Permission.Error.View'
,	[
		'SC.Configuration'

	,	'requestquote_wizard_permission_error.tpl'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		Configuration

	,	requestquote_wizard_permission_error_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class RequestQuoteWizard.Permission.Error.View @extend Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: requestquote_wizard_permission_error_tpl

		// @property {String} page_header
	,	page_header: _('Request a Quote').translate()

		// @property {String} title
	,	title: _('Request a Quote').translate()

		//@property {String} bodyClass This property indicate the class used on the body to remove the My Account side menu
	,	bodyClass: 'force-hide-side-nav'

		//@method getContext
		//@return {RequestQuoteWizard.Permission.Error.View.Context}
	,	getContext: function ()
		{
			//@class RequestQuoteWizard.Permission.Error.View.Context
			return {
				// @property {String} pageHeader
				pageHeader: this.page_header
				// @property {Boolean} showSalesRepInformation Phone
			,	salesrepPhone: Configuration.get('quote.defaultPhone')
				// @property {Boolean} showSalesRepInformation Email
			,	salesrepEmail: Configuration.get('quote.defaultEmail')
			};
			//@class RequestQuoteWizard.Permission.Error.View
		}

	});
});