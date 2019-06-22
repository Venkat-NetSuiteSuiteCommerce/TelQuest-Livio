/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module LoginRegister
define('LoginRegister.CheckoutAsGuest.View'
,	[	'login_register_checkout_as_guest.tpl'

	,	'Account.RegisterAsGuest.Model'
	,	'Tracker'
	,	'Profile.Model'
	,	'LiveOrder.Model'
	,	'Backbone.FormView'
	,	'SC.Configuration'

	,	'Backbone'
	,	'underscore'
	]
,	function (
		checkout_as_guest_tpl

	,	AccountRegisterAsGuestModel
	,	Tracker
	,	ProfileModel
	,	LiveOrderModel
	,	BackboneFormView
	,	Configuration

	,	Backbone
	,	_
	)
{
	'use strict';

	// @class LoginRegister.CheckoutAsGuest.View Implements the checkout-as-guest UI bu showing a checkout-as-guest button
	// that when clicked it will first register the current user as guest and then shows the checkout wizard @extend Backbone.View
	return Backbone.View.extend({

		template: checkout_as_guest_tpl

	,	attributes: {
			'id': 'checkout-as-guest'
		,	'class': 'view checkout-as-guest'
		}

	,	events: {
			'submit form': 'saveForm'
		}

	,	bindings: {
			'[name="firstname"]': 'firstname'
		,	'[name="lastname"]': 'lastname'
		,	'[name="email"]': 'email'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.hideRegister = options.hideRegister;
			//@property {Account.RegisterAsGuest.Model} model 
			this.model = new AccountRegisterAsGuestModel();
			// on save we redirect the user out of the registration page
			// as we know there hasn't been an error
			this.model.on('save', _.bind(this.redirect, this));

			BackboneFormView.add(this);
		}

		// @method trackEvent responsible of notifying the Tracker that the guest-checkout operation was made
	,	trackEvent: function (callback)
		{
			Tracker.getInstance().trackEvent({
				category: 'guest-checkout'
			,	action: 'click'
			,	value: 1
			,	callback: callback
			});
		}

		// @method redirect after the checkout-as-guest operation was successfully made this method is in 
		// responsible of navigating to the checkout wizard page. Remember that both login and checkout touchpoints belongs to the same
		// checkout.ssp so we don't need to reload the page. 
	,	redirect: function (context, response)
		{
			var application = this.application
			,	profile_model = ProfileModel.getInstance();

			this.$('[type="submit"]').attr('disabled', true);

			response.user && profile_model.set(response.user);
			response.cart && LiveOrderModel.getInstance().set(response.cart);
			response.address && profile_model.get('addresses').reset(response.address);
			response.creditcard && profile_model.get('creditcards').reset(response.creditcard);

			// Track Guest Checkout Event
			this.trackEvent(function ()
			{
				// First we track the event of login in as guest, and after that we change the current touch-point form register to checkout
				// this is necessary to the navigation helper and some routers to work properly
				application.Configuration.currentTouchpoint = 'checkout';
				Backbone.history.navigate('', { trigger: true });
			});
		}

		//@method getContext @return {LoginRegister.CheckoutAsGuest.View.Context}
	,	getContext: function ()
		{
			var url_options = _.parseUrlOptions(window.location.search);

			//@class LoginRegister.CheckoutAsGuest.View.Context
			return {
				// @property {Boolean} isRedirect
				isRedirect: !!(url_options.is !== 'checkout' && url_options.origin !== 'checkout')
				// @property {Boolean} hideRegister
			,	hideRegister: this.hideRegister
				// @property {Boolean} hideGuestFirstandLastname
			,	showGuestFirstandLastname: Configuration.get('forms.loginAsGuest.showName')
				// @property {Boolean} showEmail
			,	showGuestEmail: Configuration.get('forms.loginAsGuest.showEmail')
				// @property {Boolean} expandGuestUserEnabled
			,	expandGuestUserEnabled: Configuration.get('forms.loginAsGuest.showName') || Configuration.get('forms.loginAsGuest.showEmail')
				// @property {String} buttonCheckoutAsGuestText
			,	buttonCheckoutAsGuestText: Configuration.get('forms.loginAsGuest.buttonCheckoutAsGuestText')
			};
		}
	});
});