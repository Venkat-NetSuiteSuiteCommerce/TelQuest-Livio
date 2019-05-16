/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//! © 2015 NetSuite Inc.
define(
	'UnitTest.NavigationHelper.Plugins.Modals'
,	[
		'Backbone'
	,	'underscore'
	,	'UnitTestHelper'
	,	'NavigationHelper'
	,	'Session'
	,	'NavigationHelper.Plugins.Modals'
	,	'UnitTest.NavigationHelper.Preconditions'
	]
,	function (
		Backbone
	,	_
	,	UnitTestHelper
	,	NavigationHelper
	,	Session
	,	NavigationHelperModal
	,	Preconditions
	)
{
	'use strict';

	//TODO: temporarily comenetd because two test using modals in the same dom are conflictive - the other is ContentEnhancedViews in modals
	// return xdescribe('Navigation Helper Modal Plugin', function()
	// {
	// 	var view
	// 	,	helper
	// 	,	application_configuration = {
	// 			currentTouchpoint: 'home'
	// 		}
	// 	,	original_session_get;

	// 	beforeEach(function ()
	// 	{
	// 		Preconditions.setPreconditions()
	// 		if (!helper)
	// 		{
	// 			helper = new UnitTestHelper({
	// 				applicationName: 'NavigationHelperModals'
	// 			,	loadTemplates: true
	// 			,	startApplication: true
	// 			,	mountModules: [NavigationHelper, NavigationHelperModal]
	// 			,	applicationConfiguration: _.clone(application_configuration)
	// 			});
	// 		}

	// 		original_session_get = Session.get;
	// 		Session.get = jasmine.createSpy('SessionGet')
	// 		Session.get.and.returnValue({
	// 			'home': 'http://system.netsuite.com'
	// 		,	'alternative': 'http://www.google.com'
	// 		,	'secure': 'https://www.secure.com'
	// 		});

	// 		view = new Backbone.View({
	// 				application: helper.application
	// 			});
	// 		view.template = function ()
	// 		{
	// 			return '<a href="navigationHelperTest1" data-toggle="show-in-modal" id="modal1" >Modal Link 1</a> \
	// 					<a href="http://backbonejs.org" data-toggle="show-in-modal" id="modal2" >Modal Link 2</a>';
	// 		};
	// 	});

	// 	afterEach(function ()
	// 	{
	// 		Session.get = original_session_get;
	// 	});

	// 	it('should open views in modal if the link contains data-toggle="show-in-modal"', function (cb)
	// 	{
	// 		//we need a router to navigate to where the link to be shown in the modal tell us.
	// 		var Router = Backbone.Router.extend({
	// 			routes: {
	// 				'navigationHelperTest1': 'navigationHelperTest1'
	// 			}
	// 		,	navigationHelperTest1: function()
	// 			{
	// 				var view = new Backbone.View({
	// 					application: helper.application
	// 				});
	// 				view.template = function () {return '<p id="navhelpertestinmodal1">hello world using data-toggle="show-in-modal"!</p>';};
	// 				view.showContent();
	// 			}
	// 		});

	// 		new Router();
	// 		Backbone.history.start();

	// 		view.showContent();
	// 		view.$('#modal1').click();

	// 		expect(helper.application.getLayout().$('#in-modal-navhelpertestinmodal1').length).toEqual(1);

	// 		Backbone.history.stop();
	// 		helper.application.getLayout().$containerModal.modal('hide');
	// 		helper.application.getLayout().$containerModal.on('hidden.bs.modal', cb);
	// 	});

	// 	it('should open EXTERNAL views in modal if the link contains data-toggle="show-in-modal" and the url es external', function ()
	// 	{
	// 		view.showContent();
	// 		view.$('#modal2').click();

	// 		var $iframe = helper.application.getLayout().$('iframe');

	// 		expect($iframe.length).toEqual(1);
	// 		expect($iframe.attr('src')).toEqual("http://backbonejs.org");

	// 		helper.application.getLayout().$containerModal.modal('hide');
	// 	});
	// });
});