/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator'
,   [
		'ReferenceMap.Configuration'
	,   'StoreLocator.Router'
	,   'SC.Configuration'
	,   'Utils'
	,   'underscore'
	]
,   function (
		ReferenceConfiguration
	,   Router
	,   Configuration
	,   Utils
	,   _
	)
{
	'use strict';

	return {
		//@method mountToApp
		//@param {Object} application
		mountToApp: function mountToApp (application) 
		{
			var configurationIcons = ['storeLocator.icons.stores', 'storeLocator.icons.position', 'storeLocator.icons.autocomplete'];
			
			_.each(configurationIcons, function (property)
			{
				if (Utils.getPathFromObject(Configuration, property, ''))
				{
					Utils.setPathFromObject(Configuration, property, _.getAbsoluteUrlOfNonManagedResources(Utils.getPathFromObject(Configuration, property, '')));
				}
			});
			
			if (ReferenceConfiguration.isEnabled() && window.location.protocol === 'https:')
			{	
				return new Router(application);
			}
		}
	};
});