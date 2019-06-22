/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module UnitTestHelper
*/
define('UnitTestHelper'
,	[
		'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'SC.Configuration'
	,	'Application'
	,	'jasmine2-typechecking-matchers'
	,	'Backbone.View'
	,	'Backbone.View.render'
	,	'Backbone.Model'
	,	'Backbone.View.Plugins'
	,	'Utils'
	],
function (
		_
	,	jQuery
	,	Backbone
	,	Configuration
	)
{
	'use strict';

	return (function ()
	{
		/*

		@class UnitTestHelper 
		Contains utilities for testing backbone models/validation, views/selectors/values, backbone routes amd general testing utilities
		
		In general you imput some data and some expectations in the form of strings/functions - this tool will automatically, for example, create the view with given model data, 
		render the view and assert over the output.

		@constructor @param {UnitTestHelperConfig} options 

		@class UnitTestHelperConfig
		@property {String} applicationName name of the application to be used. Default: testApplication + random number between 0 and 100
		@property {SC.Configuration} applicationConfiguration - configuration of the application, default value: {}
		@property {Boolean | Function} startApplication - option to start the application, if the option is a function, this function is used as callback when the application is started
		@property {Array<Class>} mountModules List of modules that should be loaded when application start.
		@property {Object} environment defines the object SC.ENVIRONMENT used for the tests, default value {}

		*/
		var TestHelper = function (options)
		{
			var self = this;
			this.is_started = false;
			this.layout;
			this.initialization_completed = false;
			this.options = options || {};

			SC.ENVIRONMENT = SC.ENVIRONMENT || {};

			if (SC.ENVIRONMENT)
			{
				SC.ENVIRONMENT = _.extend(SC.ENVIRONMENT, this.options.environment ? this.options.environment : {});
			}

			SC.ENVIRONMENT.siteSettings = SC.ENVIRONMENT.siteSettings || {};

			// add the baseUrl value if not defined, this value is used by Utils.js
			SC.ENVIRONMENT.baseUrl = SC.ENVIRONMENT.baseUrl ? SC.ENVIRONMENT.baseUrl : '/test/app/{{file}}';

			// create the application - if no name, using a random value.
			this.application = SC.Application(this.options.applicationName || 'testApplication' + '-' + _.random(0, 100));

			_(Configuration).extend(this.options.applicationConfiguration || {});
			if (!Configuration.siteSettings)
			{
				Configuration.siteSettings = SC.ENVIRONMENT.siteSettings;
			}

			this.application.Configuration = Configuration;
			
			if (this.options.startApplication)
			{
				var modules = this.options.mountModules && _.isArray(this.options.mountModules) ? this.options.mountModules : [];
				jQuery(this.application.start(modules, function()
				{
					self.application.getLayout().template = self.application.getLayout().template || _.template('<div id="layout"><div id="content"></div></div>');

					self.application.getLayout().appendToDom();

					// callback function.
					if (_.isFunction(self.options.startApplication))
					{
						self.options.startApplication(self.application);
					}
					self.is_started = true;
				}));

				describe('Unit Test Helper', function()
				{
					it('Starting application..', function(cb)
					{
						if (self.is_started)
						{
							expect(self.is_started).toBe(true);
							cb();
						}
					});
				});

			}
			else
			{
				this.is_started = true;
			}
		};

		/*
		@method testViewSelectors Example

			var view = new MyView(...);

			var data = [{name:'foo', age:1},...]; 
			var asserts = [
					{actual: function (view){ return view.getSome() == 2.3; }, operation:'toBeTruthy'}
				,	{selector:'input[name="name"]', attribute:'val', operation:'toBe', result: data.fullname}
				,	{selector:'input[name="company"]', attribute:'val', operation:'toBe', result: data.company}
			]; 

			view.render();
			helper.testViewSelectors(view, asserts, data, test_description);


		@param {Backbone.View} view
		@param {Array<UnitTestHelperViewAssert>} asserts

		*/
		TestHelper.prototype.testViewSelectors = function (view, asserts, data, test_description)
		{
			describe(test_description || ('Model ID: ' +  (data.internalid || data.id)), function()
			{

				_.each(asserts, function(assert)
				{
					if (!assert)
					{
						return;
					}

					var attribute
					,	actual;

					if (_.isFunction(assert.actual))
					{
						actual =  assert.actual(view);
					}
					else
					{
						attribute = assert.attribute || 'text';

						if (attribute === 'checked')
						{
							actual = view.$(assert.selector).prop('checked');
						}
						else if (attribute === 'disabled')
						{
							actual = view.$(assert.selector).prop('disabled');
						}
						else if (attribute === 'href')
						{
							actual = view.$(assert.selector).attr('href');
						}						
						else if (attribute.indexOf('data-') === 0)
						{
							actual = view.$(assert.selector).attr(attribute);
						}
						else
						{
							actual = view.$(assert.selector)[attribute]();
						}
					}

					var	result = _.isFunction(assert.result) ? assert.result(data) : assert.result
					,	is_not = (assert.operation && assert.operation.indexOf('not.') === 0)
					,	operation = (assert.operation && assert.operation.replace('not.', '')) || 'toBe'
					,	description = (_.isFunction(assert.actual) ? assert.actual.toString() : ('$(\'' + assert.selector + '\').' + attribute + '()') );

					description += (is_not ? ' not ' : ' ');
					description += operation + ' ';
					description += _.isFunction(assert.result) ? assert.result.toString() : (assert.hasOwnProperty('result') ? (assert.result === '' ? '\'\'' : assert.result) : '');

					if (attribute === 'text' || attribute === 'html')
					{
						result = result ? (result + '') : result;
					}

					it(description, function()
					{
						var exp = is_not ? expect(actual).not : expect(actual);
						exp[operation](result);
					});

				});
			});
		};

		/*
		@method testRoute
		@param {Backbone.Router} Router
		@param {navigateTo:String, instanceName:String, instanceOf:Class} test
		@param {Object} router_options
		*/
		TestHelper.prototype.testRoute = function (Router, test, router_options)
		{
			new Router(this.application, router_options || {});
			var self = this;

			try
			{
				Backbone.history.start();
			}
			catch (e)
			{
				console.warn('Backbone.history has already been started');
			}

			it('when navigate to ' + test.navigateTo + ' the currentView must be ' + test.instanceName, function()
			{
				Backbone.history.navigate(test.navigateTo, {trigger: true});
				expect(self.application.getLayout().currentView instanceof test.instanceOf).toBe(true);
			});

			Backbone.history.stop();

		};

		/*
		@method testModelValidations test that given Backbone.Model validation works as expected
		@param {Backbone.Model} model
		@param test @param {String} test_description
		*/
		TestHelper.prototype.testModelValidations = function (model, test, test_description)
		{
			var result = test.result;

			describe(test_description || ('Model ID: ' +  (model.internalid || model.id || model.get('id') || model.get('internalid'))), function()
			{

				model = _.extend(model, Backbone.Validation.mixin);

				_.each(result.invalidFields, function(invalidField)
				{
					it('the field ' + invalidField + ' should be invalid', function()
					{
						expect(model.isValid(invalidField)).toBe(false);

					});
				});

				_.each(result.validFields, function(validField)
				{
					it('the field ' + validField + ' should be valid', function()
					{
						expect(model.isValid(validField)).toBe(true);

					});
				});


			});
		};

		/*
		@method testContext test given Backbone.View context object
		@param {Bakcbone.View} view  @param {Object<String,Object>} tests
		*/
		TestHelper.prototype.testContext = function (view, tests)
		{
			it('view.getContext to be defined', function ()
			{
				expect(view.getContext).toBeDefined();
			});

			it('view.getContext to be a Function', function ()
			{
				expect(view.getContext).toBeA(Function);
			});

			it('view.getContext() to be an Object', function ()
			{
				expect(view.getContext()).toBeAnObject();
			});

			var context = view.getContext ? view.getContext() : {};

			_.each(context, function (value, key)
			{

				var type = tests[key];

				if (!type)
				{
					return it('missing test for ' + key, function()
					{
						expect(undefined).toBeDefined();
					});
				}

				if (_.isFunction(type))
				{
					if (type === Boolean)
					{
						it(key + ' is a Boolean', function()
						{
							expect(_.isBoolean(value)).toBe(true);
						});
					}
					else if (type === String)
					{
						it(key + ' is a String', function()
						{
							expect(_.isString(value)).toBe(true);
						});
					}
					else if (type === Number)
					{
						it(key + ' is a Number', function()
						{
							expect(_.isNumber(value)).toBe(true);
						});
					}
					else
					{
						it(key + ' type is correct', function()
						{
							expect(value instanceof type).toBe(true);
						});
					}
				}
				else
				{
					it(key + ' is type of ' + type, function()
					{
						expect(typeof value === type.toLowerCase()).toBe(true);
					});
				}

				delete tests[key];
			});

			_.each(tests, function (value, key)
			{
				it('context.' +  key + ' is undefined', function(){
					expect(undefined).toBeDefined();
				});
			});

		};

		return TestHelper;
	})();

});
