// @module MyModule
// Handles MyModule many features
define(
	'MyModule.Model'
,	[
		'SC.Model'
	,	'Application'
	,	'Profile.Model'
	,	'LiveOrder.Model'
	,	'Address.Model'
	,	'CreditCard.Model'
	,	'SiteSettings.Model'
	]

,	function (SCModel, Application, Profile, LiveOrder, Address, CreditCard, SiteSettings)
{
	'use strict';

	// @class MyModule Defines the model used by the all MyModule related services.
	// @extends SCModel
	return SCModel.extend({

		name: 'MyModule'

		// @method something
		// @param {String} email
		// @param {String} subscribe
		// @returns {Object} ret touchpoints and user profile data
	,	something: function (email, subscribe)
		{
			return 'TODO'; 
		}

	});
});
