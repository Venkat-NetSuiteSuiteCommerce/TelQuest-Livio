/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Testing ApplicationSkeleton
define(
	'UnitTest.ApplicationSkeleton.Module', 
	[
		'Application'
	,	'jasmine2-typechecking-matchers'
	]
,	function ()
{

	'use strict';

	describe('SC (Name Space)', function () {

		it('should be named SC and it should be an object', function ()
		{
			expect(SC).toBeAnObject();
		});

		it('should provide an application creation method called SC.Application', function ()
		{
			expect(SC.Application).toBeA(Function);
		});

		it('should provide a SC.Singleton class', function ()
		{
			expect(SC.Singleton).toBeAnObject();
		});
	});

	describe('SC.Application', function () {

		var application;

		beforeEach(function () {
			// Defines a Class
			application = SC.Application('Application');
		});

		it('should create an instance of ApplicationSkeleton', function ()
		{
			expect(application).toBeA(require('ApplicationSkeleton'));
		});

		it('should return the same instance for different calls with the same application name', function ()
		{
			application.prop = 1;
			var application2 = SC.Application('Application');

			expect(application2.prop).toEqual(application.prop);
		});

		it('should provide a configuration object', function ()
		{
			expect(application.getConfig()).toBeAnObject();
		});

		it('should provide a configuration object that is extendable', function ()
		{
			_.extend(application.Configuration, {
				prop: 1
			});

			expect(application.getConfig('prop')).toEqual(1);
		});

		it('should be an event emiter (on, trigger)', function ()
		{
			var cb = jasmine.createSpy();

			application.on('event', cb);
			application.trigger('event');

			expect(cb).toHaveBeenCalled();
		});

		it('should provide a getLayout method that returns the a layout object', function ()
		{
			expect(application.getLayout).toBeA(Function);
			expect(application.getLayout()).toBeAnObject();
			expect(application.getLayout()).toBeA(application.Layout);
		});

		it('should provide a configuration value, if the attribute is not present in the configuration file should be undefined', function ()
		{
			expect(application.getConfig('no-attr')).not.toBeDefined(); 
		});
		it('should provide a configuration value, if the attribute is not present in the configuration file return default option', function ()
		{
			expect(application.getConfig('no-attr','default-option')).toEqual('default-option');
		});

		it('configuration should support nested object easy access', function ()
		{
			_.extend(application.Configuration, {
				foo: {bar: {goo: 3.14}}
			});

			expect(application.getConfig('foo.bar.goo')).toEqual(3.14);
		});

	});



	describe('SC.Application.getLayout', function ()
	{
		var application;

		beforeEach(function () 
		{
			// Defines a Class
			application = SC.Application('Application');
		});

		it('should provide an appendToDom method', function ()
		{
			expect(application.getLayout().appendToDom).toBeA(Function);
		});

		it('should provide an showContent method', function ()
		{
			expect(application.getLayout().showContent).toBeA(Function);
		});

		it('should provide an showInModal method', function ()
		{
			expect(application.getLayout().showInModal).toBeA(Function);
		});

		it('should provide an showError method', function ()
		{
			expect(application.getLayout().showError).toBeA(Function);
		});

	});

	describe('SC.Application().start', function () 
	{

		var application
		,	callback = {
				beforeStartIsCalled: false
			,	afterStartIsCalled: false
			,	afterModulesLoadedIsCalled: false
			,	beforeStart : function(){ callback.beforeStartIsCalled = true; }
			,	afterStart : function(){ callback.afterStartIsCalled = true; }
			,	afterModulesLoaded : function(){ callback.afterModulesLoadedIsCalled = true; }
		};
		beforeEach(function (done) 
		{
			// Create sapplication

			define('Dummy', function()
			{
				return {
					mountToApp: function () 
					{
						var Router = Backbone.Router.extend({
							routes: {
								dummytest: function () {}
							}
						});
						return new Router();
					}
				};
			});

			application = SC.Application('ApplicationTestStart');

			application.Configuration = {
				siteSettings:{
					imagesizes:[
						{name:'small',urlsuffix:'_small'}
					,	{name:'big',urlsuffix:'_big'}
					]
				}
			};

			application.on('beforeStart', callback.beforeStart);
			application.on('afterStart', callback.afterStart);
			application.on('afterModulesLoaded', callback.afterModulesLoaded);

			jQuery(application.start(['Dummy'], function()
			{
				setTimeout(function(){ done(); }, 10); //make some time so afterstarts triggers
			}));
		});

		it('it should fire a "beforeStart" event', function ()
		{
			expect(callback.beforeStartIsCalled).toBe(true);
		});

		it('it should fire a "afterStart" event', function ()
		{
			expect(callback.afterStartIsCalled).toBe(true);
		});

		it('it should fire a "afterModulesLoaded" event', function ()
		{
			expect(callback.afterModulesLoadedIsCalled).toBe(true);
		});

		it('it should resize images correctly',function(){
			expect(application.resizeImage('images/img.jpg','small')).toBe('images/img.jpg?_small');
			expect(application.resizeImage('images/img.jpg','big')).toBe('images/img.jpg?_big');
			expect(application.resizeImage('images/img.jpg','non-existent')).toBe('images/img.jpg');
			expect(application.resizeImage('images/?url=img.jpg','small')).toBe('images/?url=img.jpg&_small');
		});
	});

});