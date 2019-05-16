/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Profile.js
// -----------------
// Defines the Profile module (Collection, Views, Router)
// As the profile is instanciated in the application (without definining a model)
// the validation is configured here in the mountToApp
define(
	'MyAccount.Profile'
,	[
		'Profile.Router'
	,	'Profile.Model'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		Router
	,	ProfileModel
	,	_
	,	jQuery
	)
{
	'use strict';

	return	{
		Router: Router
	,	MenuItems: [
			{
				id: 'settings'
			,	name: _('Settings').translate()
			,	index: 4
			,	children:
				[
					{
						id: 'profileinformation'
					,	name: _('Profile Information').translate()
					,	url: 'profileinformation'
					,	index: 1
					}
				,	{
						id: 'emailpreferences'
					,	name: _('Email Preferences').translate()
					,	url: 'emailpreferences'
					,	index: 2
					}
				,	{
						id: 'updateyourpassword'
					,	name: _('Update Your Password').translate()
					,	url: 'updateyourpassword'
					,	index: 5
					}
				]
			}
		]

	,	mountToApp: function (application)
		{
			var profile_model_instance = ProfileModel.getInstance();

			if (SC.ENVIRONMENT.PROFILE)
			{
				profile_model_instance.set(SC.ENVIRONMENT.PROFILE);

				if (profile_model_instance.get('isperson') && application.getConfig('siteSettings.registration.companyfieldmandatory') !== 'T')
				{
					delete profile_model_instance.validation.companyname;
				}

				if (!profile_model_instance.get('isperson'))
				{
					delete profile_model_instance.validation.firstname;
				}

				if (!profile_model_instance.get('lastname') || !profile_model_instance.get('isperson'))
				{
					delete profile_model_instance.validation.lastname;
				}

				if (!profile_model_instance.get('phone') && profile_model_instance.validation.phone)
				{
					profile_model_instance.validation.phone.required = false;
				}

				if (SC.ENVIRONMENT.LIVEPAYMENT)
				{
					if (SC.ENVIRONMENT.LIVEPAYMENT.balance)
					{
						profile_model_instance.set('balance', SC.ENVIRONMENT.LIVEPAYMENT.balance);
					}
					if (SC.ENVIRONMENT.LIVEPAYMENT.balance_formatted)
					{
						profile_model_instance.set('balance_formatted', SC.ENVIRONMENT.LIVEPAYMENT.balance_formatted);
					}
				}
			}
			if (SC.ENVIRONMENT.ADDRESS)
			{
				profile_model_instance.get('addresses').reset(SC.ENVIRONMENT.ADDRESS);
				delete SC.ENVIRONMENT.ADDRESS;
			}
			else
			{
				profile_model_instance.get('addresses').reset([]);
			}

			if (SC.ENVIRONMENT.CREDITCARD)
			{
				profile_model_instance.get('creditcards').reset(SC.ENVIRONMENT.CREDITCARD);
				delete SC.ENVIRONMENT.CREDITCARD;
			}
			else
			{
				profile_model_instance.get('creditcards').reset([]);
			}

			var Layout = application.getLayout();

			profile_model_instance.on('change:firstname change:lastname change:companyname', function ()
			{
				Layout.updateHeader();
			});

			application.getUser = function()
			{
				var profile_promise = jQuery.Deferred();

				ProfileModel.getPromise().done(function()
				{
					profile_promise.resolve(ProfileModel.getInstance());
				})
				.fail(function()
				{
					profile_promise.reject.apply(this, arguments);
				});

				return profile_promise;
			};

			return new Router(application);
		}
	};
});
