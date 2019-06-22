/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ErrorManagement
define(
	'ErrorManagement.LoggedOut.View'
,	[
		'error_management_logged_out.tpl'
		
	,	'ErrorManagement.View'

	,	'Backbone'
	,	'underscore'
	
	,	'Utils'
	]
,	function (
		error_management_logged_out_tpl
		
	,	ErrorManagementView

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class ErrorManagement.LoggedOut.View @extends Backbone.View
	return ErrorManagementView.extend({

		template: error_management_logged_out_tpl
	,	attributes: {
			'id': 'logged-out'
		}
	,	title : _('Logged out').translate()
	
	,	initialize: function()
		{
			this.labels = {
				title: _('You have been logged out').translate()
			,	explanation: _('Your session expired or someone else logged in another device with your account. You must log in again to continue.').translate()
			,	login: _('Log in').translate()
			};
		}
	,	showError: function()
		{
		}

	,	render: function()
		{
			var res = Backbone.View.prototype.render.apply(this, arguments);
			this.$containerModal.find('[data-dismiss="modal"]').remove();
			return res;
		}

		// @method getContext @returns {ErrorManagement.LoggedOut.View.Context}
	,	getContext: function()
		{
			// @class ErrorManagement.LoggedOut.View.Context
			return {
				// @property {Object} labels 
				labels: this.labels
			};
		}

	});
});