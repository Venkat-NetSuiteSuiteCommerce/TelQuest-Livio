/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module CustomFields
define(
	'CustomFields.Utils'
,	[
		'Configuration'
	]
,	function (
		Configuration
	)
{

	'use strict';

	// @class CustomFields.Utils Define a set of utilities related with custom fields
	return {
		//@method getCustomFieldsIdToBeExposed Get the list of fields id from configuration that should be exposed
		//return {Array} A array with the custom fields id
		getCustomFieldsIdToBeExposed: function(recordType)
		{
			if (Configuration.customFields)
			{
				return Configuration.customFields[recordType] || [];
			}

			return [];
		}
	};
});