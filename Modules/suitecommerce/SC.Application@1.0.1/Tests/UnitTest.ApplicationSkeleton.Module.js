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
	'UnitTest.ApplicationSkeleton.Module', 
	[
		'Application'
	,	'Singleton'
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

	describe('SC.Singleton', function () {

		var test_class;

		beforeEach(function () {
			// Defines a Class
			test_class = function TestClass() { };
			// Extends it with the Singleton
			_.extend(test_class, SC.Singleton);
		});

		it('should provide getInstance method', function ()
		{
			expect(SC.Singleton.getInstance).toBeA(Function);
		});

		it('should be extendable by other Classes using _.extend(Class, SC.Singleton)', function ()
		{
			expect(test_class.getInstance).toBeA(Function);
		});


		it('should be extendable by a Backbone View by Calling Backbone.View.extend({}, SC.Singleton)', function ()
		{
			var view = Backbone.View.extend({}, SC.Singleton);
			expect(view.getInstance).toBeA(Function);
		});

		it('should be extendable by a Backbone Model by Calling Backbone.Model.extend({}, SC.Singleton)', function ()
		{
			var model = Backbone.Model.extend({}, SC.Singleton);
			expect(model.getInstance).toBeA(Function);
		});

		it('should be extendable by a Backbone Collection by Calling Backbone.Collection.extend({}, SC.Singleton)', function ()
		{
			var collection = Backbone.Collection.extend({}, SC.Singleton);
			expect(collection.getInstance).toBeA(Function);
		});

		it('should be extendable by a Backbone Router by Calling Backbone.Router.extend({}, SC.Singleton)', function ()
		{
			var router = Backbone.Router.extend({}, SC.Singleton);
			expect(router.getInstance).toBeA(Function);
		});
	});

	describe('SC.Singleton.getInstance', function () {

		var TestClass;

		beforeEach(function () {
			// Defines a Class
			TestClass = function TestClass() { };
			// Extends it with the Singleton
			_.extend(TestClass, SC.Singleton);
		});

		it('should return an instance from the extended class (Class.getInstance)', function ()
		{
			expect(TestClass.getInstance()).toBeA(TestClass);
		});

		it('should return allways the same instance (Class.getInstance() === Class.getInstance())', function ()
		{
			expect(TestClass.getInstance()).toBe(TestClass.getInstance());
		});

		it('should return allways the same instance (Class.getInstance().prop === Class.getInstance().prop)', function ()
		{
			var test1 = TestClass.getInstance(),
				test2 = TestClass.getInstance();

			test1.prop = 1;

			expect(test2.prop).toBe(1);
		});

		it('should return a different instance than new Class (Class.getInstance().prop !== new Class().prop)', function ()
		{
			var test1 = TestClass.getInstance(),
				test2 = new TestClass();

			expect(test1).not.toBe(test2);
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