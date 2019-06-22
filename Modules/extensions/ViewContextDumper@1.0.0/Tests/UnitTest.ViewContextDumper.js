define(
	[
		'UnitTestHelper'
	,	'UnitTest.NavigationHelper.Preconditions'
	,	'ViewContextDumper'
	,	'Backbone.CollectionView'
	,	'Wizard.Router'
	,	'Wizard.Module'
	,	'UnitTestHelper.Preconditions'
	,	'Profile.Model'
	,	'Backbone'
	,	'underscore'
	,	'mock-ajax'
	]
,	function(
		UnitTestHelper
	,	NHPreconditions
	,	ViewContextDumper
	,	CollectionView
	,	WizardRouter
	,	WizardModule
	,	Preconditions
	,	ProfileModel
	,	Backbone
	,	_
	)
	{

	var application

	describe('hits should collect information about current view', function()
	{

		beforeEach(function(done)
		{
			NHPreconditions.setPreconditions()
			helper = new UnitTestHelper({
				applicationName: 'ViewContextDumperApp'
			,	loadTemplates: true
			,	mountModules: [ViewContextDumper]
			,	startApplication: function(app)
				{
					jasmine.Ajax.install()
					application = app
					done()
				}
			})
		})

		afterEach(function() 
		{
			jasmine.Ajax.uninstall()
		})

		it('Should dump contracts of a view 1 on showContent', function(done)
		{
			var view1 = new View1({
				application: application
			})

			expect(application.getLayout().$('.c1').text()).toBeFalsy()
			expect(jasmine.Ajax.requests.count()).toBe(0)
			application.getLayout().showContent(view1).then(function()
			{
				expect(application.getLayout().$('.c1').text()).toBe('Hello world')
				var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
				expect(data.layoutContract.currentViewContract.eventSelectors[0]).toBe('click [data-action="clickme"]')
				expect(data.layoutContract.currentViewContract.bindingSelectors[0]).toBe('[name="fullname"]')
				expect(_.isArray(data.layoutContract.currentViewContract.context.property1)).toBe(true)
				expect(data.layoutContract.currentViewContract.childViewsContract.View2.View2.eventSelectors[0]).toBe('hover [data-action="clickme2"]')
				done()
			})
		})

		it('Should dump contracts of a view 1 on showInModal', function(done)
		{
			var view1 = new View1({
				application: application
			})

			expect(jasmine.Ajax.requests.count()).toBe(0)
			application.getLayout().showInModal(view1).then(function()
			{
				var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
				expect(_.contains(data.layoutContract.currentModalView.childViewsContract['Child.View']['Child.View'].eventSelectors, 'click [data-action="clickme"]')).toBe(true)
				// console.log(data)
				done()
			})
		})

		it('Should dump composite with multiple children views in the same placeholder', function(done)
		{
			var anotherView1 = new AnotherView({
				application: application
			})

			application.getLayout().showContent(anotherView1).then(function()
			{
				var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
				expect(data.layoutContract.currentViewContract.childViewsContract.Placeholder1.Placeholder1_1.context.message).toBe('message 1')
				expect(data.layoutContract.currentViewContract.childViewsContract.Placeholder1.Placeholder1_2.context.message).toBe('message 2')
				expect(data.layoutContract.currentViewContract.context.property3).toBe('string')
				done()
			})
		})

		it('Should dump CollectionView properly', function(done)
		{
			var View3 = Backbone.View.extend({
				childViews: {
					MyCollectionView1: function()
					{
						var col = new Backbone.Collection()
						var model1 = new Backbone.Model({name: 'seba'})
						,	model2 = new Backbone.Model({name: 'laura'})
						,	model3 = new Backbone.Model({name: 'andres'})
						col.reset([model1, model2, model3])

						var PersonView = Backbone.View.extend({
							template: _.template('<p>hello <%= this.model.get("name") %> ! </p>')
						,	getContext: function()
							{
								return {
									foo: 1234
								}
							}
						,	events: {
								'click [data-action="hitme"]': 'hitme'
							}
						})
						return new CollectionView({
							application: application
						,	childView: PersonView
						,	collection: col
						})
					}
				}
			,	template: _.template('<div data-view="MyCollectionView1"></div>')
			})

			var view3 = new View3({
				application: application
			})

			application.getLayout().showContent(view3).then(function()
			{
				var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
				var MyCollectionView1Data = data.layoutContract.currentViewContract.childViewsContract.MyCollectionView1.MyCollectionView1
				
				expect(MyCollectionView1Data.childCell[0].eventSelectors[0]).toBe('click [data-action="hitme"]')
				expect(MyCollectionView1Data.childCell[0].context.foo).toBe(1234)
				done()
			})
		})

	})


	var View1 = Backbone.View.extend({
		events: {
			'click [data-action="clickme"]': 'handler1'
		}
	,	bindings: {
			'[name="fullname"]': 'fullname'
		}
	,	getContext: function()
		{
			return {
				property1: [1,2,3]
			}
		}
	,	childViews: {
			View2: function()
			{
				return new View2({
					application: application
				})
			}
		}
	,	template: _.template('<p class="c1">Hello world</p><div data-view="View2"></div>')
	})

	var View2 = Backbone.View.extend({
		template: _.template('<p class="c2">bazinga!</p>')
	,	events: {
			'hover [data-action="clickme2"]': 'handler2'
		}
	,	getContext: function()
		{
			model: new Backbone.Model({prop: {childProp: [1,2,3]}})
		}
	})

	var AnotherView = Backbone.View.extend({
		template: _.template('<p>hello there</p><div data-view="Placeholder1"></div>')
	,	childViews: {
			'Placeholder1' : {
				'Placeholder1_1': {
					childViewIndex: 5
				,	childViewConstructor: function()
					{
						var anotherChildView1 = new AnotherChildView({
							application: application
						})
						anotherChildView1.message = 'message 1'
						return anotherChildView1
					}
				}
			,	'Placeholder1_2': {
					childViewIndex: 4
				,	childViewConstructor: function()
					{
						var anotherChildView2 = new AnotherChildView({
							application: application
						})
						anotherChildView2.message = 'message 2'
						return anotherChildView2;
					}
				}
			}
		}
	,	getContext: function()
		{
			return {
				property3: 'string'
			}
		}
	})

	var AnotherChildView = Backbone.View.extend({
		template: _.template('<p>message: <%= message%></p>')
	,	getContext: function()
		{
			return {
				message: this.message
			}
		}
	})









	// wizards !!
	// TODO: split the following into the separate file UnitTest.ViewContextDumper.Wizard


	describe('dumper and wizards', function()
	{
		var wizard, steps1

		beforeEach(function(done)
		{
			var Module1 = WizardModule.extend({
				template: _.template('<p>first wizard module</p>')
			,	getContext: function()
				{
					return {
						name: 'module 1'
					}
				}
			})
			var Module2 = WizardModule.extend({
				template: _.template('<p>second wizard module</p>')
			,	getContext: function()
				{
					return {
						name: 'module 2'
					}
				}
			})
			var Module3 = WizardModule.extend({
				template: _.template('<p>third wizard module</p>')
			,	getContext: function()
				{
					return {
						name: 'module 3'
					}
				}
			})
			var Module4 = WizardModule.extend({
				template: _.template('<p>4th wizard module</p>')
			,	initialize: function()
				{
					this.modules = [
						{
							classModule: Module41
						,	name: _('Credit / Debit Card').translate()
						,	type: 'creditcard'
						}
					];
					_.each(this.modules, function(module)
					{
						var ModuleClass = module.classModule;
						module.instance = new ModuleClass({
							wizard: self.wizard
						,	step: self.step
						,	stepGroup: self.stepGroup
						});

						module.instance.on('ready', function (is_ready)
						{
							self.moduleReady(is_ready);
						});
					});
				}
			,	render: function()
				{
					this._render()
					_.each(this.modules, function(m){m.instance.render()})
				}
			,	getContext: function()
				{
					return {
						name: 'module 4'
					}
				}
			})
			var Module41 = WizardModule.extend({
				template: _.template('<p>third wizard module</p>')
			,	events: {
					'click .button': 'click'
				}
			,	initialize: function(options)
				{
					this.wizard = options.wizard
					this.step = options.step
					this.stepGroup = options.stepGroup	
				}
			,	getContext: function()
				{
					return {
						name: 'module 41'
					}
				}
			})

			steps1 = [
				{
					name: 'Step 1'
				,	steps: [
						{
							name: 'Step1'
						,	url: 'step/1'
						,	showStep: function () {return true;}
						,	modules: [
								Module1
							]
						,	continueButtonLabel: 'cusotm continue buttom label'
						}
					,	{
							name: 'Step 1.1'
						,	url: 'step/1/1'
						,	showStep: function () {return true;}
						,	modules: [
								Module2
							]
						}
					]
				}
			,	{
					name: 'Step 2'
				,	steps: [
						{
							name: 'Step 2'
						,	url: 'step/2'
						,	showStep: function () {return true;}
						,	modules: [
								Module3, Module4
							]
						}
					]
				}
			]

			window.SC = Preconditions.deepExtend(window.SC || {}, {
				ENVIRONMENT: {
					siteSettings: {
						registration: {
							displaycompanyfield: 'T'
						}
					,	countries: {
							UY: {
								isziprequired: 'T'
							}
						}
					}
				,	currentLanguage : {
						locale: 'en_US'
					}
				,	availableHosts: []
				,	availableLanguages: []
				,	availableCurrencies: []
				,	PROFILE: {
						isLoggedIn : 'T'
					}
				,	getSessionInfo: function(key)
					{
						'use strict';
						var session = SC.SESSION || SC.DEFAULT_SESSION || {};
						return (key) ? session[key] : session;
					}
				}
			}); 

			try {Backbone.history.stop();}catch(ex){}

			window.location.hash=''
			application = SC.Application('DumperAndWizards1');
			application.start([ViewContextDumper], function () 
			{
				jasmine.Ajax.install()
				if (SC.ENVIRONMENT.PROFILE)
				{
					ProfileModel.getInstance().set(SC.ENVIRONMENT.PROFILE);
				}
				wizard = new WizardRouter(application, {steps: steps1});
				application.getLayout().template = _('<div id="content">layout</div>').template();
				application.getLayout().appendToDom();

				Backbone.history.start();
				done();
			});
		})

		afterEach(function() 
		{
			jasmine.Ajax.uninstall()
			try {Backbone.history.stop();}catch(ex){}
		})

		it('should work with wizards 1', function(done)
		{
			Backbone.history.navigate(wizard.stepsOrder[0], {trigger: true});
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[0]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1/1'].state).toBe('future');
			var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
			var wizardContract = data.layoutContract.currentViewContract
			expect(wizardContract.currentStep.modules[0].context.name).toBe('module 1')

			expect(wizardContract.currentStep.context.continueButtonLabel).toBe('cusotm continue buttom label')

			done()
		})

		it('should work with wizards 2', function(done)
		{
			Backbone.history.navigate(wizard.stepsOrder[1], {trigger: true});
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[1]]);
			var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
			var wizardContract = data.layoutContract.currentViewContract
			expect(wizardContract.currentStep.modules[0].context.name).toBe('module 2')
			done()
		})

		it('should work with wizards containing modules inside modules', function(done)
		{
			Backbone.history.navigate(wizard.stepsOrder[2], {trigger: true});
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[2]]);
			var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
			var wizardContract = data.layoutContract.currentViewContract
			expect(wizardContract.currentStep.modules[0].context.name).toBe('module 3')
			expect(wizardContract.currentStep.modules[1].context.name).toBe('module 4')

			var submoduleData = wizardContract.currentStep.modules[1].modules[0]
			expect(submoduleData.context.name).toBe('module 41')
			expect(submoduleData.eventSelectors[0]).toBe('click .button')
			done()
		})
	})
		








	// Handlebars helpers 
	// TODO: put the following in a separate .js file

	describe('dumper and handlebars helpers', function()
	{
		beforeEach(function(done)
		{
			jasmine.Ajax.install()
			helper = new UnitTestHelper({
				applicationName: 'dumperandhdlbrshelpers'
			,	loadTemplates: true
			,	mountModules: [ViewContextDumper]
			,	startApplication: function(app)
				{
					jasmine.Ajax.install()
					application = app
					done()
				}
			})
		})

		afterEach(function()
		{
			jasmine.Ajax.uninstall()
		})

		it('should post information regarding handlebar helpers once application starts', function(done)
		{
			// is the first request becase we didn't show any view so dumper don't post
			var data = JSON.parse(jasmine.Ajax.requests.at(0).params)
			data = JSON.parse(data) // should be json string

			expect(data.translate).toBe('hello my precious')
			expect(data.formatCurrency && _.isString(data.formatCurrency)).toBe(true)
			expect(data.each1).toBe('123')
			expect(data.each2).toBe('123')
			expect(data.each3).toBe('123')
			expect(data.highlightKeyword).toBe('hello <strong>world</strong>')
			// expect(data.objectToAtrributes).toBe('hello <strong>world</strong>2')
			done()
		})
	})

});