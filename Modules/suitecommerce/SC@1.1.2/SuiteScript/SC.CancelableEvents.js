/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC
define('SC.CancelableEvents'
,	[
		'Utils'
	,	'underscore'
	,	'jQuery.Deferred'
	]
,	function (
	 	Utils
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class SC.CancelableEvents
	return {
		//@method cancelableOn Allow to attach an event handler into a particular event name
		//@public
		//@param {String} event_name The name of the event to attach to
		//@param {Function} handler The event handler function that will be invoked when the event __event_name__ is triggered.
		//This function can receive optionally one parameter representing the action parameter. Besides optionally can return a jQuery.Deferred
		//to details the execution of the trigger's callback. If the returned jQuery.Deferred is rejected the trigger's callback wont be called
		//@return {Void}
		cancelableOn: function cancelableOn (event_name, handler)
		{
			this._cancelableOn(this, event_name, handler);
		}

		//@method cancelableOff Allow to detach an event handler.
		//@public
		//@param {String} event_name The name of the event to detach from. Note that this parameter is mandatory
		//@param {Function} handler The event handler function that will be removed from the list of register handlers. Note this parameter is required.
		//@return {Void}
	,	cancelableOff: function cancelableOff (event_name, handler)
		{
			if (!_.isString(event_name) || !_.isFunction(handler))
			{
				throw {
					status: SC.ERROR_IDENTIFIERS.invalidParameter.status
				,	code: SC.ERROR_IDENTIFIERS.invalidParameter.code
				,	message: 'Parameter "event_name" and "handler" must be String and Function respectively'
				};
			}
			this._cancelableOff(this, event_name, handler);
		}

		//@method _cancelableOff Internal method that implemented the logic to remove an event handler from an event container.
		//@private
		//@param {Object} events_container_entity Any object used to store the list of event handlers
		//@param {String} event_name The name of the event to detach from. Note that this parameter is mandatory
		//@param {Function} handler The event handler function that will be removed from the list of register handlers. Note this parameter is required.
		//@return {Object} the same events_container_entity passed in as parameter
	,	_cancelableOff: function _cancelableOff (events_container_entity, event_name, handler)
		{
			if (!events_container_entity ||
				!events_container_entity._cancelableEvents ||
				!events_container_entity._cancelableEvents[event_name] ||
				!events_container_entity._cancelableEvents[event_name].length)
			{
				return events_container_entity;
			}

			events_container_entity._cancelableEvents[event_name] = _.reject(events_container_entity._cancelableEvents[event_name], function (event_object)
			{
				return event_object.fn === handler;
			});

			return events_container_entity;
		}

		//@method _cancelableOn Internal method that implements the logic to add a new event handler into a container
		//@private
		//@param {Object} events_container_entity Any object used to store the list of event handlers
		//@param {String} event_name The name of the event to attach to
		//@param {Function} handler The event handler function that will be invoked when the event __event_name__ is triggered.
		//This function can receive optionally one parameter representing the action parameter. Besides optionally can return a jQuery.Deferred
		//to details the execution of the trigger's callback. If the returned jQuery.Deferred is rejected the trigger's callback wont be called
		//@return {Object} the same events_container_entity passed in as parameter
	,	_cancelableOn: function _cancelableOn (events_container_entity, event_name, handler)
		{
			events_container_entity._cancelableEvents = events_container_entity._cancelableEvents || {};
			var event_handlers = events_container_entity._cancelableEvents[event_name] = events_container_entity._cancelableEvents[event_name] || [];

			event_handlers.push({
				fn: handler
			});

			return events_container_entity;
		}

		//@method cancelableDisable Allow to disable all the handlers of a particular event
		//@public
		//@param {String} event_name The name of the event to disable
		//@return {Void}
	,	cancelableDisable: function cancelableDisable (event_name)
		{
			if (!_.isString(event_name))
			{
				throw {
					status: SC.ERROR_IDENTIFIERS.invalidParameter.status
				,	code: SC.ERROR_IDENTIFIERS.invalidParameter.code
				,	message: 'Parameter "event_name" must be String'
				};
			}
			this._cancelableDisable(this, event_name);
		}

		//@method _cancelableDisable Internal method that implements the logic to disable an event into a container
		//@private
		//@param {Object} events_container_entity Any object used to store the list of event handlers
		//@param {String} event_name The name of the event to attach to
		//@return {Object} the same events_container_entity passed in as parameter
	,	_cancelableDisable: function _cancelableDisable (events_container_entity, event_name)
		{
			events_container_entity._cancelableEvents = events_container_entity._cancelableEvents || {};
			events_container_entity._cancelableDisabledEvents = events_container_entity._cancelableDisabledEvents || {};
			events_container_entity._cancelableDisabledEvents[event_name] = events_container_entity._cancelableDisabledEvents[event_name] || [];

			//If already disable an event without re-enable it do nothing
			if(_.isEmpty(events_container_entity._cancelableDisabledEvents[event_name]))
			{
				events_container_entity._cancelableDisabledEvents[event_name] = events_container_entity._cancelableEvents[event_name] || [];
				events_container_entity._cancelableEvents[event_name] = [];
			}

			return events_container_entity;
		}

		//@method cancelableEnable Allow to enable (restore) all the handlers of a particular event
		//@public
		//@param {String} event_name The name of the event to disable
		//@return {Void}
	,	cancelableEnable: function cancelableEnable (event_name)
		{
			if (!_.isString(event_name))
			{
				throw {
					status: SC.ERROR_IDENTIFIERS.invalidParameter.status
				,	code: SC.ERROR_IDENTIFIERS.invalidParameter.code
				,	message: 'Parameter "event_name" must be String'
				};
			}
			this._cancelableEnable(this, event_name);
		}

		//@method _cancelableEnable Internal method that implements the logic to enable (restore) an event into a container
		//@private
		//@param {Object} events_container_entity Any object used to store the list of event handlers
		//@param {String} event_name The name of the event to attach to
		//@return {Object} the same events_container_entity passed in as parameter
	,	_cancelableEnable: function _cancelableEnable (events_container_entity, event_name)
		{
			events_container_entity._cancelableEvents = events_container_entity._cancelableEvents || {};
			events_container_entity._cancelableDisabledEvents = events_container_entity._cancelableDisabledEvents || {};
			events_container_entity._cancelableDisabledEvents[event_name] = events_container_entity._cancelableDisabledEvents[event_name] || [];

			//If the event was not disable before do nothing
			if(!_.isEmpty(events_container_entity._cancelableDisabledEvents[event_name]))
			{
				events_container_entity._cancelableEvents[event_name] = _.union(
					events_container_entity._cancelableEvents[event_name] || []
				,	events_container_entity._cancelableDisabledEvents[event_name]
				);
				events_container_entity._cancelableDisabledEvents[event_name] = [];
			}

			return events_container_entity;
		}

		//@method cancelableTrigger Trigger the indicate event with the passed in parameters. In case that any of the event handler reject the execution (the callback WONT be called)
		//@public
		//@param {String} event_name Event to trigger
		//@param {...params} args All other parameter passed to this function will be broadcaster to all event handlers
		//@return {jQuery.Deferred} As the event handler of an event can be asynchronous (that why it use Deferrers) the invocation of the callback is async. This means that this function
		//will return Deferred to represent this asynchronous
	,	cancelableTrigger: function cancelableTrigger (event_name)
		{
			var args = Array.prototype.slice.call(arguments).slice(1);
			return this._cancelableTrigger(this, event_name, args, true);
		}

		//@method cancelableTriggerUnsafe Trigger the indicate event with the passed in parameters WITHOUT sanitize them.
		//In case that any of the event handler reject (returns a rejected Deferred) the execution (the callback WONT be called)
		//@public
		//@param {String} event_name Event to trigger
		//@param {...params} args All other parameter passed to this function will be broadcaster to all event handlers
		//@return {jQuery.Deferred} As the event handler of an event can be asynchronous (that why it use Deferrers) the invocation of the callback is async. This means that this function
		//will return Deferred to represent this asynchronous
	,	cancelableTriggerUnsafe: function cancelableTriggerUnsafe (event_name)
		{
			var args = Array.prototype.slice.call(arguments).slice(1);
			return this._cancelableTrigger(this, event_name, args, false);
		}

		//@method _cancelableTrigger Internal method that will trigger the indicate event with the passed in data (intent). In case that any of the event handler reject the execution (the callback WONT be called)
		//@private
		//@param {Object} events_container_entity Store of the event handlers
		//@param {String} event_name Event to trigger
		//@param {Array<Any>} args Array of parameters to send to all event handlers attached to the specified event (if any)
		//@param {Boolean} safe_parameters Indicate if the parameter args should be sanitized or no.
		//@return {jQuery.Deferred}
	,	_cancelableTrigger: function _cancelableTrigger (events_container_entity, event_name, args, safe_parameters)
		{
			var self = this;

			if (!events_container_entity || !events_container_entity._cancelableEvents || !events_container_entity._cancelableEvents[event_name] || !events_container_entity._cancelableEvents[event_name].length)
			{
				return jQuery.Deferred().resolve();
			}
			else
			{
				var event_handler_promises = _.map(events_container_entity._cancelableEvents[event_name], function (event_handler_container)
				{
					try {
						return event_handler_container.fn.apply(null, safe_parameters ? _.map(args, self._getSafeParameter) : args);
					} catch (e) {
						console.log('SCA_EXTENSIBILITY_LAYER_ERROR', 'Exception on event handler for event ' + event_name, e);
						console.log('SCA_EXTENSIBILITY_LAYER_ERROR_STACK', e.stack);

						return jQuery.Deferred().reject(e);
					}
				});

				return jQuery.when.apply(jQuery, event_handler_promises);
			}
		}

		//@method _getSafeParameter Generate a safe-to-be-used copy of the passed in parameter
		//@private
		//@param {Object?} original_intent Any object
		//@return {Object?} Safe to be used by event handlers methods
	,	_getSafeParameter: function _getSafeParameter (original_intent)
		{
			return _.isUndefined(original_intent) ? original_intent : Utils.deepCopy(original_intent);
		}
	};

});