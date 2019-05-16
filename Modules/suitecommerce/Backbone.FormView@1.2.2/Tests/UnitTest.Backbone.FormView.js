/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'Backbone'
	,	'underscore'
	,	'UnitTestHelper.Preconditions'
	,	'Backbone.FormView'
	,	'jasmine2-typechecking-matchers'
	]
,	function (
		Backbone
	,	_
	,	Preconditions
	,	BackboneFormView
	)
{
	'use strict';

	describe('views have the "bindings" property to define binding between form inputs and model attributes', function()
	{
		var view1
		,	EditAddressForm = Backbone.View.extend({
			template: function()
			{
				return '<form><input name="name"></input><input name="country"></input></form>'; 
			}
		,	bindings: {
				'[name="name"]': 'name'
			,	'[name="country"]': 'country'			
			,	'[name="phone"]': {
					observe: 'phoneNumber'
				,	events: ['keyup']
				}
			}
		,	initialize: function(options)
			{
				this.model = options.model; 
				BackboneFormView.add(this); 
			}
		}); 

		beforeEach(function()
		{
			Preconditions.setDefaultEnvironment();
			var model1 = new Backbone.Model({name: 'Sebastián', country: 'Uruguay'});
			view1 = new EditAddressForm({model: model1}); 
		});

		it('string->string mapping syntax shortcut', function()
		{			
			expect(view1.bindings['[name="name"]'].observe).toBe('name'); 
			expect(view1.bindings['[name="name"]'].events).toContain('blur'); 
			expect(view1.bindings['[name="name"]'].setOptions.validate).toBe(true); 

			expect(view1.bindings['[name="country"]'].observe).toBe('country'); 
			expect(view1.bindings['[name="country"]'].events).toContain('blur'); 
			expect(view1.bindings['[name="country"]'].setOptions.validate).toBe(true); 

			expect(view1.bindings['[name="phone"]'].observe).toBe('phoneNumber'); 
			// expect(view1.bindings['[name="phone"]'].events).toContain('blur'); 
			expect(view1.bindings['[name="phone"]'].events).toContain('keyup'); 
			expect(view1.bindings['[name="phone"]'].setOptions.validate).toBe(true); 
		}); 

		it('add sss saveForm method that serializes the model and save() it', function()
		{
			expect(view1.saveForm).toBeA(Function); 
			//TODO 
		})

	});


});