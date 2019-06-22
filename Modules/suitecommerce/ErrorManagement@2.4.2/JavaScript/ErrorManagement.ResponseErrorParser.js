/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ErrorManagement
define('ErrorManagement.ResponseErrorParser',
	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	//@function ErrorManagementErrorParser Parse an error message form the back-end
	//@param {jQuery.XHR} jqXhr Response obtains from a Backbone.Model/Collection AJAX
	//@param {Array<String>} messageKeys List of properties to look for a error message response in the first parameter
	//@return {String}
	return function ErrorManagementErrorParser (jqXhr, messageKeys)
	{
		var message = null
		,	current_key;

		try
		{
			// Tries to parse the responseText and try to read the most common keys for error messages
			var response = JSON.parse(jqXhr.responseText);
			if (response)
			{
				for (var i = 0; i < messageKeys.length; i++)
				{
					current_key = messageKeys[i];
					if (response[current_key])
					{
						message = _.isArray(response[current_key]) ? response[current_key][0] : response[current_key];
						break;
					}
				}
			}
		}
		catch (err) {
			console.error('Impossible to parse backend error', jqXhr);
		}

		return message;
	};
});