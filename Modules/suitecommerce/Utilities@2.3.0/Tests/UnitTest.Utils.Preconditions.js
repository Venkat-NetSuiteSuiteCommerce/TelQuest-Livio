/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('UnitTest.Utils.Preconditions', ['UnitTestHelper.Preconditions'], function (Preconditions)
{
	'use strict';

	// Preconditions.deepExtend(window.SC || {}, {
	// 	ENVIRONMENT: {
	// 		siteSettings: {
	// 			shopperCurrency: {
	// 				isdefault: 'T'
	// 			,	languagename: 'English (U.S.)'
	// 			,	locale: 'en_US'
	// 			,	name: 'English (U.S.)'
	// 			}
	// 		}
	// 	}
	// }); 

	return {
		setPreconditions: function()
		{
			window.SC = Preconditions.deepExtend(window.SC || {}, {
				ENVIRONMENT: {
					siteSettings: {
						shopperCurrency: {
							isdefault: 'T'
						,	languagename: 'English (U.S.)'
						,	locale: 'en_US'
						,	name: 'English (U.S.)'
						}
					}
				}
			}); 
		}
	}
	
});