/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ssp.libraries
define(
	'ServiceController.Validations'
,	[
		'underscore'
	,	'Utils'
	,	'Application'
	,	'SC.Models.Init'
	]
,	function (
		_
	,	Utils
	,	Application
	,	ModelsInit
	)
{

	'use strict';

	return {
		// @method _evaluatePermissions Evaluates if the permissions demanded are fulfilled by the user of the service
		// @parameter {transactions: Object, lists: Object} user_permissions The permissions the user has
		// @parameter {Object} required_permissions Object literal with all the permissions required by the current service
		// @parameter {String} permissions_operator The operator that must be applied to the array of permissions required by the current service
		// @return {Boolean} True if the permissions have been validated
		_evaluatePermissions: function (user_permissions, required_permissions, permissions_operator)
		{

			permissions_operator = permissions_operator || 'and';
			var	evaluation = permissions_operator !== 'or';

			if (permissions_operator !== 'and' && permissions_operator !== 'or')
			{
				console.log('Invalid permissions operator. Allowed values are: or, and');
				return false;
			}

			if (!_.isArray(required_permissions))
			{
				console.log('Invalid permissions format in controller', this.name);
				return false;
			}

			_.each(required_permissions, function (perm)
			{

				var tokens = perm.split('.');

				var partial_evaluation = !(tokens.length === 3 &&
					tokens[2] < 5 &&
					user_permissions &&
					user_permissions[tokens[0]] &&
					user_permissions[tokens[0]][tokens[1]] < tokens[2]);

				if (permissions_operator === 'or')
				{
					evaluation = evaluation || partial_evaluation;
				}
				else
				{
					evaluation = evaluation &&  partial_evaluation;
				}
			});

			return evaluation;
		}

		// @method requirePermissions
		// @parameter {Object} options
	,	requirePermissions: function (options)
		{
			var required_permissions = (options.list || []).concat(options.extraList || []);

			if (!this._evaluatePermissions(Application.getPermissions(), required_permissions, options.operator))
			{
				throw forbiddenError;
			}
		}

		// @method validateSecure If http protocol is not secure, throw an error
	,	requireSecure: function ()
		{
			if (!Utils.isCheckoutDomain())
			{
				throw methodNotAllowedError;
			}
		}

		// @method validateLoggedInPPS Verifies if user is not logged in and Pwd protected site is enabled, and if registration is enabled
	,	requireLoggedInPPS: function ()
		{
			// We've got to disable passwordProtectedSite and loginToSeePrices features if customer registration is disabled.
			// Note that this condition is expressed with 'registrationmandatory' property being 'T'
			var isRegistrationDisabled = ModelsInit.session.getSiteSettings(['registration']).registration.registrationmandatory === 'T';
			if (!isRegistrationDisabled && ModelsInit.session.getSiteSettings(['siteloginrequired']).siteloginrequired==='T' && !ModelsInit.session.isLoggedIn2())
			{
				throw unauthorizedError;
			}
		}

		// @method requireLogin If user not logged in, throw an error
	,	requireLogin: function ()
		{
			if (!ModelsInit.session.isLoggedIn2())
			{
				throw unauthorizedError;
			}
		}

		// @method checkLoggedInCheckout Pass only if we are not in checkout OR if we are logged in
	,	checkLoggedInCheckout: function()
		{
			//if SECURE AND NOT loggedIn
			if (Utils.isInCheckout(request) && !ModelsInit.session.isLoggedIn2())
			{
				throw unauthorizedError;
			}
		}
	};
});
