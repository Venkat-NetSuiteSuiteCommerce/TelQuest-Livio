/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Testing Singleton utility

window.SC = window.SC || {};

define(
	'UnitTest.Main', 
	[
		'Backbone'
	,	'Singleton'
	,	'jasmine2-typechecking-matchers'
	]
,	function (Backbone)
{

	'use strict';

	

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


});