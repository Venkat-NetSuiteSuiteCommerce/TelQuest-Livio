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
	'Checkout.Profile'
,	[
		'Profile.Model'
	,	'jQuery'
	]
,	function (
		ProfileModel
	,	jQuery
	)
{
	'use strict';

	return	{
		mountToApp: function (application)
		{
			var profile_model = ProfileModel.getInstance();

			profile_model.set(SC.ENVIRONMENT.PROFILE);

			if (SC.ENVIRONMENT.ADDRESS)
			{
				profile_model.get('addresses').reset(SC.ENVIRONMENT.ADDRESS);
				delete SC.ENVIRONMENT.ADDRESS;
			}
			else
			{
				profile_model.get('addresses').reset([]);
			}

			if (SC.ENVIRONMENT.CREDITCARD)
			{
				profile_model.get('creditcards').reset(SC.ENVIRONMENT.CREDITCARD);
				delete SC.ENVIRONMENT.CREDITCARD;
			}
			else
			{
				profile_model.get('creditcards').reset([]);
			}

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
		}
	};
});
