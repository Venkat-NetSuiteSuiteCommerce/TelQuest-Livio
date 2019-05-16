/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Profile.ChangeEmailAddress.Model.js
// -----------------------
// View Model for changing user's email
// @module Profile
define(
	'Profile.ChangeEmailAddress.Model'
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

	// @class Profile.ChangeEmailAddress.Model @extends Backbone.Model
	return Backbone.Model.extend(
	{
		urlRoot: 'services/Profile.Service.ss'
	,	validation: {
			current_password:  { required: true, msg: _('Current password is required').translate() }
		,	confirm_email: [
				{ required: true, msg: _('Confirm Email is required').translate() }
			,	{ equalTo: 'new_email', msg: _('New Email and Confirm New Email do not match').translate() }
			]
		,	new_email: { required: true, msg: _('New Email is required').translate() }
		}
	});
});