/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ApplicationSkeleton.js
// --------------------
// Testing Core
define(
	[
		'AjaxRequestsKiller'
	,	'UnitTestHelper'
	,	'Application'
	,	'mock-ajax'
	]
,	function (
		AjaxRequestsKiller
	,	UnitTestHelper
	)
{
	'use strict';

	var helper;

	beforeEach(function()
	{
		window.SC = jQuery.extend(window.SC || {}, {
			ENVIRONMENT: {siteSettings: {}}
		});

		helper = new UnitTestHelper({
			applicationName: 'AjaxRequestsKiller'
		,	loadTemplates: true
		,	startApplication: true
		,	mountModules: [AjaxRequestsKiller]
		,	environment: {siteSettings: {}}
		});

		jasmine.Ajax.install();
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
	})

	afterEach(function() 
	{
		jasmine.Ajax.uninstall();
		location.hash = '';
	});

	var Fake_model = Backbone.Model.extend({})
	,	Fake_collection = Backbone.Collection.extend({
			url: 'some/service.ss'
		,	model: Fake_model
		})
	,	Fake_router = Backbone.Router.extend({
			routes: {
					'second-url': 'fakeHandle'
				,	'second-url2': 'fakeHandle'
			}
		,	fakeHandle: function(){}
		});

	describe('Ajax Request Killer', function () 
	{

		it('should define an initial killerId', function ()
		{
			expect(AjaxRequestsKiller.getKillerId).toBeDefined();
			expect(AjaxRequestsKiller.getKillerId()).not.toBe(null);
		});

		it('should allow parallel calls if killerId is not specified', function ()
		{
			var my_collection1 = new Fake_collection()
			,	my_collection2 = new Fake_collection()
			,	xhr1 = my_collection1.fetch();

			expect(xhr1.state()).toBe('pending');

			var xhr2 =my_collection2.fetch();

			expect(xhr1.state()).toBe('pending');
			expect(xhr2.state()).toBe('pending');

			var firstXhr  = jasmine.Ajax.requests.at(0);
			firstXhr.response({
				status: 200
			,	responseText: '{"result":"ok"}'
			});

			expect(xhr1.state()).toEqual('resolved');
			expect(xhr2.state()).toBe('pending');

			var secondXhr  = jasmine.Ajax.requests.at(1);
			secondXhr.response({
				status: 200
			,	responseText: '{"result":"ok"}'
			});

			expect(xhr1.state()).toEqual('resolved');
			expect(xhr2.state()).toBe('resolved');
		});

		it('should cancel previous ajaxs if using killerId when navigating', function (done)
		{
			//Start a router so the AjaxRequestKiller event handler get executed
			new Fake_router();

			var my_collection1 = new Fake_collection()
			,	my_collection2 = new Fake_collection()
			,	xhr1
			,	xhr2;

			Backbone.history.start();

			Backbone.history.on('all', function ()
			{
				expect(xhr1.state()).toBe('rejected');

				Backbone.history.stop();
				Backbone.history.off()
				done();
			});

			xhr1 = my_collection1.fetch({ killerId: AjaxRequestsKiller.getKillerId() });

			expect(xhr1.state()).toBe('pending');

			location.hash = 'second-url';

		});

		it('should define a new killerId when navigating', function (done)
		{
			var first_killer_id = AjaxRequestsKiller.getKillerId()
			,	backbone_history_called = false;

			Backbone.history.start();

			Backbone.history.on('all', function ()
			{
				expect(AjaxRequestsKiller.getKillerId()).not.toEqual(first_killer_id);
				expect(AjaxRequestsKiller.getKillerId()).not.toBe(first_killer_id);

				Backbone.history.stop();
				Backbone.history.off()
				done();
			});

			location.hash = 'second-url';
		});

	});
});