/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(['CMSadapter.Page.Router', 'CMSadapter.Page.Collection', 'UnitTestHelper.Preconditions', 
	'jasmine2-typechecking-matchers']
	, function (Router, Collection, Preconditions)
{
	'use strict';

	describe('Module: CMSadapter', function ()
	{
		it('router', function ()
		{
			Preconditions.setDefaultEnvironment();	

			var MOCK = {"pages":[{"id":17,"pageid":17,"name":"Home","site_id":3,"type":1,"url":"/","query":"home","page_title":"home new title!","page_header":"home", "meta_keywords": "home, keyword", "meta_description":"home metadesc","version":31,"created_by":"-5"},{"id":22,"pageid":22,"name":"hello","site_id":3,"type":1,"url":"hello","query":"hello","page_title":"hello","page_header":"hello","version":31,"created_by":"-5"},{"id":23,"pageid":23,"name":"noo","site_id":3,"type":1,"url":"noo","query":"noo","page_title":"noo","page_header":"noo","version":31,"created_by":"-5"},{"id":18,"pageid":18,"name":"seba6","site_id":3,"type":1,"url":"seba6","query":"seba6","page_title":"seba6","page_header":"seba6","version":31,"created_by":"-5"},{"id":15,"pageid":15,"name":"seba2","site_id":3,"type":1,"url":"seba2","query":"seba2","page_title":"seba2","page_header":"seba2","version":31,"created_by":"-5"},{"id":24,"pageid":24,"name":"foo1","site_id":3,"type":1,"url":"foo1","query":"foo1","page_title":"foo1","page_header":"foo1","version":31,"created_by":"-5"},{"id":16,"pageid":16,"name":"seba4","site_id":3,"type":1,"url":"seba4","query":"seba4","page_title":"seba4","page_header":"seba4","version":31,"created_by":"-5"},{"id":26,"pageid":26,"name":"seba3232","site_id":3,"type":1,"url":"seba3232","query":"seba3232","page_title":"seba3232","page_header":"seba3232","version":31,"created_by":"-5"},{"id":27,"pageid":27,"name":"faedo?foo=1","site_id":3,"type":1,"url":"faedofoo1","query":"faedofoo1","page_title":"faedo?foo=1","page_header":"faedo?foo=1","version":31,"created_by":"-5"},{"id":28,"pageid":28,"name":"faedo?foo=2","site_id":3,"type":1,"url":"faedofoo2","query":"faedofoo2","page_title":"faedo?foo=2","page_header":"faedo?foo=2","version":31,"created_by":"-5"},{"id":29,"pageid":29,"name":"/search","site_id":3,"type":1,"url":"search","query":"search","page_title":"/martin123","page_header":"/search","version":31,"created_by":"-5"},{"id":12,"pageid":12,"name":"seba1","site_id":3,"type":1,"url":"seba1","query":"seba1","page_title":"seba1","page_header":"seba1","version":31,"created_by":"-5"},{"id":21,"pageid":21,"name":"seba10","site_id":3,"type":1,"url":"seba10","query":"seba10","page_title":"seba10","page_header":"seba10","version":31,"created_by":"-5"},{"id":20,"pageid":20,"name":"seba8","site_id":3,"type":1,"url":"seba8","query":"seba8","page_title":"seba8","page_header":"seba8","version":31,"created_by":"-5"},{"id":8,"pageid":8,"name":"seba landing 1","site_id":3,"type":1,"url":"seba-landing-1","query":"seba-landing-1","page_title":"title 1 for seba landing 1","page_header":"seba landing 1","addition_to_head":"<script>alert('thanks for visiting this gooooood page')</script>","meta_keywords":"some,meta,keyword,for,seba,landing1","meta_description":"some meta description for landing 1","version":31,"created_by":"-5"}]};
			var collection = new Collection();
			collection.reset(MOCK.pages);
			var router = new Router(null, collection);
			var page = router.getPageForFragment('seba1');

			expect(page.get('name')).toBe('seba1');

			page = router.getPageForFragment('seba1?accept=params&other=9');
			expect(page.get('name')).toBe('seba1');

			Backbone.history.fragment = ''; //needed for this test be able to run together with other tests in the same DOM
			page = router.getPageForFragment('');
			expect(page.get('name')).toBe('Home');
		});
	});
});
