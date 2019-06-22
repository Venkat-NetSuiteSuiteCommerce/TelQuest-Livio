/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ssp.libraries
// Supports infrastructure for defining model classes by using SCModel.
define('SC.Model',
	[
		'SC.EventWrapper'
	,	'Backbone.Validation'
	,	'underscore'
	]
,	function (
		SCEventWrapper
	,	BackboneValidation
	,	_
	)
{
	'use strict';

	/*
	@class SCModel Subclasses of SC.EventWrapper are used to implement the RESTFUL methods for accessing a particular
	resource, in general a netsuite record like commerce order, session, or custom record.

	Note: When using SCModel for defining models think more on object singletons like in classes.

	Note: Also SCModel instances support Aspect Oriented functionality on methods so users can register to before or after a method of model is called.
	For example, we can hook to the time when an LiveOrder is submitted so we can customize its behavior like this:

	Application.on('before:LiveOrder:save', function()
	{
		... do something before submitting a live order ...
	})
	*/
	var SCModel = SCEventWrapper.extend({

		name: 'SCModel'

	,	validate: function validate(data)
		{
			//if the model has specified validation logic
			if (this.validation)
			{
				var validator = _.extend({
						validation: this.validation
					,	attributes: data
					}, BackboneValidation.mixin)

				,	invalidAttributes = validator.validate();

				if (!validator.isValid())
				{
					throw {
						status: 400
					,	code: 'ERR_BAD_REQUEST'
					,	message: invalidAttributes
					};
				}
			}
		}
	});

	return SCModel;
});