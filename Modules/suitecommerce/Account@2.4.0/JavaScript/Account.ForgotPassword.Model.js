/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Account
define('Account.ForgotPassword.Model'
,	[	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		Backbone
	,	_
	,	Utils
	)
{
	'use strict';

	//@class Account.ForgotPassword.Model
	// Sends user input data to the forgot password service
	// validating email before is sent
	// [Backbone.validation](https://github.com/thedersen/backbone.validation)
	// @extend Backbone.Model
	return Backbone.Model.extend({

		//@property {String} urlRoot
		urlRoot: Utils.getAbsoluteUrl('services/Account.ForgotPassword.Service.ss')

		//@property validation. Backbone.Validation attribute used for validating the form before submit.
	,	validation: {
			email: {
				required: true
			,	pattern: 'email'
			,	msg: _('Valid Email is required').translate()
			}
		}
	});
});
