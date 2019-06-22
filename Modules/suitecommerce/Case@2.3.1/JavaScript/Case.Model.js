/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Case 
define(
	'Case.Model'
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
	// @class Case.Model Model for handling Support Cases (CRUD) @extends Backbone.Model

	//@method validateLength. Validates message length. (0 < length <= 4000)
	function validateLength (value, name)
	{
		var max_length = 4000;

		if (value && value.length > max_length)
		{
			return _('$(0) must be at most $(1) characters').translate(name, max_length);
		}
	}

	//@method validateMessage. Validates message entered by the user. Checks length 0 < length <= 4000.
	function validateMessage (value, name)
	{
		/*jshint validthis:true */
		if (this.get('isNewCase')) 
		{
			if (!value)
			{
				return _('$(0) is required').translate(name);
			}

			return validateLength(value, name);
		}
	}

	function validateReply (value, name)
	{
		/*jshint validthis:true */
		if(!this.get('isNewCase') && !value)
		{
			return _('$(0) is required').translate(name);	
		}
	}


    return Backbone.Model.extend(
    {
        urlRoot: _.getAbsoluteUrl('services/Case.Service.ss')

    ,    validation:
        {
            title: {
                required: true
            ,    msg: _('Subject is required').translate()
            }

        ,    message: {
                fn: validateMessage
            }

        ,    reply: {
                fn: validateReply
            }

        ,    email: {
                required: function (value, name, form)
                {
                    return !!form.include_email;
                }
            ,    pattern: 'email'
            ,    msg: _('Please provide a valid email').translate()
            }
        }
    });
});