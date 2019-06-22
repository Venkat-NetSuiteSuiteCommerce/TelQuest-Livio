/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global nsglobal:true */
// @module ErrorManagement
define(
	'ErrorManagement.PageNotFound.View'
,	[
		'error_management_page_not_found.tpl'
		
	,	'ErrorManagement.View'

	,	'Backbone'
	,	'underscore'
	
	,	'Utils'
	]
,	function(
		error_management_page_not_found_tpl
		
	,	ErrorManagementView

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class ErrorManagement.PageNotFound.View @extends Backbone.View
	return ErrorManagementView.extend({

		template: error_management_page_not_found_tpl
	,	attributes: {
			'id': 'page-not-found'
		,	'class': 'page-not-found'
		}
	,	title: _('Page not found').translate()
	,	page_header: _('Page not found').translate()
		
	,	initialize: function ()
		{
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 404;
			}
		}

		// @method getContext @returns {ErrorManagement.PageNotFound.View.Context}
	,	getContext: function()
		{
			// @class ErrorManagement.PageNotFound.View.Context
			return {
				// @property {String} title 
				title: this.title
				// @property {String} pageHeader 
			,	pageHeader: this.page_header
			};
		}

	});
});