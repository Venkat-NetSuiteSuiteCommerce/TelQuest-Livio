/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module LoginRegister
define('LoginRegister.Router'
,	[
		'LoginRegister.Login.View'
	,	'LoginRegister.Register.View'
	,	'LoginRegister.CheckoutAsGuest.View'
	,	'LoginRegister.View'
	,	'LoginRegister.ForgotPassword.View'
	,	'LoginRegister.ResetPassword.View'

	,	'Profile.Model'
	,	'Backbone'
	,	'underscore'
	]
,	function (
		LoginView
	,	RegisterView
	,	CheckoutAsGuestView
	,	LoginRegisterView
	,	ForgotPasswordView
	,	ResetPasswordView

	,	ProfileModel

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class LoginRegister.Router Handles views and routers of Login/Register Page. Includes Register Guest, Forgot Password and Reset password.
	// Initializes the different views depending on the requested path.  @extend Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'login-register': 'loginRegister'
		,	'forgot-password': 'forgotPassword'
		,	'reset-password': 'resetPassword'
		,	'register': 'register'
		,	'login': 'login'
		}

	,	initialize: function (application)
		{
			// application is a required parameter for all views
			// we save the parameter to pass it later
			this.application = application;
			this.profileModel = ProfileModel.getInstance();
		}

		// @method loginRegister dispatch the 'login-register' URL for showing the login and register forms.
	,	loginRegister: function ()
		{
			if (this.profileModel.get('isLoggedIn') === 'T' && this.profileModel.get('isGuest') === 'F')
			{
				Backbone.history.navigate('', { trigger: true });
			}
			else
			{
				var view = new LoginRegisterView({
					application: this.application
				,	timedout: _.getParameterByName(window.location.href, 'timeout') === 'T'
				});
				view.showContent();
			}
		}

		// @method register dispatch the 'register form - only' URL
	,	register: function ()
		{
			if (this.profileModel.get('isLoggedIn') === 'T' && this.profileModel.get('isGuest') === 'F')
			{
				Backbone.history.navigate('', { trigger: true });
			}
			else
			{
				var view = new RegisterView({
					application: this.application
				});
				view.title = _('Register').translate();
				view.showContent();
			}
		}

		// @method login dispatch the 'login form - only' URL
	,	login: function ()
		{
			if (this.profileModel.get('isLoggedIn') === 'T' && this.profileModel.get('isGuest') === 'F')
			{
				Backbone.history.navigate('', { trigger: true });
			}
			else
			{
				var view = new LoginView({
					application: this.application
				});
				view.title = _('Log in').translate();
				view.showContent();
			}
		}

		// @method forgotPassword dispatch the 'forgot password' URL
	,	forgotPassword: function ()
		{
			var view = new ForgotPasswordView({
				application: this.application
			});

			view.showContent();
		}


		// @method resetPassword dispatch the 'forgot password' URL
	,	resetPassword: function ()
		{
			var view = new ResetPasswordView({
				application: this.application
			});

			view.showContent();
		}
	});
});