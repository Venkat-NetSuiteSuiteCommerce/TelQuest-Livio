/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('SC.Extensions'
,	[
		'underscore'
	]
,	function(
	   _
	)
{
	'use strict';
	
    if (SC && SC.extensionModules)
    {
        return _.map(SC.extensionModules, function(appModuleName)
        {
			try
			{
            	return require(appModuleName);
			}
			catch(error)
			{
				console.error(error);
			}
        });
    }
    return [];
});