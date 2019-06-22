/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Content.js
// --------------------
// Testing Content.DataModels module.
define(['Content.DataModels', 'Application'], function (ContentDataModels)
{
	'use strict';
	
	describe('Content', function ()
	{
		var content
		,	application
		,	urlsCollection;
		
		beforeEach(function (done)
		{
			application = SC.Application('Content.DataModels');
			application.start([ContentDataModels], function () 
			{
				urlsCollection = ContentDataModels.Urls.Collection.getInstance();
				var urls = [
						{'id':'2','query':'/about-us','pageid':'2','type':'1'}
					,	{'id':'3','query':'/color/Blue,Red/size/Large','pageid':'3','type':'1'}
					,	{'id':'4','query':'/color/Blue*','pageid':'4','type':'2'}
					,	{'id':'5','query':'*Red*','pageid':'5','type':'2'}
					,	{'id':'6','query':'/color/Blue*Red*','pageid':'6','type':'2'}
					,	{'id':'7','query':'/color/Blue*Red*/size/*','pageid':'7','type':'2'}
					,	{'id':'1','query':'*','pageid':'1','type':'2'}
				];
				urlsCollection.reset(urls);
				done(); 
			});				
		});
					
		it('should match the most apropiate url if no exact match is provided', function ()
		{
			expect(urlsCollection.findUrl('/color/Blue').get('query')).toBe('/color/Blue*');
			expect(urlsCollection.findUrl('/color/Blue,Red').get('query')).toBe('/color/Blue*Red*');
			expect(urlsCollection.findUrl('/color/Blue,Red/brand/Nike').get('query')).toBe('/color/Blue*Red*');
			expect(urlsCollection.findUrl('/color/Blue,Red/size/m').get('query')).toBe('/color/Blue*Red*/size/*');
		});

		it('should match the exact url if it is provided', function ()
		{
			expect(urlsCollection.findUrl('/about-us').get('query')).toBe('/about-us');
			expect(urlsCollection.findUrl('/color/Blue,Red/size/Large').get('query')).toBe('/color/Blue,Red/size/Large');
		});
		
		it('should populate the default url, *', function ()
		{
			expect(ContentDataModels.Urls.Collection.defaultModel.get('query')).toBe('*');
		});

	});
	
});