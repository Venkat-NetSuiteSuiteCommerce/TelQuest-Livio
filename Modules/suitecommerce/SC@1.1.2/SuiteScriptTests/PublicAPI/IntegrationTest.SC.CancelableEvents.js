/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('IntegrationTest.SC.CancelableEvents',
	[
		'SC.CancelableEvents'
	,	'preconditions'
	,	'jQuery.Deferred'
	,	'underscore'
	]
,	function (
		events
	,	preconditions
	,	jQuery
	,	_
	)
{
	'use strict';

	return describe('IntegrationTest.SC.CancelableEvents', function ()
	{
		var myEvents;

		beforeEach(function ()
		{
			myEvents = _.extend({}, events);
		});

		describe('cancelableOn method', function ()
		{
			it('should add a new event listener into the current object', function ()
			{
				//Arrange
				var myHandler = function () {return 123;};

				//Act
				myEvents.cancelableOn('someEvent', myHandler);

				//Assert
				expect(myEvents._cancelableEvents.someEvent[0].fn).toBe(myHandler);
			});
		});

		describe('cancelableTrigger method with event handlers attached', function ()
		{
			it('should not stop propagation to the rest of the event handlers if one of them cancells by throwing error', function ()
			{
				var handlers = {
					first_handler: function() {}
				,	exception_handler: function ()
					{
						throw new Error('Boom!');
					}

				,	second_handler: function (){}
				,	third_handler: function(){}

				};

				spyOn(handlers,'first_handler').and.callThrough();
				spyOn(handlers,'exception_handler').and.callThrough();
				spyOn(handlers,'second_handler').and.callThrough();
				spyOn(handlers,'third_handler').and.callThrough();

				myEvents.cancelableOn('someEvent', handlers.first_handler);
				myEvents.cancelableOn('someEvent', handlers.exception_handler);
				myEvents.cancelableOn('someEvent', handlers.second_handler);
				myEvents.cancelableOn('someEvent', handlers.third_handler);

				//Act
				var result = myEvents.cancelableTrigger('someEvent');

				//Assert
				expect(result.then).toBeDefined();
				expect(result.state()).toBe('rejected');

				expect(handlers.first_handler).toHaveBeenCalled();
				expect(handlers.exception_handler).toHaveBeenCalled();
				expect(handlers.second_handler).toHaveBeenCalled();
				expect(handlers.third_handler).toHaveBeenCalled();
			});

			it('should ignore parameters returned by event handler when those are not Deferred and return a deferred resolved', function ()
			{
				//Arrange
				var handlers = {
						string: function ()
						{
							return 'String Value';
						}
					,	number: function ()
						{
							return 42;
						}
					};

				spyOn(handlers,'string').and.callThrough();
				spyOn(handlers,'number').and.callThrough();

				myEvents.cancelableOn('someEvent', handlers.string);
				myEvents.cancelableOn('someEvent', handlers.number);

				//Act
				var result = myEvents.cancelableTrigger('someEvent');

				//Assert
				expect(result.then).toBeDefined();
				expect(result.state()).toBe('resolved');

				expect(handlers.string.calls.count()).toBe(1);
				expect(handlers.string.calls.argsFor(0)).toEqual([]);
				expect(handlers.number.calls.count()).toBe(1);
				expect(handlers.number.calls.argsFor(0)).toEqual([]);
			});

			it('should return a resolve Deferred when all handers return a resolved Deferred', function ()
			{
				//Arrange
				var handlers = {
						first: function ()
						{
							return jQuery.Deferred().resolve();
						}
					,	second: function ()
						{
							return jQuery.Deferred().resolve();
						}
					};

				myEvents.cancelableOn('someEvent', handlers.first);
				myEvents.cancelableOn('someEvent', handlers.second);

				//Act
				var result = myEvents.cancelableTrigger('someEvent');

				//Assert
				expect(result.then).toBeDefined();
				expect(result.state()).toBe('resolved');
			});

			it('should return a rejected Deferred when at least one handler returns a rejected Deferred', function ()
			{
				//Arrange
				var handlers = {
						first: function ()
						{
							return jQuery.Deferred().resolve();
						}
					,	second: function ()
						{
							return jQuery.Deferred().reject();
						}
					,	last: function ()
						{
							return jQuery.Deferred().resolve();
						}
					};

				spyOn(handlers,'first').and.callThrough();
				spyOn(handlers,'second').and.callThrough();
				spyOn(handlers,'last').and.callThrough();

				myEvents.cancelableOn('someEvent', handlers.first);
				myEvents.cancelableOn('someEvent', handlers.second);
				myEvents.cancelableOn('someEvent', handlers.last);

				//Act
				var result = myEvents.cancelableTrigger('someEvent');

				//Assert
				expect(result.then).toBeDefined();
				expect(result.state()).toBe('rejected');

				expect(handlers.first).toHaveBeenCalled();
				expect(handlers.second).toHaveBeenCalled();
				expect(handlers.last).toHaveBeenCalled();
			});

			it('should return a rejected Deferred when at least one handler throws an error', function ()
			{
				//Arrange
				var exception_handler = function ()
					{
						throw new Error('Boom!');
					}
				,	standard_handlers = function (){};

				myEvents.cancelableOn('someEvent', standard_handlers);
				myEvents.cancelableOn('someEvent', exception_handler);

				//Act
				var result = myEvents.cancelableTrigger('someEvent');

				//Assert
				expect(result.then).toBeDefined();
				expect(result.state()).toBe('rejected');
			});

			it ('should pass all the parameters it receive to the event handlers', function ()
			{
				//Arrange
				var handlers = {
						string: function ()
						{
							return 'String Value';
						}
					,	number: function ()
						{
							return 42;
						}
					}
				,	expected_params_1 = 'param01'
				,	expected_params_2 = {};

				spyOn(handlers,'string').and.callThrough();
				spyOn(handlers,'number').and.callThrough();

				myEvents.cancelableOn('someEvent', handlers.string);
				myEvents.cancelableOn('someEvent', handlers.number);

				//Act
				var result = myEvents.cancelableTrigger('someEvent', expected_params_1, expected_params_2);

				//Assert
				expect(result.then).toBeDefined();
				expect(result.state()).toBe('resolved');

				expect(handlers.string.calls.count()).toBe(1);
				expect(handlers.string.calls.argsFor(0)).toEqual([expected_params_1, expected_params_2]);
				expect(handlers.number.calls.count()).toBe(1);
				expect(handlers.number.calls.argsFor(0)).toEqual([expected_params_1, expected_params_2]);
			});

			it ('should pass all the parameters it receive to the event handlers in a safe way', function ()
			{
				//Arrange
				var expected_params_1 = {name: 'name'}
				,	expected_params_2 = {
						number: 42
					,	innerObject:{
							secondLevel: {
								object: {
								}
							}
						}
					}
				,	expected_params_3 = 33
				,	expected_params_4 = 'testing';
				var handlers = {
						first: function (obj1, obj2, number, string)
						{
							//Assert (Note: as the spy save the parameter AFTER they are edited the assert is done here)
							expect(obj1).toEqual(expected_params_1);
							expect(obj2).toEqual({
								number: 42
							,	innerObject:{
									secondLevel: {
										object: {
										}
									}
								}
							});
							expect(number).toBe(expected_params_3);
							expect(string).toBe(expected_params_4);

							obj1.name = 31123;
							obj1.ANOTHERPROP = 'True';
							obj2.innerObject.secondLevel = {edited:true};
							number = string;
							string = 123;

							return 'String Value';
						}
					,	second: function (obj1, obj2, number, string)
						{
							//Assert (Note: as the spy save the parameter AFTER they are edited the assert is done here)
							expect(obj1).toEqual(expected_params_1);
							expect(obj2).toEqual({
								number: 42
							,	innerObject:{
									secondLevel: {
										object: {
										}
									}
								}
							});
							expect(number).toBe(expected_params_3);
							expect(string).toBe(expected_params_4);

							obj1.name = 31123;
							obj1.ANOTHERPROP = 'True';
							obj2.innerObject.secondLevel = 12;
							number = string;
							string = 123;

							return 42;
						}
					}
					;

				myEvents.cancelableOn('someEvent', handlers.first);
				myEvents.cancelableOn('someEvent', handlers.second);

				//Act
				myEvents.cancelableTrigger('someEvent', expected_params_1, expected_params_2, expected_params_3, expected_params_4);

				//Assert
				//In function bodies
			});

			it ('should run all event handlers without context', function ()
			{
				
				//Arrange
				var called_context
				,	handlers = {
						first: function ()
						{
							expect(this).toBe(window);
							expect(this).toBe(global);
							expect(called_context).toBe(undefined);
							expect(function(){this.new_property_testing = 'new property'}).not.toThrow();
							expect(this.new_property_testing).toEqual('new property');	
							called_context = 'some string';

							delete this.new_property_testing;
							return 'String Value';
						}
					};

				myEvents.cancelableOn('someEvent', handlers.first);

				//Act
				var result = myEvents.cancelableTrigger('someEvent');

				//Assert
				expect(result.then).toBeDefined();
				expect(result.then).not.toThrow();
				expect(result.state()).toBe('resolved');

				result.then(function()
				{
					expect(called_context).not.toBe(null);
					expect(called_context).toEqual('some string');
					expect(typeof called_context).toEqual('string');
				});
			});
		});

		describe('cancelableTrigger method without event handlers attached', function ()
		{
			it ('should return a resolved Deferred', function ()
			{
				//Act
				var result = myEvents.cancelableTrigger('someEvent');

				//Assert
				expect(result.then).toBeDefined();
				expect(result.state()).toBe('resolved');
			});
		});

		describe('cancelableOff method', function ()
		{
			it ('should remove an event handler when it was previously added so the trigger does not call it anymore', function ()
			{
				//Arrange
				var handlers = {
					fn: function () {}
				};
				spyOn(handlers, 'fn').and.callThrough();

				//Act
				myEvents.cancelableOn('eventName', handlers.fn);

				myEvents.cancelableTrigger('eventName');
				expect(handlers.fn).toHaveBeenCalled();
				expect(handlers.fn.calls.count()).toEqual(1);

				myEvents.cancelableOff('eventName', handlers.fn);
				myEvents.cancelableTrigger('eventName');
				myEvents.cancelableTrigger('eventName');
				myEvents.cancelableTrigger('eventName');

				//Assert
				expect(handlers.fn.calls.count()).toEqual(1);
			});

			it ('should do nothing when the passed in handler function is not present in the list of register handlers', function ()
			{
				//Arrange
				var fn = function () {};

				//Act
				expect(myEvents._cancelableEvents).toBeUndefined();
				myEvents.cancelableOff('someEvent', fn);

				//Assert
				expect(myEvents._cancelableEvents).toBeUndefined();
			});

			it ('should validate that the event name passed in a string', function ()
			{
				//Arrange
				var fn = function ()
					{
						myEvents.cancelableOff(321);
					};

				//Act & Assert
				expect(fn).toThrow();
			});

			it ('should validate that the handler passed in a Function', function ()
			{
				//Arrange
				var fn = function ()
					{
						myEvents.cancelableOff('eventName', (321));
					};

				//Act & Assert
				expect(fn).toThrow();
			});
		});
	});
});
