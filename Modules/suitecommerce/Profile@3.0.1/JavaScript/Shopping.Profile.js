/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Profile.js
// -----------------
// Defines the Profile module (Collection, Views, Router)
define(
	'Shopping.Profile'
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

	return {
		mountToApp: function (application)
		{
			application.getUser = function ()
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
