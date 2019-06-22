/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Profile
define(
	'Profile.ChangeEmailAddress.View'
,	[
		'GlobalViews.Message.View'
	,	'Backbone.FormView'
	,	'SC.Configuration'

	,	'profile_change_email.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		GlobalViewsMessageView
	,	BackboneFormView
	,	Configuration

	,	profile_change_email_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Profile.ChangeEmailAddress.View @extends Backbone.View
	return Backbone.View.extend({

		template: profile_change_email_tpl

	,	page_header: _('Change Email').translate()

	,	title: _('Change Email').translate()

	,	events: {
			'submit form': 'saveFormCustom'
		}

	,	bindings: {
			'[name="current_password"]': 'current_password'
		,	'[name="new_email"]': 'new_email'
		,	'[name="confirm_email"]': 'confirm_email'
		}

	,	initialize: function()
		{
			Backbone.View.prototype.initialize.apply(this, arguments);
			BackboneFormView.add(this);
		}

	,	saveFormCustom: function ()
		{
			this.new_email = this.$('[name="new_email"]').val();
			BackboneFormView.saveForm.apply(this, arguments);
		}

	,	showSuccess: function (placeholder)
		{
			var global_view_message = new GlobalViewsMessageView({
					message: _('A confirmation email has been sent to <strong>').translate() + this.new_email + '</strong>'
				,	type: 'success'
				,	closable: true
			});

			placeholder.html(global_view_message.render().$el.html());
		}
	});
});