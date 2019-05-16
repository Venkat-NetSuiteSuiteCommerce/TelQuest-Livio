/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global nsglobal:true */
// @module ErrorManagement
define(
	'ErrorManagement.ForbiddenError.View'
,	[
		'error_management_forbidden_error.tpl'
		
	,	'ErrorManagement.View'

	,	'Backbone'
	,	'underscore'
	
	,	'Utils'
	]
,	function(
		error_management_forbidden_error_tpl
		
	,	ErrorManagementView

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class ErrorManagement.ForbiddenError.View @extends Backbone.View
	return ErrorManagementView.extend({

		template: error_management_forbidden_error_tpl
	,	attributes: {
			'id': 'forbidden-error'
		,	'class': 'forbidden-error'
		}
	,	title: _('NOT ALLOWED').translate()
	,	page_header: _('NOT ALLOWED').translate()

	,	initialize: function ()
		{
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 403;
			}
		}

		// @method getContext @returns {ErrorManagement.ForbiddenError.View.Context}
	,	getContext: function()
		{
			// @class ErrorManagement.ForbiddenError.View.Context
			return {
				// @property {String} title 
				title: this.title
				// @property {String} pageHeader 
			,	pageHeader: this.page_header
			};
		}

	});

});