/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ApplicationSkeleton.js
// --------------------
// Testing Core
define([
		'Backbone'
	,	'Application'
	,	'Backbone.View'
	,	'jasmine2-typechecking-matchers'
	], function (
		Backbone
	)
{
	'use strict';

	var application
	,	layout;

	describe('Application.Layout', function ()
	{
		it('Init', function (done) //don't want this to be a beforeEach
		{
			SC.macros = {
				header:function(){
					return '<div id="header-updated"></div>';
				}
			,	footer:function(){
					return '<div id="footer-updated"></div>';
				}
			};

			jQuery('<div id="main"></div>').appendTo('body');

			application = SC.Application('Application.Layout.test1');
			layout = application.getLayout();
			layout.template=_.template('<div id="layout"><div class="site-header">Header</div>Test<div id="content">Test</div><div class="site-footer">Footer</div></div>');
			application.Configuration = {
				siteSettings:{
					sitetype: 'ADVANCED'
				}
			};

			jQuery(application.start([], function () 
			{
				expect(layout instanceof Backbone.View).toBe(true);
				done();
			}));

		});

		it('should trigger beforeAppendToDom and afterAppendToDom', function ()
		{
			var listeners_output = [];

			layout.on('beforeAppendToDom', function(view)
			{
				listeners_output.push({label: 'beforeAppendToDom', parentSize: this.$el.parents('body').size(), respectContract: this instanceof Backbone.View && view instanceof Backbone.View});

			});

			layout.on('afterAppendToDom', function(view)
			{
				listeners_output.push({label: 'afterAppendToDom', parentSize: this.$el.parents('body').size(), respectContract: this instanceof Backbone.View && view instanceof Backbone.View});
			});

			layout.appendToDom();
			//Simulate a view being showed
			layout.trigger('afterAppendView');

			expect(listeners_output).toEqual([ {label:'beforeAppendToDom', parentSize: 0, respectContract: true}, {label:'afterAppendToDom', parentSize: 1, respectContract: true} ]);
		});

		it('should trigger beforeAppendView, beforeRender, afterAppendView and afterRender events', function ()
		{
			var view = new Backbone.View({
				application: application
			});
			view.template = _('<p>Hello World!</p>').template();

			var listeners_output = [];

			layout.on('beforeRender', function(aView)
			{
				listeners_output.push({label: 'beforeRender', respectContract: aView === layout});
			});

			layout.on('afterRender', function(aView)
			{
				listeners_output.push({label: 'afterRender', respectContract: aView === layout});
			});

			layout.on('beforeAppendView', function(aView)
			{
				listeners_output.push({label: 'beforeAppendView', respectContract: aView === view});
			});

			layout.on('afterAppendView', function(aView)
			{
				listeners_output.push({label: 'afterAppendView', respectContract: aView === view});
			});

			view.showContent();

			//afterRender is triggered twice because layout.updateUI is called on render.
			var expected = [{label:'beforeRender',respectContract:true},
				{label:'afterRender',respectContract:true},{label:'beforeAppendView',respectContract:true},{label:'afterAppendView',respectContract:true}];

			expect(listeners_output).toEqual(expected);
		});

		it('it should return the application', function()
		{
			expect(layout.getApplication()).toBe(application);
		});

	});

});