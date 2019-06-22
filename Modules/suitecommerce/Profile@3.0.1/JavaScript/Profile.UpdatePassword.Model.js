/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Profile.UpdatePassword.Model.js
// -----------------------
// View Model for changing user's password
// @module Profile
define(
	'Profile.UpdatePassword.Model'
,	[
		'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		Backbone
	,	_
	)
{
	'use strict';

	// @class Profile.UpdatePassword.Model @extends Backbone.Model
	return Backbone.Model.extend(
	{
		urlRoot: 'services/Profile.Service.ss'
		,	validation: {
			current_password:  { required: true, msg: _('Current password is required').translate() }
		,	confirm_password: [ 
				{ required: true, msg: _('Confirm password is required').translate() }
			,	{ equalTo: 'password', msg: _('New Password and Confirm Password do not match').translate() }]
		
		,	password: { required: true, msg: _('New password is required').translate() }
			
		}
	});
});