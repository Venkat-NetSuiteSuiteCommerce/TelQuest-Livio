/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(['Merchandising.Context'], function ()
{
	'use strict';

	return describe('Merchandising.Context', function ()
	{
		var MerchandisingContext
		,	is_started = false
		,	application;

		beforeEach(function ()
		{
			is_started = false; 
			
			MerchandisingContext = require('Merchandising.Context'); 

			if (!is_started)
			{
				SC.templates={'layout_tmpl': '<div id="layout"><div id="content"></div></div>'};
				application = SC.Application('MerchandisingContext1');
				application.Configuration = {
					modules: ['Merchandising']
				}; 

				spyOn(jQuery.fn, 'merchandisingZone').andCallThrough();

				jQuery(application.start(function () { is_started = true; }));
				waitsFor(function() { return is_started; });
			}
		});

		it('Merchandising.Context class',  function()
		{

			// test Merchandizing.COntext constructor

			expect(_(MerchandisingContext).isFunction()).toBe(true); 

			SC.templates.Merchandising1Test2_tmpl = '<div>something</div>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'Merchandising1Test2';

			var context = new MerchandisingContext(view);

			expect(view.MerchandisingContext).toBe(context);
			expect(context.view).toBe(view);

			expect(_(MerchandisingContext.handlers).isArray()).toBe(true); 
			expect(MerchandisingContext.handlers.length).toBe(0); 

			var MyView = Backbone.View.extend({
				application: application
			}); 
			MyView.prototype.template = 'Merchandising1Test3';
			SC.templates.Merchandising1Test3_tmpl = '<div>something2</div>';

			// test the registerHandlers static method

			MerchandisingContext.registerHandlers(MyView, {
				method1: function()
				{
					return (typeof this.attr1 !== 'undefined' ? this.attr1 : '') + 'hello1'; 
				}
			});
			expect(MerchandisingContext.handlers[0].viewConstructor).toBe(MyView); 
			expect(MerchandisingContext.handlers[0].method1()).toBe('hello1'); 

			//test the getHandlerForView static method 

			expect(MerchandisingContext.getHandlerForView(view)).not.toBeDefined();
			var MyView2 = Backbone.View.extend({}); 
			expect(MerchandisingContext.getHandlerForView(new MyView2())).not.toBeDefined();
			var handler = MerchandisingContext.getHandlerForView(new MyView());
			expect(handler.viewConstructor).toBe(MyView); 
			expect(handler.method1()).toBe('hello1'); 

			// test the callHandler static method

			expect(MerchandisingContext.callHandler('notexistent', context)).not.toBeDefined();
			expect(MerchandisingContext.callHandler('method1', context)).not.toBeDefined();
			context.view = new MyView();
			expect(MerchandisingContext.callHandler('method1', context)).toBe('hello1');
			context.attr1 = 'foo ';
			expect(MerchandisingContext.callHandler('method1', context)).toBe('foo hello1');

			// test the callHandler instance method
			
			expect(context.callHandler('method1')).toBe('foo hello1');

			//test the removeHandler static method

			MerchandisingContext.removeHandler(function(){});
			expect(MerchandisingContext.handlers[0].viewConstructor).toBe(MyView); 

			MerchandisingContext.removeHandler(MyView); 
			expect(_(MerchandisingContext.handlers).isArray()).toBe(true); 
			expect(MerchandisingContext.handlers.length).toBe(0); 

			// test the escapeValue static method

			expect(MerchandisingContext.escapeValue('hello world')).toBe('hello-world'); 
			expect(MerchandisingContext.escapeValue('good bye cruel world')).toBe('good-bye-cruel-world'); 

		}); 
	});
});