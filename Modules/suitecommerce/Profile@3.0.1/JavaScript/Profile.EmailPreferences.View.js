/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Profile
define(
	'Profile.EmailPreferences.View'
,	[
		'SC.Configuration'
	,	'GlobalViews.Message.View'
	
	,	'profile_emailpreferences.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		Configuration
	,	GlobalViewsMessageView
		
	,	profile_emailpreferences_tpl

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class Profile.EmailPreferences.View @extends Backbone.View
	return Backbone.View.extend({

		template: profile_emailpreferences_tpl
	,	title: _('Email Preferences').translate()
	,	page_header: _('Email Preferences').translate()
	,	attributes: {'class': 'ProfileEmailPreferencesView'}
	,	events: {
			'submit form': 'save'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'keyup form:has([data-action="reset"])': 'toggleReset'
		,	'change [data-type="emailsubscribe-checkbox"]': 'emailSubscribeChange'
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'emailpreferences';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
				text: this.title
			,	href: 'emailpreferences'
			};
		}

	,	showSuccess: function ()
		{
			if (this.$savingForm)
			{
				this.showContent();
				var global_view_message = new GlobalViewsMessageView({
					message: _('Email Preferences successfully saved!').translate()
				,	type: 'success'
				,	closable: true
				});

				this.$('[data-type="alert-placeholder"]').append(global_view_message.render().$el.html());
			}
		}

	,	save: function (e)
		{
			e.preventDefault();

			var	$target = jQuery(e.target)
			,	props = $target.serializeObject()
			,	subscriptions_by_id = {}
			,	campaignsubscriptions = this.model.get('campaignsubscriptions');

			// generate an object with the subscriptions and it's corresponding value
			_.each(props, function (val, key)
			{
				if (~key.indexOf('subscription-'))
				{
					subscriptions_by_id[key.replace('subscription-', '')] = (val === 'T');
				}
			});

			_.each(campaignsubscriptions, function (subscription)
			{
				subscription.subscribed = subscriptions_by_id[subscription.internalid];
			});

			var fixed_props = {
				campaignsubscriptions: campaignsubscriptions
			,	emailsubscribe: props.emailsubscribe === 'T'
			};

			this.saveForm(e, this.model, fixed_props);
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}

		// if the user doesn't want email notifications we disable all the campaign's checkboxes
	,	emailSubscribeChange: function (e)
		{
			var disabled = jQuery(e.target).prop('checked');

			this.$('[data-type="subscription-checkbox"]').prop('disabled', !disabled);
		}

		// @method getContext @return Profile.EmailPreferences.View.Context
	,	getContext: function()
		{
			var campaign_subscriptions = this.model.get('campaignsubscriptions') || [];

			// @class Profile.EmailPreferences.View.Context
			return {
				// @property {String} pageHeader 
				pageHeader: this.page_header
				// @property {Array} subscriptions 
			,	subscriptions: campaign_subscriptions
				// @property {Boolean} isEmailSuscribe 
			,	isEmailSuscribe: this.model.get('emailsubscribe') === 'T'
				// @property {Boolean} campaignSubscriptions
			,	campaignSubscriptions: !!(Configuration.get('siteSettings.campaignsubscriptions') && campaign_subscriptions.length)
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}
	});
});