/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ErrorManagement
define(
	'ErrorManagementGenericLogOut.View'
,	[
		'error_management_generic_logout.tpl'
	,	'ErrorManagement.View'
	,	'Associate'		
	,	'Backbone'
	,	'underscore'	
	,	'Utils'
	]
,	function (
		error_management_generic_logout	
	,	ErrorManagementView
	,	Associate
	,	Backbone
	,	_
	)
{
	'use strict';

	// @class ErrorManagement.LoggedOut.View @extends Backbone.View
	return Backbone.View.extend({

		template: error_management_generic_logout
	,	attributes: {
			'id': 'logged-out-error'
		}
	,	title : 'Configuration Error'
	, 	events: {
			'click [data-action="logouterror"]': 'logouterror'
		}
	
	,	initialize: function()
		{
			this.labels = {
					explanation : this.options.explanation
				,	login : this.options.login
			};
			this.title = this.options.title;
			_.each(this.labels, function(val, label, labels)
			{
				labels[label] = _(val).translate();
			});
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

	,	showError: function()
		{

		}

	,	logouterror: function()
		{
			Associate.logout({
				makeRequest: true
			});
		}

	});
});