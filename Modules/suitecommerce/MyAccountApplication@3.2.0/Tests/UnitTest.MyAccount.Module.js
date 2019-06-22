/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*global SC:false, it:false, describe:false, define:false, expect:false, beforeEach:true */

define(
	[	
		'UnitTestHelper'
	,	'underscore'
	,	'jQuery'
	,	'SC.MyAccount'
	,	'jasmine2-typechecking-matchers'
	,	'MenuTree.View'
	,	'Utils'
	]
,	function (
		UnitTestHelper
	,	_
	,	jQuery
	,	myAccount
	)
{
	'use strict';

	describe('Basic', function ()
	{
		it('MyAccount instance', function()
		{
			expect(SC.Application('MyAccount').name).toBe('MyAccount');
		});
	});

	describe('Menu items', function ()
	{
		var is_started = false
		,	layout = null;

		beforeEach(function (cb)
		{
			if (!is_started)
			{
				//  a module that defines a simple static menuitems
				var ApplicationModuleTest1 = {
					MenuItems: [
						{
							id: 'test1'
						,	name: _('Test 1').translate()
						,	url: 'test1/url'
						,	index: 2
						}
					,	{
							id: 'test2'
						,	name: _('Test 2').translate()
						,	url: 'test2/url'
						,	index: 2
						}
					]
				};

				// another module with more advanced menu items definitions, including use of functions and childrens.
				var ApplicationModuleTest2 = {
					MenuItems: [
						{
							id: 'test4'
						,	name: _('Test 3').translate()
						,	url: 'test4/url'
						,	index: 2

							// submenues can be added with the children property
						,	children: [{
								id: 'children1'
							,	name: _('chlidren').translate()
							,	url: 'test4/url'
							,	index: 2
							}]
						}
					,	function ()
						{  //menu items it self can be functions
							return {
								id: 'test5'
							,	name: function (application) { return application.name; }
							,	url: 'test5/url'
							,	index: 2 // menu order is first by index and then by name.
								// children property can also be a function
							,	children: function() {
									return [{
									id: 'children3'
								,	name: _('chlidren3').translate()
								,	url: 'children3/url'
								,	index: 2
								,	children: [ //and also sub-childrens
										{
											id: 'children31'
										,	name: _('chlidren31').translate()
										,	url: 'children31/url'
										,	index: 2
										,	children: [ //and also sub-childrens
												{
												id: 'children311'
											,	name: _('chlidren311').translate()
											,	url: 'children311/url'
											,	index: 2
											}
											]
										}
									]
								}];
								}
							};
						}
					]
				};

				var ApplicationModuleTest3 = {
					MenuItems: [
						{
							id: 'test6'
						,	name: function(){return 'ApplicationModuleTest3 say hi!'; }
						,	url: 'test6/url'
						,	index: 2
						}
					]
				};

				myAccount.start([ApplicationModuleTest1, ApplicationModuleTest2, ApplicationModuleTest3], function ()
				{
					is_started = true;
					layout = myAccount.getLayout();

					layout.appendToDom(); //we can work without appending to the DOM
					layout.render();

					cb();
				});
			}
			else
			{
				cb();
			}
		});

		it('the DOM should contain a sidebar with 2 menu items links', function()
		{
			expect(layout.$('#side-nav').size()).toBe(1);
			expect(layout.$('#side-nav .menu-tree > .menu-tree-node').size()).toBe(5); //five parent menus
		});

		it('the DOM should now contain there should be two data-label attributes', function()
		{
			expect(layout.$('#side-nav [data-id="test2"]').size()).toBe(1);
			expect(layout.$('#side-nav [data-id="test1"]').size()).toBe(1);
		});

		it('index should be respected and the links have the correct hrefs', function()
		{
			expect(layout.$('#side-nav>.menu-tree > .menu-tree-node:nth-child(1)>a').attr('href')).toBe('/test6/url');
			//expect(layout.$('#side-nav>.menu-tree > .menu-tree-node:nth-child(2)>div>a').attr('href')).toBe('/test5/url');
			expect(jQuery.trim(layout.$('#side-nav>.menu-tree > .menu-tree-node:nth-child(1)>a').text())).toBe('ApplicationModuleTest3 say hi!');
			expect(jQuery.trim(layout.$('#side-nav>.menu-tree > .menu-tree-node:nth-child(2)>a').text())).toBe('MyAccount');
		});
	});

});
