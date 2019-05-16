/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'UnitTestHelper'
	,	'Merchandising'
	,	'UnitTest.Merchandising.Module.View'
	,	'Application'
	,	'Backbone.View'
	,	'Backbone.View.Plugins'
	]
,	function (
		UnitTestHelper
	,	Merchandising
	,	UnitTestMerchandisingModuleView
	)
{
	'use strict';

	return describe('Merchandising Module', function ()
	{
		var helper = new UnitTestHelper({
			applicationName: 'Merchandising'
		,	startApplication: true
		,	mountModules: [Merchandising]
		});
		
		beforeEach(function(){
			spyOn(jQuery.fn, 'merchandisingZone').and.callThrough();
		});

		it('When a view with data-type="merchandizing-zone" is added the jquery plugin should be called', function ()
		{
			var view = new UnitTestMerchandisingModuleView({
				application: helper.application
			});

			view.render();			

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone).not.toHaveBeenCalled(); 

			view.showContent();

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone).toHaveBeenCalled();

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone.calls.count()).toEqual(1);

		}); 

		
		xit('when a merchandising content type is added, the jquery plugin should be called ', function ()
		{
			var view = new Backbone.View({
				application: helper.application
			});
			view.template = _('<div data-type="merchandising-zone">test<div class="target1"></div></div>').template(); 

			view.showContent();

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone.calls.count()).toEqual(2);

			//now simulate a content merchandizing adding
			var content_zone = {contenttype: 'merchandising'
			,	content: 'hello world'
			,	target: '.target1'
			};

			helper.application.getLayout().trigger('renderEnhancedPageContent', view, content_zone);

			var spy = view.$('[data-type="merchandising-zone"]').merchandisingZone;
			expect(spy.calls.count()).toEqual(4);
			expect(spy.calls.argsFor(3)[0].application).toBe(helper.application);
			expect(spy.calls.argsFor(3)[0].id).toBe('hello world');
	
		}); 
	});
});