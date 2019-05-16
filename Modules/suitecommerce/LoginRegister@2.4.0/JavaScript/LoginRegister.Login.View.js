/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module LoginRegister
define('LoginRegister.Login.View'
,	[	'login_register_login.tpl'

	,	'SC.Configuration'
	,	'Tracker'
	,	'Session'
	,	'Account.Login.Model'
	,	'LoginRegister.Utils'
	,	'Profile.Model'
	,	'LiveOrder.Model'

	,	'Backbone'
	,	'Backbone.FormView'
	,	'Backbone.CompositeView'
	,	'GlobalViews.Message.View'
	,	'underscore'
	,	'Utils'
	]
,	function (
		login_tpl

	,	Configuration
	,	Tracker
	,	Session
	,	AccountLoginModel
	,	LoginRegisterUtils
	,	ProfileModel
	,	LiveOrderModel

	,	Backbone
	,	BackboneFormView
	,	BackboneCompositeView
	,	GlobalViewsMessageView
	,	_
	)
{
	'use strict';

	// @class LoginRegister.Login.View Implements the login experience UI @extend Backbone.View
	return Backbone.View.extend({

		template: login_tpl

    ,   attributes: {
            'id': 'login'
        }

	,	events: {
			'submit form': 'saveForm'
		,	'click [data-action="register-now"]': 'skipLoginCloseModal'
		,	'mousedown [data-action="forgot-password"]': 'forgotPasswordHandler'
		}

	,	bindings: {
			'[name="email"]': 'email'
		,	'[name="password"]': 'password'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.model = new AccountLoginModel();
			this.timedout = options.timedout;
			// on save we redirect the user out of the login page as we know there hasn't been an error
			this.model.on('save', _.bind(this.redirect, this));

			BackboneCompositeView.add(this);
			BackboneFormView.add(this);
		}

		// @method forgotPasswordHandler handles the 'forgot-password' redirection
	,	forgotPasswordHandler: function ()
		{
			LoginRegisterUtils.skipLoginCloseModal();
			Backbone.history.navigate('#forgot-password', {trigger: true});
		}

	,	childViews: {
			'GlobalMessageSessionTimeout': function ()
			{
				return new GlobalViewsMessageView({
					message: _.translate('Your session has timed out. Please log in again.')
				,	type: 'error'
				,	closable: false
				});
			}
		}

		// @method skipLoginCloseModal
	,	skipLoginCloseModal: LoginRegisterUtils.skipLoginCloseModal

	,	render: function ()
		{
			Backbone.View.prototype.render.apply(this, arguments);
			if (this.$containerModal && this.application.getConfig('checkoutApp.skipLogin'))
			{
				this.$('[data-action="forgot-password"]').attr('data-toggle', 'show-in-modal');
			}
		}

		// @method trackEvent tracks the 'sing-in' event using the global Tracker instance @param {Function} callback
	,	trackEvent: function (callback)
		{
			Tracker.getInstance().trackEvent({
				category: 'sign-in'
			,	action: 'click'
			,	value: 1
			,	callback: callback
			});
		}

		// @method redirect Redirects the user after successful login taking into account redirect parameters (origin and origin_hash).
		// @param {Object} response The HTTP response data object, response of the login service.
	,	redirect: function (context, response)
		{
			var url_options = _.parseUrlOptions(window.location.search)
			,	touchpoints = response.touchpoints
			,	isPasswordReset = url_options.passwdret
			,	self = this;

			// Track Login Event
			this.trackEvent(function ()
			{
				if (!isPasswordReset && (url_options.is === 'checkout' || url_options.origin === 'checkout'))
				{
					self.refreshApplication(response);
				}
				else
				{
					// if we know from which touchpoint the user is coming from
					if (url_options.origin && touchpoints[url_options.origin])
					{
						// we save the URL to that touchpoint
						var url = touchpoints[url_options.origin];
						// if there is an specific hash
						if (url_options.origin_hash)
						{
							// we add it to the URL as a fragment
							url = _.addParamsToUrl(url, {fragment: url_options.origin_hash});
						}

						window.location.href = url;
					}
					else
					{
						//We've got to disable passwordProtectedSite feature if customer registration is disabled.
						if(Configuration.getRegistrationType() !== 'disabled' && SC.ENVIRONMENT.siteSettings.siteloginrequired==='T')
						{
							window.location.href = touchpoints.home;
						}
						else
						{
							// otherwise we need to take it to the customer center
							window.location.href = touchpoints.customercenter;
						}
					}
				}
			});
		}

		// @method refreshApplication login and checkout are unified in the same ssp so after user logs in we want to refresh the UI without having to refresh the entire
		// Remember that the new user can be associated to other language/currency so we must refresh all the application.
		// The easy and safer way would be refreshing the page.
		// @param {LoginRegister.LoginResponseData} the JSON object containing the login service response data
	,	refreshApplication: function (response)
		{
			var current_language = Session.get('language.locale')
			,	application = this.application;

			// @class LoginRegister.LoginResponseData
			// @property language {locale:String} language
			if (response.language && response.language.locale && current_language !== response.language.locale)
			{
				window.location.href = response.touchpoints.checkout;
			}
			else
			{
				var profile_model = ProfileModel.getInstance();

				// @property {String} user serialized JSON user information
				response.user && profile_model.set(response.user);
				// @property {String} cart serialized JSON cart information
				response.cart && LiveOrderModel.getInstance().set(response.cart);
				// @property {String} address serialized JSON addresses information
				response.address && profile_model.get('addresses').reset(response.address);
				// @property {String} credit-card serialized JSON creditcards information
				response.creditcard && profile_model.get('creditcards').reset(response.creditcard);
				// @property {core:String} currency
				response.currency && response.currency.code && Session.set('currency', response.currency);
				// @property {Object} touchpoints
				response.touchpoints && (application.Configuration.siteSettings.touchpoints = response.touchpoints);

				application.Configuration.currentTouchpoint = 'checkout';
				Backbone.history.navigate('', { trigger: true });
			}
			// @class LoginRegister.Login.View
		}

		//@method getContext @return {LoginRegister.Login.View.Context}
	,	getContext: function ()
		{
			var url_options = _.parseUrlOptions(window.location.search);

			//@class LoginRegister.Login.View.Context
			return {
				// @property {Boolean} isRedirect
				isRedirect: !!(url_options.is !== 'checkout' && url_options.origin !== 'checkout')
				// @property {Boolean} hasAutoFocus
			,	hasAutoFocus: url_options.is !== 'register' && _.isDesktopDevice()
				// @property {Boolean} isUserSessionTimedOut
			,	isUserSessionTimedOut: url_options.timedout === 'T' || this.timedout
				//@property {Boolean} isSkipLogin
			,	isSkipLogin: !!(this.$containerModal && this.application.getConfig('checkoutApp.skipLogin'))
			};
		}
		// @class LoginRegister.Login.View
	});
});
