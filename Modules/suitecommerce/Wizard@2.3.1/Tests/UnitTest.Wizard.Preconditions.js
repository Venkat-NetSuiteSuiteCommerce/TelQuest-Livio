/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(['UnitTestHelper.Preconditions'], function (Preconditions)
{
	return {
		setPreconditions: function()
		{
			window.SC = Preconditions.deepExtend(window.SC || {}, {
				ENVIRONMENT: {
					siteSettings: {
						registration: {
							displaycompanyfield: 'T'
						}
					,	countries: {
							UY: {
								isziprequired: 'T'
							}
						}
					}
				,	currentLanguage : {
						locale: 'en_US'
					}
				,	availableHosts: []
				,	availableLanguages: []
				,	availableCurrencies: []
				,	PROFILE: {
						isLoggedIn : 'T'
					}
				,	getSessionInfo: function(key)
					{
						'use strict';
						var session = SC.SESSION || SC.DEFAULT_SESSION || {};
						return (key) ? session[key] : session;
					}
				}
			}); 
		}
	}	

});