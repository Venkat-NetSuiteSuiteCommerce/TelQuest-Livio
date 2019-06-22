/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global nsglobal:true */
// @module ErrorManagement
define(
	'ErrorManagement.InternalError.View'
,	[
		'error_management_internal_error.tpl'
		
	,	'ErrorManagement.View'

	,	'Backbone'
	,	'underscore'
	
	,	'Utils'
	]
,	function(
		error_management_internal_error_tpl
		
	,	ErrorManagementView

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class ErrorManagement.InternalError.View @extends Backbone.View
	return ErrorManagementView.extend({

		template: error_management_internal_error_tpl
	,	attributes: {
			'id': 'internal-error'
		,	'class': 'internal-error'
		}
	,	title: _('Internal Error').translate()	
	,	page_header: _('Internal Error').translate()

	,	initialize: function (options)
		{
			if (options.title)
			{
				this.title = options.title;
			}

			if (options.page_header || options.pageHeader)
			{
				this.page_header = options.page_header || options.pageHeader;
			}
			
			if (options.message)
			{
				this.message = options.message;
			}

			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 500;
			}
		}

		// @method getContext @returns {ErrorManagement.InternalError.View.Context}
	,	getContext: function()
		{
			// @class ErrorManagement.InternalError.View.Context
			return {
				// @property {String} pageHeader 
				pageHeader: this.page_header
				// @property {String} message
			,	message: this.message || _('Sorry, we could not load the content you requested.').translate()				
			};
		}

	});

});