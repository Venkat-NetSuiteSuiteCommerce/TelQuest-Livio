/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// // not working with other tests - commented temporarily
// define(
// 	['GoogleTagManager', 'UnitTestHelper', 'Tracker', 'NavigationHelper'], 
// 	function (GoogleTagManager, UnitTestHelper, Tracker, NavigationHelper)
// {
// 	'use strict';

// 	var helper = new UnitTestHelper({
// 			applicationName: 'GoogleTagManager'
// 		,	applicationConfiguration: {
// 				tracking: {
// 					googleTagManager: {
// 						id: 'GTM-XXXXXX'
// 					,	dataLayerName: 'dataLayer'
// 					}
// 				}
// 			}
// 	});

// 	return describe('GoogleTagManager Module', function ()
// 	{
// 		describe('Subscribe to the track events before the information is sent', function ()
// 		{
// 			NavigationHelper.mountToApp(helper.application);
// 			GoogleTagManager.mountToApp(helper.application);

// 			it('trackPageview', function (done )
// 			{	
// 				// Backbone.history.start();
// 				var count = 0
// 				function check1()
// 				{					
// 					count++;
// 					if(count==2) 
// 					{
// 						// Backbone.history.stop();
// 						done();		
// 					}
// 				}
// 				var tracker = Tracker.getInstance()
// 				//note: we use once instead of on because there are other unit tests in the same DOM that will also navigate
// 				Tracker.once('pageView', function (eventData, url) 
// 				{
// 					console.log('GTM 1.1')
// 					expect(eventData.data.page).toEqual('/search');
// 					expect(url).toEqual('/search');

// 					eventData.data.page = '/F16-Paper';
// 					console.log('GTM 1.2')
// 					check1()
// 				});

// 				Tracker.once('pageView', function (eventData, url)
// 				{
// 					console.log('GTM 2')
// 					expect(eventData.data.page).toEqual('/F16-Paper');
// 					expect(url).toEqual('/search');
// 					check1()
// 				});

// 				console.log('GTM 0' )
// 				tracker.trackPageview('/search');
// 			});
// 		});
// 	});
// });
