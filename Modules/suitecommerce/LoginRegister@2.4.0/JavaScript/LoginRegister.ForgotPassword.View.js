/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module LoginRegister
define('LoginRegister.ForgotPassword.View'
,	[	'login_register_forgot_password.tpl'

	,	'SC.Configuration'
	,	'LoginRegister.Utils'
	,	'Account.ForgotPassword.Model'
	,	'GlobalViews.Message.View'
	,	'Backbone.FormView'
	,	'Header.Simplified.View'
	,	'Footer.Simplified.View'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		forgot_password_tpl

	,	Configuration
	,	LoginRegisterUtils
	,	AccountForgotPasswordModel
	,	GlobalViewsMessageView
	,	BackboneFormView
	,	HeaderSimplifiedView
	,	FooterSimplifiedView

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class LoginRegister.ForgotPassword.View Implements the forgot-password UI @extemd Backbone.View
	return Backbone.View.extend({

		template: forgot_password_tpl

    ,   attributes: {
            'id': 'forgot-password'
        }

	,	title: _('Reset Password').translate()

	,	events: {
			'submit form': 'saveForm'
		,	'click [data-action="sign-in-now"]': 'signInNowClick'
		}

	,	bindings: {
			'[name="email"]': 'email'
		}

	,	initialize: function ()
		{
			// @property {Account.ForgotPassword.Model} model
			this.model = new AccountForgotPasswordModel();
			this.model.on('save', _.bind(this.showSuccess, this));

			BackboneFormView.add(this);
		}

	,	getHeaderView: function()
		{
			//We've got to disable passwordProtectedSite feature if customer registration is disabled.
			if(Configuration.getRegistrationType() !== 'disabled' && SC.ENVIRONMENT.siteSettings.siteloginrequired==='T')
			{
				return HeaderSimplifiedView;
			}
		}

	,	getFooterView: function()
		{
			//We've got to disable passwordProtectedSite feature if customer registration is disabled.
			if(Configuration.getRegistrationType() !== 'disabled' && SC.ENVIRONMENT.siteSettings.siteloginrequired==='T')
			{
				return FooterSimplifiedView;
			}
		}

	,	render: function ()
		{
			Backbone.View.prototype.render.apply(this, arguments);
			if (this.$containerModal && this.options.application.getConfig('checkoutApp.skipLogin'))
			{
				this.$('header, h3').remove();
				this.$('[data-action="sign-in-now"]').attr({'data-toggle': 'show-in-modal', 'href': 'login'});
			}
		}

		// @method showSuccess
	,	showSuccess: function()
		{
			SC.ENVIRONMENT.reset_password_confirmation_email = true;
			Backbone.history.navigate('login-register', { trigger: true });
		}

		// @method signInNowClick
	,	signInNowClick: LoginRegisterUtils.skipLoginCloseModal

		// @method saveForm override original saveForm method so the skip-login modal is not closed, if any.
	,	saveForm: function ()
		{
			// we don't want to close the modal, if any, on saveForm
			if (this.$containerModal && this.options.application.getConfig('checkoutApp.skipLogin'))
			{
				this.inModal = false;
			}
			return Backbone.View.prototype.saveForm.apply(this, arguments).done(function ()
			{
				this.inModal = true;
			});
		}

		//@method getcContext @return LoginRegister.ForgotPassword.View.Context
	,	getContext: function ()
		{
			//@class LoginRegister.ForgotPassword.View.Context
			return {};
		}
	});
});