/* jshint node: true */
'use strict';
var _ = require('underscore')
,	Orchestrator = require('orchestrator')
,	path = require('path')
,	fs = require('fs')
,	async = require('async')
;

var preconditionsOrchestrator = new Orchestrator();

var Preconditions = {

	volatileCache: {}

,	persistentCache: {}
	
,	getCacheKey: function(name, seq)
	{
		return name + ':' + seq.join('|');
	}

,	getCache: function(name, seq)
	{
		if (this.persistentCache[name])
		{
			return this.persistentCache[name];
		}
		var result = this.volatileCache[this.getCacheKey(name, seq)];
		// delete this.volatileCache[this.getCacheKey(name, seq)]; //TODO: commented because introduced a bug in transitive dependencies, non-presistent, executed twice 
		return result;
	}

,	setCache: function(name, seq, value, persistent)
	{
		if (persistent)
		{
			this.setPersistentCache(name, value);
		}
		else
		{
			this.volatileCache[this.getCacheKey(name, seq)] = value;
		}
	}

,	setPersistentCache: function(name, value)
	{
		this.persistentCache[name] = value;
	}

,	add: makeAddFunction(false)

,	addPersistent: makeAddFunction(true)

,	start: function ()
	{
		// Defines some vars that we will use later
		var args_array = _.toArray(arguments)
		,	last = args_array.length - 1
		,	preconditions_self = this;

		// if the start function has a function
		if (typeof args_array[last] === 'function')
		{
			// Save that function
			var original_cb = args_array[last];

			// Replaces that function in the arguments for one that will get values from the cache and pass it to the origina
			args_array[last] = function(err)
			{
				var cb_arguments = [err]
				,	seq = this.seq;

				// gets the task results from the cache
				args_array.slice(0, last).forEach(function(task_name)
				{
					// Puts it in the arguments that will be passed to the original start function
					cb_arguments.push(preconditions_self.getCache(task_name, seq));
				});

				// Calss the original function
				original_cb.apply(this, cb_arguments);
			};
		}

		// calls the orchestrator start with the new function
		preconditionsOrchestrator.start.apply(preconditionsOrchestrator, args_array);
	}


,	getOrchestrator: function()
	{
		return preconditionsOrchestrator;		
	}

	// when an orchestrator task is interrumpted from other async context, the stopped task remains in 
	// 'running' state and should be reseted.
,	clearZombieTasks: function()
	{
		var tasks = preconditionsOrchestrator.tasks;

		_(tasks).each(function(task, taskName)
		{
			if (task.running)
			{
				task.running = false;
			}

		});
	}

};


// Curring the creation of the add function with support for returning values of the tasks + persistense of those
function makeAddFunction(persistent)
{
	// The add function
	return function (name, deps, fn)
	{
		// Normalizing the input
		if (typeof deps === 'function')	
		{
			fn = deps;
			deps = [];
		}

		// Gets a reference to the Preconditions object
		var precondition_self = this;

		// this is the fucntion that will be passed to the Orchestrator add function. 
		// In it we will capture the result of the tasks, and put it in a volatile or persistent cache
		// it will also pass the result of dependee to the depender 
		var new_fn = function(cb)
		{
			// Saves a reference to the Orchestrator objxt
			var orchestrator_self = this;

			// If this is a persistent result and we have it, just return
			if (persistent && precondition_self.persistentCache[name])
			{
				return cb.call(orchestrator_self, null);
			}

			// this are the arguments that will be paased to the task function
			var task_arguments = [];

			// if the task has dependees we look in the cache for its values 
			if (deps.length)
			{
				deps.forEach(function(dep)
				{
					// and we push them to the arguments for the current task
					task_arguments.push(precondition_self.getCache(dep, orchestrator_self.seq));
				});
			}
			
			// Finally we push the callback that will put the returned value in the cache
			task_arguments.push(function(err, value)
			{
				precondition_self.setCache(name, orchestrator_self.seq, value, persistent);
				cb.call(orchestrator_self, err);
			});

			// if we got the result and it's a persistent task, we remove the deps so Orchestrator does not compute them again for our task
			if (persistent)
			{
				preconditionsOrchestrator.add.call(preconditionsOrchestrator, name, [], new_fn);
			}
			

			// Class the original Task function
			fn.apply(orchestrator_self, task_arguments);
		};

		// Now we add the new wrapped task to the orchestrator
		preconditionsOrchestrator.add.call(preconditionsOrchestrator, name, deps, new_fn);
	}

}



module.exports = Preconditions; 
