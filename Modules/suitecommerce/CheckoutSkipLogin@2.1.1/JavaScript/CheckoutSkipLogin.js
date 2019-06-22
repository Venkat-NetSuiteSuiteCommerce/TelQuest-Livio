/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module CheckoutSkipLogin
Checkout Skip Login mode. The Checkout Skip Login is a feature that is disabled by default and can be enabled by setting
property checkoutApp.skipLogin to true in backend.configuration.js file.

Basically for implementing skip login what we are doing is overriding the ```save()``` method of the following models:
```LiveOrderModel```, ```AddressModel```, ```CreditCardModel``` and	```ProfileModel```.

The objective is to first call register-guest service and only then call the real save() so the operation is made
with a guest session.
*/

define(
	'CheckoutSkipLogin'
,	[	'Account.RegisterAsGuest.Model'
	,	'LiveOrder.Model'
	,	'Address.Model'
	,	'CreditCard.Model'
	,	'Profile.Model'

	,	'jQuery'
	,	'underscore'
	,	'Utils'
	]
,	function (
		AccountRegisterAsGuestModel
	,	LiveOrderModel
	,	AddressModel
	,	CreditCardModel
	,	ProfileModel

	,	jQuery
	,	_
	,	Utils
	)
{
	'use strict';

	var promise_guest = null;

	return {

		mountToApp: function (application)
		{
			// do nothing if the mode is disabled
			if (!application.getConfig('checkout.skipLogin'))
			{
				return;
			}

			//this function is called only if skip login mode is enabled
			var registerUserAsGuest = function registerUserAsGuest ()
			{
				var promise = jQuery.Deferred()
				,	profile_model = ProfileModel.getInstance();
				
				if (profile_model.get('isGuest') === 'F' && profile_model.get('isLoggedIn') === 'F')
				{
					var checkout_step = application.getLayout().currentView.currentStep;

					if (checkout_step)
					{
						checkout_step.disableNavButtons();
					}
					
					new AccountRegisterAsGuestModel().save().done(function(data)
					{
						var skip_login_dont_update_profile = profile_model.get('skipLoginDontUpdateProfile')
						,	current_view = application.getLayout().currentView;

						if (skip_login_dont_update_profile && data.user)
						{
							_.each(skip_login_dont_update_profile, function (attr)
							{
								delete data.user[attr];
							});
						}

						if (data.user)
						{
							profile_model.set(data.user);
						}
						
						current_view.wizard.options.profile = profile_model;
						
						if (data.touchpoints)
						{
							application.Configuration.siteSettings.touchpoints = data.touchpoints;
						}
						
						promise.resolve();

						if (checkout_step)
						{
							checkout_step.enableNavButtons();
						}

						current_view.$('[data-action="skip-login-message"]').remove();
					});
				}
				else
				{
					promise.resolve();
				}
				return promise;
			};

			// add 'this.application' to models that doesn't have it.
			AddressModel.prototype.application = application;
			CreditCardModel.prototype.application = application;
			ProfileModel.prototype.application = application;

			// wrap save() method to LiveOrderModel, AddressModel and CreditCardModel
			var wrapperCheckoutSkipLogin = function wrapperCheckoutSkipLogin (superFn)
			{
				var self = this
				,	super_arguments = Array.prototype.slice.apply(arguments, [1, arguments.length])
				,	promise = jQuery.Deferred();

				if (!promise_guest)
				{
					promise_guest = registerUserAsGuest();
				}

				promise_guest.done(function ()
				{
					var result = superFn.apply(self, super_arguments);

					if (result)
					{
						result.done(function ()
						{
							promise.resolve.apply(result, arguments);
						}).fail(function()
						{
							promise.reject.apply(result, arguments);
						});
					}
					else
					{
						// Notify future promises that a front end validation took place and no promise is returned
						promise.frontEndValidationError = true;
						promise.reject.apply(result, super_arguments);
					}
				});

				_(promise).extend({
					error: function ()
					{
						return this;
					}
				,	success: function ()
					{
						return this;
					}
				});

				return promise;
			};

			// Site Builder cart is in Checkout :/ don't wrap if in shopping
			if (Utils.isInCheckout())
			{
				LiveOrderModel.prototype.save = _.wrap(LiveOrderModel.prototype.save, wrapperCheckoutSkipLogin);
			}

			AddressModel.prototype.save = _.wrap(AddressModel.prototype.save, wrapperCheckoutSkipLogin);

			CreditCardModel.prototype.save = _.wrap(CreditCardModel.prototype.save, wrapperCheckoutSkipLogin);

			ProfileModel.prototype.save = _.wrap(ProfileModel.prototype.save, wrapperCheckoutSkipLogin);
		}
	};
});
