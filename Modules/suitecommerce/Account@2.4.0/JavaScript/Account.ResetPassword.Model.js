/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Account
define('Account.ResetPassword.Model'
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

	//@class Account.ResetPassword.Model
	// Sends user input data to the reset password service
	// validating passwords before they are sent
	// [Backbone.validation](https://github.com/thedersen/backbone.validation)
	//@extend Backbone.Model
	return Backbone.Model.extend({

		//@property {String} urlRoot
		urlRoot: Utils.getAbsoluteUrl('services/Account.ResetPassword.Service.ss')

		//@property {Object} validation. Backbone.Validation attribute used for validating the form before submit.
	,	validation: {
			confirm_password: [
				{
					required: true
				,	msg: _('Confirm password is required').translate()
				}
			,	{
					equalTo: 'password'
				,	msg: _('New Password and Confirm Password do not match').translate()
				}
			]

		,	password: {
				required: true
			,	msg: _('New  password is required').translate()
			}
		}
	});
});
