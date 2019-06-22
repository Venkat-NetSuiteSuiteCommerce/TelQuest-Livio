/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Newsletter
define(
	'Newsletter.Model'
,	[
		'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		_
	,	Backbone
	,	Utils
	)
{
	'use strict';

	// @class Newsletter.Model Validate and send user input data to the newsletter service
	// @extend Backbone.Model
	return Backbone.Model.extend({

		// @property {String} urlRoot
		urlRoot: Utils.getAbsoluteUrl('services/Newsletter.Service.ss')

		// @property {String} email The email of the subscriber
	,	email: ''

		// @property validation Backbone.Validation attribute used for validating the form before submit.
	,	validation: {
		    email: [{
		    	required: true,
		    	msg: 'Enter an email address to subscribe'
		    }
		,	{
		    	pattern: 'email',
		    	msg: 'Valid email address is required'
			}]
		}
	});
});