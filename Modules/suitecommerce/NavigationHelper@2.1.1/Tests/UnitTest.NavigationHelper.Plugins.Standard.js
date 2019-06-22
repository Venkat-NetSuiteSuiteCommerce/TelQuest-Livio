/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//! © 2015 NetSuite Inc.
define(
	'UnitTest.NavigationHelper.Plugins.Standard'
,	[
		'Backbone'
	,	'underscore'
	,	'UnitTestHelper'
	,	'NavigationHelper'
	,	'Session'
	,	'NavigationHelper.Plugins.Standard'
	,	'UnitTest.NavigationHelper.Preconditions'
	]
,	function (
		Backbone
	,	_
	,	UnitTestHelper
	,	NavigationHelper
	,	Session
	,	NavigationHelperStandard
	,	Preconditions
	)
{
	'use strict';

	return xdescribe('Navigation Helper Modal Plugin', function()
	{
		var view
		,	helper
		,	application_configuration = {
				currentTouchpoint: 'home'
			}
		,	original_session_get;

		beforeEach(function ()
		{
			Preconditions.setPreconditions()
			if (!helper)
			{
				helper = new UnitTestHelper({
					applicationName: 'NavigationHelperStandard'
				,	loadTemplates: true
				,	startApplication: true
				,	mountModules: [NavigationHelper, NavigationHelperStandard]
				});
			}

			original_session_get = Session.get;
			Session.get = jasmine.createSpy('SessionGet')
			Session.get.and.returnValue({
				'home': 'http://system.netsuite.com'
			,	'alternative': 'http://www.google.com'
			,	'secure': 'https://www.secure.com'
			});

			view = new Backbone.View({
					application: helper.application
				});
			view.template = function ()
			{
				return '<a href="navigationHelperTest1" id="internal" >Modal Link 1</a> \
						<a href="http://backbonejs.org" id="external" >Modal Link 2</a> \
						<a href="http://backbonejs.org" target="_blank" id="blank" >Modal Link 3</a>';
			};
		});

		afterEach(function ()
		{
			Session.get = original_session_get;
		});

		it('should navigate in the same tab when clicking an external url', function ()
		{
			var window_obj = {
				document: {
					location: {
						href: ''
					}
				}
			}
			spyOn(_, 'getWindow').and.returnValue(window_obj);

			view.showContent();
			view.$('#external').click();

			expect(_.getWindow).toHaveBeenCalled();
			expect(window_obj.document.location.href).toEqual("http://backbonejs.org");
		});

		it('should navigate using backbone navigaiton when the link is internal', function ()
		{
			var navigation_done = false
			,	Router = Backbone.Router.extend({
					routes: {
						'navigationHelperTest1': 'navigationHelperTest1'
					}
				,	navigationHelperTest1: function()
					{
						navigation_done = true;
					}
				});

			new Router();
			Backbone.history.start();

			view.showContent();
			view.$('#internal').click();

			expect(navigation_done).toEqual(true);
			Backbone.history.navigate('#', {trigger: true});
			Backbone.history.stop();
		});

		it('should use window open when the target is blank', function ()
		{
			var window_obj = {
				open: jasmine.createSpy('window.open')
			}
			spyOn(_, 'getWindow').and.returnValue(window_obj);

			view.showContent();
			view.$('#blank').click();

			expect(window_obj.open).toHaveBeenCalled();
			expect(window_obj.open.calls.argsFor(0)[0]).toEqual('http://backbonejs.org');
		});
	});
});