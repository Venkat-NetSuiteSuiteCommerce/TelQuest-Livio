/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//! © 2015 NetSuite Inc.
define(
	'UnitTest.NavigationHelper.Plugins.DataTouchPoint'
,	[
		'Backbone'
	,	'underscore'
	,	'UnitTestHelper'
	,	'NavigationHelper'
	,	'Session'
	,	'NavigationHelper.Plugins.DataTouchPoint'
	,	'UnitTest.NavigationHelper.Preconditions'
	]
,	function (
		Backbone
	,	_
	,	UnitTestHelper
	,	NavigationHelper
	,	Session
	,	NavigationHelperDataTouchPoint
	,	Preconditions
	)
{
	'use strict';

	return xdescribe('Navigation Helper Data Touch Point Plugin', function()
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
					applicationName: 'NavigationHelperPluginsDataTouchPoint'
				,	loadTemplates: true
				,	startApplication: true
				,	mountModules: [NavigationHelper, NavigationHelperDataTouchPoint]
				,	applicationConfiguration: _.clone(application_configuration)
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
				return '<a href="#" data-touchpoint="home" id="dtp" >Data Touchpoint Link</a> \
						<a href="#" data-touchpoint="home" id="dtp2" >Link 2</a> \
						<a href="#" data-touchpoint="secure" id="odtp" >Link 6</a> \
						<a href="#" data-touchpoint="invalidvalue" id="idtp" >Link 6</a> \
						<a href="#" data-touchpoint="alternative" id="adtp" >Link 3</a> \
						<a href="#" data-touchpoint="alternative" data-parameters="color=red" id="pdtp" >Link 4</a> \
						<a href="#" data-touchpoint="alternative" data-hashtag="#search" id="hdtp" >Link 5</a>';
			};
		});

		afterEach(function ()
		{
			Session.get = original_session_get;
		});

		it('should return the plain data touch point converted based on the locale when none hashtag is present and multiples hosts are configured', function ()
		{
			var old_conf = _.clone(helper.application.Configuration);
			helper.application.Configuration.currentTouchpoint = null;
			view.showContent();
			view.$('#dtp').trigger('mousedown');

			//Notice that this chage is becuase of the availableHosts defined in the precondition data
			expect(view.$('#dtp').attr('href')).toEqual('http://en.site.com');
			helper.application.Configuration = old_conf;
		});

		it('should return just # when there is not hashtag nethier parameter and is navigating to the same data touchpoint', function ()
		{
			view.showContent();
			view.$('#dtp2').trigger('mousedown');

			expect(view.$('#dtp2').attr('href')).toEqual('#');
		});

		xit('should make a post when navigating a differetne toucn than current and it is not a secure domain', function ()
		{
			spyOn(_, 'doPost');

			var old_conf = _.clone(helper.application.Configuration);
			helper.application.Configuration.currentTouchpoint = null;

			view.showContent();
			view.$('#odtp').trigger('mousedown');

			expect(view.$('#odtp').attr('href')).toEqual('#');
			expect(_.doPost).toHaveBeenCalledWith('https://www.secure.com?lang=en_US');
			helper.application.Configuration = old_conf;
		});

		it('should return the plain data touch point url when there NO host configured', function ()
		{
			var ah = SC.ENVIRONMENT.availableHosts;
			SC.ENVIRONMENT.availableHosts = [];

			view.showContent();
			view.$('#adtp').trigger('mousedown');

			expect(view.$('#adtp').attr('href')).toEqual(Session.get()['alternative']);
			SC.ENVIRONMENT.availableHosts = ah;
		});

		it('should return the plain data touch point url with hashtag when there NO host configured and are data hashtag', function ()
		{
			var ah = SC.ENVIRONMENT.availableHosts;
			SC.ENVIRONMENT.availableHosts = [];

			view.showContent();
			view.$('#hdtp').trigger('mousedown');

			expect(view.$('#hdtp').attr('href')).toEqual(Session.get()['alternative'] + '?fragment=search');
			SC.ENVIRONMENT.availableHosts = ah;
		});

		it('should return the plain data touch point url with parameters when data-parameters are specified', function ()
		{
			var ah = SC.ENVIRONMENT.availableHosts;
			SC.ENVIRONMENT.availableHosts = [];

			view.showContent();
			view.$('#pdtp').trigger('mousedown');

			expect(view.$('#pdtp').attr('href')).toEqual(Session.get()['alternative'] + '?color=red');
			SC.ENVIRONMENT.availableHosts = ah;
		});

		xit('should return set an empty href when data-touchpoint is valid', function ()
		{
			view.showContent();
			view.$('#idtp').trigger('mousedown');

			expect(view.$('#idtp').attr('href')).toEqual('');
		});

	});
});