/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'SC.BaseComponent'
	,	'SC.Configuration'
	,	'UnitTest.SC.BaseComponent.Assets'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'

	,	'Backbone.View'
	,	'Backbone.View.render'
	,	'Backbone.Model'
	,	'mock-ajax'
	,	'Application'
	]
,	function (
		SCBaseComponent
	,	Configuration
	,	UnitTestSCBaseComponentAssets

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	return describe('SC Base Component', function ()
	{
		var application
		,	child_component;

		beforeAll(function (done)
		{
			application = SC.Application('SCBaseComponentTestAssurance');
			application.Configuration = _.extend(application.Configuration, Configuration);

			//fake router to avoid navigating
			var fake_router = Backbone.Router.extend({
					routes: {
						'': 'fakeHandle'
					,	'?*params': 'fakeHandle'
					}
				,	fakeHandle: function()
					{
						var myView = Backbone.View.extend({
								template: function () {return 'Home Content';}
							})
						,	view = new myView({application:application});

						view.showContent();
					}
				})
			,	start_modules = [
					UnitTestSCBaseComponentAssets
				];

			Backbone.history.stop();
			Backbone.history.off();
			
			application.start(start_modules, function ()
			{
				new fake_router({});

				application.getLayout().template = _('<div id="content">layout</div>').template();
				application.getLayout().appendToDom();
				
				jasmine.Ajax.install();
				Backbone.history.start();
				done();
			});
		});


		beforeEach(function ()
		{
			jasmine.Ajax.install();

			// (General) Arrange
			child_component = application.getComponent('SC.BaseComponent.Test');

			Backbone.history.navigate('/', {trigger: true});
		});

		afterEach(function ()
		{
			// debugger;
			// jasmine.Ajax.install();
			jasmine.Ajax.uninstall();
			Backbone.history.navigate('/', {trigger: true});
			// Backbone.history.stop();
			// Backbone.history.off();
		});

		describe('extend method', function ()
		{
			it('should require a child component different to null with an application property and a componentName property set', function ()
			{
				//Arrange Act Assert
				expect(function () { return SCBaseComponent.extend(); }).toThrow();
				expect(function () { return SCBaseComponent.extend({}); }).toThrow();
				expect(function () { return SCBaseComponent.extend({componentName:'Test'}); }).toThrow();
				expect(function () { return SCBaseComponent.extend({application: application}); }).toThrow();
				expect(function () { return SCBaseComponent.extend({componentName:'Test', application: application}); }).not.toThrow();
			});

			it('should trigger the event "beforeShowContent" when the application triggers the event "beforeAppendView" and the current view is part of the current component', function ()
			{
				//Arrange
				var event_handlers = {
					beforeShowContent: function (){}
				};
				spyOn(event_handlers, 'beforeShowContent');
				child_component.on('beforeShowContent', event_handlers.beforeShowContent);
				
				//Act
				Backbone.history.navigate('#asset', {trigger: true});

				//Assert
				expect(event_handlers.beforeShowContent).toHaveBeenCalled();
			});

			it('should not trigger the event "beforeShowContent" when the application triggers the event "beforeAppendView" but the current view is not part of the current component', function ()
			{
				//Arrange
				var event_handlers = {
					notCalled: function () {}
				};
				spyOn(event_handlers, 'notCalled');
				child_component.on('beforeShowContent', event_handlers.notCalled);

				//Act
				Backbone.history.navigate('#notasset', {trigger: true});

				//Assert
				expect(event_handlers.notCalled).not.toHaveBeenCalled();

				child_component.off('beforeShowContent', event_handlers.notCalled);
			});

			it('should trigger a cancelable event "beforeShowContent"', function ()
			{
				//Arrange
				var event_handlers = {
						afterShowContent: function (){}
					}
				,	reject = function ()
					{
						return jQuery.Deferred().reject();
					};
				spyOn(event_handlers, 'afterShowContent');
				child_component.on('beforeShowContent', reject);

				//Act
				Backbone.history.navigate('#asset', {trigger: true});

				//Assert
				expect(event_handlers.afterShowContent).not.toHaveBeenCalled();

				child_component.off('beforeShowContent', reject);
			});

			it('should trigger the event "afterShowContent" when the application trigger the event "afterAppendView" and the current view is part of the current component', function ()
			{
				//Arrange
				var event_handlers = {
					afterShowContent: function (){}
				};
				spyOn(event_handlers, 'afterShowContent');
				child_component.on('afterShowContent', event_handlers.afterShowContent);

				//Act
				Backbone.history.navigate('#asset', {trigger: true});

				//Assert
				expect(event_handlers.afterShowContent).toHaveBeenCalled();

				child_component.off('afterShowContent', event_handlers.afterShowContent);
			});

			it('should not trigger the event "afterShowContent" when the application trigger the event "afterAppendView" and the current view is not part of the current component', function ()
			{
				//Arrange
				var event_handlers = {
					afterShowContent: function (){}
				};
				spyOn(event_handlers, 'afterShowContent');
				child_component.on('afterShowContent', event_handlers.afterShowContent);

				//Act
				Backbone.history.navigate('#notasset', {trigger: true});

				//Assert
				expect(event_handlers.afterShowContent).not.toHaveBeenCalled();

				child_component.off('afterShowContent', event_handlers.afterShowContent);
			});

			it('should trigger the event "afterShowContent" with an identifier of the current view', function ()
			{
				//Arrange
				var event_handlers = {
					afterShowContent: function (){}
				};
				spyOn(event_handlers, 'afterShowContent');
				child_component.on('afterShowContent', event_handlers.afterShowContent);

				//Act
				Backbone.history.navigate('#asset', {trigger: true});

				//Assert
				expect(event_handlers.afterShowContent).toHaveBeenCalledWith('CURRENT_VIEW');

				child_component.off('afterShowContent', event_handlers.afterShowContent);
			});

		});

		describe('addChildViews method', function ()
		{
			it('should throw an error if the specified view id is not valid', function ()
			{
				//Arrange Act Assert
				expect(function () { return child_component.addChildViews(); }).toThrow();
				expect(function () { return child_component.addChildViews('fake'); }).toThrow();
				expect(function () { return child_component.addChildViews('fake', 'selector'); }).toThrow();
				expect(function () { return child_component.addChildViews('fake', 'selector', 23); }).toThrow();
			});

			it('should throw an error if the specified view id is not part of the current component', function ()
			{
				// Arrange
				var view_constructor = function ()
					{
						return new Backbone.View({});
					};
				// Act Assert
				expect(function () { return child_component.addChildViews('NOTEXISTS', 'child.view', view_constructor); }).toThrow();
			});

			it('should add an extra child view in the specified placeholder', function ()
			{
				// Arrange
				var view_called = false
				,	view_constructor = function ()
					{
						view_called = true; //This variable is needed as this function cannot be wrapper
						var childView = Backbone.View.extend({
							template: function (){
								return '<div data-id="unique-value01">Injected content present in the DOM!</div>';
							}
						});
						return new childView({});
					};
				
				child_component.addChildViews(
					'UnitTest.SC.BaseComponent.Assets.AssetView'
				,	{
						'injectable-placeholder': 
						{
							'new_view':
							{
								childViewConstructor: view_constructor
							}
						}
					}
				);

				//Act
				Backbone.history.navigate('#asset', {trigger: true});

				//Assert
				expect(view_called).toBe(true);
				
				var evidence = jQuery('[data-id="unique-value01"]').text();
				expect(evidence).toEqual('Injected content present in the DOM!');

				child_component.removeChildView('UnitTest.SC.BaseComponent.Assets.AssetView', 'injectable-placeholder', 'new_view');
			});

			it('should replace the view if more than one view is specified for the same selector', function ()
			{
				// Arrange
				var view_constructor = function ()
					{
						var childView = Backbone.View.extend({
							template: function (){
								return '<div data-id="unique-value01">Injected content present in the DOM!</div>';
							}
						});
						return new childView({});
					}
				,	view_constructor2 = function ()
					{
						var childView = Backbone.View.extend({
							template: function (){
								return '<div data-id="unique-value01">Second Injected content present in the DOM!</div>';
							}
						});
						return new childView({});
					};

				// Act Assert
				child_component.addChildViews(
					'UnitTest.SC.BaseComponent.Assets.AssetView'
				,	{
						'injectable-placeholder': 
						{
							'new_view': 
							{
								childViewConstructor: view_constructor
							}
						}
					}
				);
				
				Backbone.history.navigate('#asset', {trigger: true});

				var evidence = jQuery('[data-id="unique-value01"]').text();
				expect(evidence).toEqual('Injected content present in the DOM!');
				
				child_component.addChildViews(
					'UnitTest.SC.BaseComponent.Assets.AssetView'
				,	{
						'injectable-placeholder': 
						{
							'new_view': 
							{
								childViewConstructor: view_constructor2
							}
						}
					}
				);
				
				Backbone.history.loadUrl('#asset');
				
				evidence = jQuery('[data-id="unique-value01"]').text();
				expect(evidence).toEqual('Second Injected content present in the DOM!');

				child_component.removeChildView('UnitTest.SC.BaseComponent.Assets.AssetView', 'injectable-placeholder', 'new_view');
			});
		});

		describe('addToViewContextDefinition method', function ()
		{
			it('should throw an error if the specified view id is not valid', function ()
			{
				//Arrange Act Assert
				expect(function () { return child_component.addToViewContextDefinition(); }).toThrow();
				expect(function () { return child_component.addToViewContextDefinition('fake'); }).toThrow();
				expect(function () { return child_component.addToViewContextDefinition('fake', 'propertyName'); }).toThrow();
				expect(function () { return child_component.addToViewContextDefinition('fake', 'propertyName', 2323); }).toThrow();
				expect(function () { return child_component.addToViewContextDefinition('fake', 'propertyName', 'fake'); }).toThrow();
				expect(function () { return child_component.addToViewContextDefinition('fake', 'propertyName', false, function (){}); }).toThrow();
			});

			it('should throw an error if the specified view id is not part of the current component', function ()
			{
				// Arrange
				var value_generator = function ()
					{
						return 'value';
					};
				// Act Assert
				expect(function () { return child_component.addToViewContextDefinition('NOTEXISTS', 'extraPropertyName', 'string', value_generator); }).toThrow();
			});

			it('should add an extra property into the context', function ()
			{
				// Arrange
				var value_generator = function ()
					{
						return 'CUSTOM_VALUE';
					};

				child_component.addToViewContextDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'extraProperty', 'string', value_generator);

				//Act
				Backbone.history.navigate('#asset', {trigger: true});

				// Assert
				var evidence = jQuery('[data-type="container"]').text();
				expect(evidence).toEqual('CUSTOM_VALUE');
				child_component.removeToViewContextDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'extraProperty');
			});

			it('should throw an error if the added an extra property into the context is duplicated', function ()
			{
				// Arrange
				var value_generator = function ()
					{
						return 'CUSTOM_VALUE';
					};

				child_component.addToViewContextDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'extraProperty', 'string', value_generator);

				//Act Assert
				expect(function () { return child_component.addToViewContextDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'extraProperty', 'string', value_generator); }).toThrow();

				child_component.removeToViewContextDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'extraProperty');
			});
		});

		describe('addToViewEventsDefinition method', function ()
		{
			it('should throw an error if the specified view id is not valid', function ()
			{
				//Arrange Act Assert
				expect(function () { return child_component.addToViewEventsDefinition(); }).toThrow();
				expect(function () { return child_component.addToViewEventsDefinition('fake'); }).toThrow();
				expect(function () { return child_component.addToViewEventsDefinition('fake', 'selector'); }).toThrow();
				expect(function () { return child_component.addToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'selector'); }).toThrow();
				expect(function () { return child_component.addToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'fake [data-action="test"]'); }).toThrow();
				expect(function () { return child_component.addToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'click [data-action="test"]'); }).toThrow();
			});

			it('should throw an error when trying to add an extra event handler into a view that is not part of the current component', function ()
			{
				// Arrange
				var event_handler = function () {};

				//Act Assert
				expect(function () {
					return child_component.addToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.NoAssetView', 'click [data-action="new-action"]', event_handler);
				}).toThrow();
			});

			it('should add an extra event handler into the specified view', function ()
			{
				// Arrange
				var event_handler = {
					fn: function (e) {
						e.preventDefault();
						e.stopPropagation();
					}
				};

				spyOn(event_handler, 'fn').and.callThrough();
				child_component.addToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'click [data-action="new-action"]', event_handler.fn);
				Backbone.history.navigate('#asset', {trigger: true});

				// Act
				jQuery('[data-action="new-action"]').click();

				// Assert
				expect(event_handler.fn).toHaveBeenCalled();

				child_component.removeToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'click [data-action="new-action"]');
			});

			it('should throw an error when trying to more than one extra event handler into the same view', function ()
			{
				// Arrange
				var event_handler = {
					fn: function () {}
				};
				child_component.addToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'click [data-action="new-action"]', event_handler.fn);

				// Act Assert
				expect(function () {
					return child_component.addToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'click [data-action="new-action"]', event_handler.fn);
				}).toThrow();

				child_component.removeToViewEventsDefinition('UnitTest.SC.BaseComponent.Assets.AssetView', 'click [data-action="new-action"]');
			});
		});
	});
});
