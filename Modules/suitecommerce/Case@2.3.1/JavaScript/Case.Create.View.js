/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Case.Create.View.js
// -----------------------
// Views for viewing Cases list.
// @module Case
define(
	'Case.Create.View'
,	[
		'case_new.tpl'
	,	'Backbone.FormView'
	,	'SC.Configuration'

	,	'jQuery'
	,	'Backbone'
	,	'underscore'
	,	'Profile.Model'
	,	'Utils'
	]
,	 function (
		case_new_tpl
	,	BackboneFormView
	,	Configuration

	,	jQuery
	,	Backbone
	,	_
	,	ProfileModel
	)
{
	'use strict';

	// @class Case.Create.View @extends Backbone.View
	return Backbone.View.extend({

		template: case_new_tpl

	,	title: _('How can we help you?').translate()

	,	page_header: _('How can we help you?').translate()

	,	events: {
			'submit form': 'saveForm'
		,	'click [data-action="include_email"]': 'includeAnotherEmail'
		,	'keypress [data-action="text"]': 'preventEnter'
		}

	,	bindings: {
			'[name="title"]': 'title'
		,	'[name="category"]': 'category'
		,	'[name="message"]': 'message'
		,	'[name="email"]': 'email'
		,	'[name="include_email"]': 'include_email'
		}

	,	attributes: {
			'class': 'newCase'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.fields = options.fields;
			this.user = ProfileModel.getInstance();
			this.model.on('sync', jQuery.proxy(this, 'showSuccess'));

			this.model.set('isNewCase', true);

			BackboneFormView.add(this);
		}

		// Prevents not desired behaviour when hitting enter
	,	preventEnter: function (event)
		{
			if (event.keyCode === 13)
			{
				event.preventDefault();
			}
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'newcase';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: this.title
			,	href: '/newcase'
			};
		}

	,	showSuccess: function ()
		{
			var case_link_name = _('support case #$(0)').translate(this.model.get('caseNumber'))
			,	new_case_internalid = this.model.get('internalid')
			,	new_case_message = _('Good! your <a href="/cases/$(0)">$(1)</a> was submitted. We will contact you briefly.').translate(new_case_internalid, case_link_name);

			this.newCaseId = new_case_internalid;
			this.newCaseMessage = new_case_message;

			Backbone.history.navigate('cases', {trigger: true});
		}

	,	includeAnotherEmail: function ()
		{	
			var email_input = this.$('[data-case-email]')
			,	status = email_input.prop('disabled');

			email_input.prop('disabled', !status);

			this.$('[data-collapse-content]').collapse(status ? 'show' : 'hide');
		}

		// @method getContext @return Case.Create.View.Context
	,	getContext: function()
		{
			// @class Case.Create.View.Context
			return {
				// @property {String} pageHeader
				pageHeader: this.page_header
				// @property {Array<Object{text:String,id:Number}>} categories
			,	categories: this.fields.get('categories')
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}
	});
});
