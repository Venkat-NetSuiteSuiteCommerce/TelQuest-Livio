/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//! © 2015 NetSuite Inc.
define(
	'UnitTest.NavigationHelper.Module'
,	[
		'Backbone'
	,	'UnitTest.NavigationHelper.Preconditions'
	,	'UnitTestHelper'
	,	'NavigationHelper'
	,	'Session'
	]
,	function (
		Backbone
	,	Preconditions
	,	UnitTestHelper
	,	NavigationHelper
	,	Session)
{
	'use strict';

	var helper;

	return xdescribe('Navigation Helper', function()
	{
		beforeEach(function ()
		{
			Preconditions.setPreconditions()
			if (!helper)
			{
				helper = new UnitTestHelper({
					applicationName: 'NavigationHelper'
				,	loadTemplates: true
				,	startApplication: true
				,	mountModules: [NavigationHelper]
				});
			}
		});

		describe('Events', function ()
		{
			var view;

			beforeEach(function ()
			{
				view = new Backbone.View({
						application: helper.application
					});
				view.template = function ()
				{
					return '<a href="#" id="clickable" >Clickable link</a> \
							<a href="#" id="ignorable" data-navigation="ignore-click" >Not effect</a>';
				};
			});

			it('should execute the click plugin when clicking a clickable anchor', function ()
			{
				var plugin = {
					name: 'testClick'
				,	priority: 10
				,	execute: jasmine.createSpy('click handle')
				};
				helper.application.getLayout().click.install(plugin);

				view.showContent();
				view.$('#clickable').click();

				expect(plugin.execute).toHaveBeenCalled();
			});

			it('should NOT execute the click plugin when clicking a data-navigation="ignore-click" anchor', function ()
			{
				var plugin = {
					name: 'testClick'
				,	priority: 10
				,	execute: jasmine.createSpy('click handle')
				};
				helper.application.getLayout().click.install(plugin);

				view.showContent();
				view.$('#ignorable').click();

				expect(plugin.execute).not.toHaveBeenCalled();
			});

			it('should execute the touchstart plugin when touching a clickable anchor', function ()
			{
				var plugin = {
					name: 'testtouchstart'
				,	priority: 10
				,	execute: jasmine.createSpy('touchstart handle')
				};
				helper.application.getLayout().touchStart.install(plugin);

				view.showContent();
				view.$('#clickable').trigger('touchstart');

				expect(plugin.execute).toHaveBeenCalled();
			});

			it('should NOT execute the touchstart plugin when touching a data-navigation="ignore-click" anchor', function ()
			{
				var plugin = {
					name: 'testtouchstart'
				,	priority: 10
				,	execute: jasmine.createSpy('touchstart handle')
				};
				helper.application.getLayout().touchStart.install(plugin);

				view.showContent();
				view.$('#ignorable').trigger('touchstart');

				expect(plugin.execute).not.toHaveBeenCalled();
			});


			it('should execute the mouseDown plugin when pressing a clickable anchor', function ()
			{
				var plugin = {
					name: 'testmouseDown'
				,	priority: 10
				,	execute: jasmine.createSpy('mouseDown handle')
				};
				helper.application.getLayout().mouseDown.install(plugin);

				view.showContent();
				view.$('#clickable').trigger('mousedown');

				expect(plugin.execute).toHaveBeenCalled();
			});

			it('should NOT execute the mouseDown plugin when pressing a data-navigation="ignore-click" anchor', function ()
			{
				var plugin = {
					name: 'testmouseDown'
				,	priority: 10
				,	execute: jasmine.createSpy('mouseDown handle')
				};
				helper.application.getLayout().mouseDown.install(plugin);

				view.showContent();
				view.$('#ignorable').trigger('mousedown');

				expect(plugin.execute).not.toHaveBeenCalled();
			});

			it('should execute the mouseup plugin when releasing a clickable anchor', function ()
			{
				var plugin = {
					name: 'testmouseUp'
				,	priority: 10
				,	execute: jasmine.createSpy('mouseUp handle')
				};
				helper.application.getLayout().mouseUp.install(plugin);

				view.showContent();
				view.$('#clickable').trigger('mouseup');

				expect(plugin.execute).toHaveBeenCalled();
			});

			it('should NOT execute the mouseup plugin when releasing a data-navigation="ignore-click" anchor', function ()
			{
				var plugin = {
					name: 'testmouseUp'
				,	priority: 10
				,	execute: jasmine.createSpy('mouseUp handle')
				};
				helper.application.getLayout().mouseUp.install(plugin);

				view.showContent();
				view.$('#ignorable').trigger('mouseup');

				expect(plugin.execute).not.toHaveBeenCalled();
			});

			it('should execute the touchend plugin when stop touching a clickable anchor', function ()
			{
				var plugin = {
					name: 'testtouchend'
				,	priority: 10
				,	execute: jasmine.createSpy('touchend handle')
				};
				helper.application.getLayout().touchEnd.install(plugin);

				view.showContent();
				view.$('#clickable').trigger('touchend');

				expect(plugin.execute).toHaveBeenCalled();
			});

			it('should NOT execute the touchend plugin when stop touching a data-navigation="ignore-click" anchor', function ()
			{
				var plugin = {
					name: 'testtouchend'
				,	priority: 10
				,	execute: jasmine.createSpy('touchend handle')
				};
				helper.application.getLayout().touchEnd.install(plugin);

				view.showContent();
				view.$('#ignorable').trigger('touchend');

				expect(plugin.execute).not.toHaveBeenCalled();
			});

			it('should execute the touchmove plugin when stop touching a clickable anchor', function ()
			{
				var plugin = {
					name: 'testtouchmove'
				,	priority: 10
				,	execute: jasmine.createSpy('touchmove handle')
				};
				helper.application.getLayout().touchMove.install(plugin);

				view.showContent();
				view.$('#clickable').trigger('touchmove');

				expect(plugin.execute).toHaveBeenCalled();
			});

			it('should NOT execute the touchmove plugin when stop touching a data-navigation="ignore-click" anchor', function ()
			{
				var plugin = {
					name: 'testtouchmove'
				,	priority: 10
				,	execute: jasmine.createSpy('touchmove handle')
				};
				helper.application.getLayout().touchMove.install(plugin);

				view.showContent();
				view.$('#ignorable').trigger('touchmove');

				expect(plugin.execute).not.toHaveBeenCalled();
			});
		});

		describe('Context functions', function ()
		{
			var view;

			beforeEach(function ()
			{
				view = new Backbone.View({
						application: helper.application
					});
				view.template = function ()
				{
					return '<a href="www.test.com" id="clickable" >Clickable link</a> \
							<a href="#" id="ignorable" data-navigation="ignore-click" >Not effect</a>';
				};
			});

			describe('generateNavigationContext', function ()
			{
				it('should return an object containing all the context a general navigation plugin could need', function ()
				{
					var original_session_get = Session.get
					,	layout = view.options.application.getLayout();

					spyOn(Session, 'get').and.returnValue({'home': 'touchpoint_result'})
					view.showContent();

					view.$('#clickable').data('key', 'value');
					view.$('#clickable').data('touchpoint', 'home');
					view.$('#clickable').data('hashtag', '#h');

					view.$('#clickable').on('click', function (e)
					{
						var nav_ctx = layout.generateNavigationContext(e);

						expect(nav_ctx.target_data).toEqual({
							'key':'value'
						,	'touchpoint': 'home'
						,	'hashtag': '#h'
						});
						expect(nav_ctx.target_href).toEqual('www.test.com');
						expect(nav_ctx.target_touchpoint).toEqual('touchpoint_result');
						expect(nav_ctx.original_touchpoint).toEqual('home');
						expect(nav_ctx.clean_hashtag).toEqual('h');
					})

					view.$('#clickable').trigger('click');

					Session.get = original_session_get;
				});
			});
		})
	});

});