/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Newsletter
define('Newsletter.View'
,	[
		'Newsletter.Model'
	,	'SC.Configuration'
	,	'Backbone.FormView'
	,	'Backbone.CompositeView'
	,	'GlobalViews.Message.View'

	,	'newsletter.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		NewsletterModel
	,	Configuration
	,	BackboneFormView
	,	BackboneCompositeView
	,	GlobalViewsMessageView

	,	newsletter_tpl

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class Newsletter.View @extend Backbone.View
	return Backbone.View.extend({

		// @property {Function} template
		template: newsletter_tpl

		// @property {Object} events
	,	events: {
			'submit form': 'newsletterSubscribe'
		}

		// @property {Object} bindings Binds email input field with model namesake property
	,	bindings: {
			'[name="email"]': 'email'
		}

		// @property {Object} feedback Keeps the text and kind of message we need to show as feedback
	,	feedback: {
			'OK' : {
				'type': 'success'
			,	'message': _('Thank you! Welcome to our newsletter').translate()
			}
		,	'ERR_USER_STATUS_ALREADY_SUBSCRIBED' : {
				'type': 'warning'
			,	'message': _('Sorry, the specified email is already subscribed.').translate()
			}
		,	'ERR_USER_STATUS_DISABLED' : {
				'type': 'error'
			,	'message': _('Sorry, the specified email cannot be subscribed.').translate()
			}
		,	'ERROR': {
				'type': 'error'
			,	'message': _('Sorry, subscription cannot be done. Try again later.').translate()
			}
		}

		// @method initialize Defines this view as composite, initializes the 'state' object, and makes the form view available.
		// @param {Newsletter.View.initialize.Options} options
		// @return {Void}
	,	initialize: function initialize (options)
		{
			// @property {Newsletter.View.State} state
			this.state = {
				'code' : ''
			,	'message' : ''
			,	'messageType' : ''
			};

			this.application = options.application;
			BackboneCompositeView.add(this);
			BackboneFormView.add(this);
		}

		// @method newsletterSubscribe Handles the submit of the form and its result
		// @param {jQuery.Event} e jQuery event
		// @return {Void}
	,	newsletterSubscribe: function newsletterSubscribe (e)
		{
			e.preventDefault();

			var self = this
			,	promise = this.saveForm(e);

			if (promise)
			{
				promise.fail (function (jqXhr)
				{
					jqXhr.preventDefault = true;

					var errorCode = jqXhr && jqXhr.responseJSON && jqXhr.responseJSON.errorCode && self.feedback[jqXhr.responseJSON.errorCode] ? jqXhr.responseJSON.errorCode : 'ERROR';

					self.state.code = errorCode;
					self.state.message = self.feedback[errorCode].message;
					self.state.messageType = self.feedback[errorCode].type;

				}).done (function ()
				{
					self.state.code = self.model.get('code');
					self.state.message = self.feedback[self.model.get('code')].message;
					self.state.messageType = self.feedback[self.model.get('code')].type;

					self.model.set('email', '');

				}).always(_.bind(self.render, self));
			}
		}

		// @propery {Object} childViews
	,	childViews: {
			'GlobalMessageFeedback': function ()
			{
				return new GlobalViewsMessageView({
					message: this.state.message
				,	type: this.state.messageType
				,	closable: true
				});
			}
		}

		// @method getContext
		// @return {Newsletter.View.Context}
	,	getContext: function getContext ()
		{
			// @class Newsletter.View.Context
			return {
				// @property {Boolean} isFeedback
				isFeedback: !!this.state.code
				// @property {Newsletter.Model} model
			,	model: this.model
			};
		}
	});
});

//@class Newsletter.View.initialize.Options
//@property {Newsletter.Model} model
//@property {ApplicationSkeleton} application

//@class Newsletter.View.State Is meant to keep the state of the view according to what is the AJAX response
//@property {String} code The answer string code
//@property {String} message The text we need to show as feedback
//@property {String} messageType The kind of message we need to display as feedback (error, warning or success)