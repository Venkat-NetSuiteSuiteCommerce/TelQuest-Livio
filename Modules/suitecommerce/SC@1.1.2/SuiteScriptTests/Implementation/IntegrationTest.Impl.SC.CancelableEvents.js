/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('IntegrationTest.Impl.SC.CancelableEvents',
	[
		'Application'
	,	'Events'
	,	'SC.CancelableEvents'
	,	'SC.Model'
	,	'preconditions'
	,	'jQuery.Deferred'
	,	'underscore'
	]
,	function (
		Application
	,	Events
	,	CancelableEvents
	,	SCModel
	,	preconditions
	,	jQuery
	,	_
	)
{
	'use strict';

	return describe('IntegrationTest.Impl.SC.CancelableEvents', function ()
	{
		var myEvents
		,	my_model;

		beforeEach(function ()
		{
			myEvents = _.extend({}, CancelableEvents);
			
			my_model = SCModel.extend({
				name: 'TestModel'
			,	testMethod: function(){

					return this._testMethod();
				}
			,	_testMethod: function()
				{
					return 'internal logic executed';
				}
			});

			Application.off('before:TestModel.testMethod');
		});

		describe('cancelableOn method', function ()
		{
			
			it('should increment the list of event handlers whena new handler listens for an event', function ()
			{
				//Arrange
				var myHandler = function () {return 123;};

				//Act
				myEvents.cancelableOn('someEvent', myHandler);
				
				//Assert
				expect(myEvents._cancelableEvents.someEvent.length).toBe(1);
			});
		});

		//It depends on this behavior to be able to cancel the public API Events
		describe('before:modelName.methodName Application events', function ()
		{
			
			it('Application on, off, trigger are backbone events methods', function()
			{
				expect(Application.on).toBe(Events.on);
				expect(Application.off).toBe(Events.off);
				expect(Application.trigger).toBe(Events.trigger);
			});

			it('should throw Error if one of the event listeners throws error', function()
			{
				expect(function()
				{ 
					Application.on('before:TestModel.testMethod', function()
					{
						throw new Error('Backbone should propagate this error');
					});
			
					my_model.testMethod();
				}).toThrow();
			});

			it('should not execute the method if an event listener throws error', function()
			{
				spyOn(my_model, 'testMethod').and.callThrough();
				spyOn(my_model, '_testMethod').and.callThrough();

				expect(function()
				{ 
					Application.on('before:TestModel.testMethod', function()
					{
						throw new Error('Cancelling call by throwing exception');
					});
					
					my_model.testMethod();
					expect(my_model._testMethod).not.toHaveBeenCalled();
					
				}).toThrow();	
			});
		});
	});
});
