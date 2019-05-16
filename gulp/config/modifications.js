/*
@module config
@class ConfigurationTool
*/
"use strict";
var gutil = require('gulp-util');
var Tool = require('./tool')
,	_ = require('underscore')
,	PluginContainer = require('./PluginContainer')
var JSONPath = require('jsonpath-plus');

Tool.prototype.init.install({
	name: 'modfications'
,	execute: function(self)
	{
		self._installModificationsPlugins();
	}
});

_.extend(Tool.prototype, {

	/*
	@property {PluginContainer} modificationPlugins these plugins will receive a modification definition for
	a property and a target property to modify accordingly. Usage:

		tool.modificationPlugins.install
	*/
	modificationPlugins: new PluginContainer()

	// @method modifications it will execute the registered modification plugins to given manifest object which will be modified
	// @param {Array<Object>} data the manifest
,	modifications: function(data)
	{
		var errors = [];
		var self = this;
		//get all the modifications,
		var modificationsResult = JSONPath({
						json: data,
						path: '$[*].modifications[*]',
						resultType: 'all'
					});


		var appliedModifications = {};
		_.each(data, function(configuration)
		{
			_.each(modificationsResult, function(mod, index)
			{
				var jsonResults;
				try
				{
					var jsonResults = JSONPath({
						json: configuration,
						path: mod.value.target,
						resultType: 'all'
					});
				}
				catch(ex)
				{
					errors.push("Syntax error in the modification target in " + JSON.stringify(mod.value));
					return;
				}
				if (_.size(jsonResults) > 0)
				{
					appliedModifications[index] = true;
					var pluginContext = {
						mod: mod.value
					,	jsonResults: jsonResults
					,	configuration: configuration
					, 	errors: errors
					}
					self.modificationPlugins.executeAll(pluginContext);
				}
			});
		});

		//throw an error for each modification that was not applied on any element
		_.each(modificationsResult,function(mod, index)
		{
			if (!appliedModifications[index])
			{
				errors.push("Nothing is been modified with " + JSON.stringify(mod.value));
			}
		});

		return errors;
	}

	//@method _installModificationsPlugins install the default modification plugins
,	_installModificationsPlugins: function()
	{
		this.modificationPlugins.install(
		{
			name: 'add'
		,	execute: function(context)
			{
				var mod = context.mod
				, jsonResults = context.jsonResults
				, errors = context.errors
				, configuration = context.configuration;

				if (mod.action === 'add')
				{
					_.each(jsonResults, function(jsonResult)
					{
						//when target it's array add the value as a new element of the array at the end
						if(_.isArray(jsonResult.value))
						{
							jsonResult.value.push(mod.value);
						}//objects
						else if (_.isObject(jsonResult.value))
						{
							if (_.isObject(mod.value) && !_.isArray(mod.value))
							{
								_.extend(jsonResult.value, mod.value);
							}
							else
							{
								errors.push("The value must be a JSON object" + JSON.stringify(mod));
							}
						}//the target it's a String
						else if (_.isString(jsonResult.value))
						{
							if(_.isString(mod.value) || _.isNumber(mod.value))
							{
								var parentProperty = jsonResult['parentProperty'];
								jsonResult['parent'][parentProperty] +=  mod.value;
							}
							else
							{
								errors.push("Only a string or a number value can be added to a target of string type "+ JSON.stringify(mod));
							}
						}
						else
						{
							errors.push("The target of this action must be a Array, Object or String " + JSON.stringify(mod));
						}
					});
				}
			}
		});
		this.modificationPlugins.install(
		{
			name: 'replace'
		,	execute: function(context)
			{
				var mod = context.mod
				, jsonResults = context.jsonResults
				, errors = context.errors
				, configuration = context.configuration;

				if (mod.action === 'replace')
				{
					_.each(jsonResults, function(jsonResult)
					{
						if (_.isString(jsonResult.value) || _.isNumber(jsonResult.value) || _.isBoolean(jsonResult.value) || jsonResult.value == null)
						{
							var parentProperty = jsonResult['parentProperty'];
							jsonResult['parent'][parentProperty] = mod.value;
						}
						else
						{
							errors.push("The target of this action must be a String, Number, Boolean or NULL " + JSON.stringify(mod));
						}
					});
				}
			}
		});
		this.modificationPlugins.install(
		{
			name: 'remove'
		,	execute: function(context)
			{
				var mod = context.mod
				, jsonResults = context.jsonResults
				, errors = context.errors
				, configuration = context.configuration;
				/*
				This array has objects with two properties
				{
					arrayRef -> this point to a array with items to be deleted
					indexes -> this is a array of the indexes to be deleted y the array (arrayRef)
				}
				*/
				var toDelete = [];
				if (mod.action === 'remove')
				{
					/*
					Store in "toDelete" all the arrays and respective indexes that need to be deleted(they are not deleted at ones becouse the
					indexes that are waitting to be processed are going to be affected)
					*/
					_.each(jsonResults, function(jsonResult)
					{
						if ((_.isString(jsonResult.value) || _.isNumber(jsonResult.value) || _.isBoolean(jsonResult.value) || jsonResult.value == null) && _.isArray(jsonResult['parent']))
						{
							addToDelete(jsonResult['parent'], jsonResult['parentProperty']);
						}
						else
						{
							errors.push("The target of this action must be a String, Number, Boolean or NULL " + JSON.stringify(mod));
						}
					});
					if (!errors.length)
					{
						_.each(toDelete, function(item)
						{
							//order in descending way
							var indexesOrdered = item.indexes.sort(function(a, b)
							{
								if(a < b)
								{
									return 1;
								}
								else if(a > b)
								{
									return -1;
								}
								return 0;
							});
							//delete the elements from the arrays
							for (var i = 0; i < indexesOrdered.length; i++)
							{
								item.arrayRef.splice(indexesOrdered[i],1);
							}
						});
					}
				}
				function addToDelete(array, index)
				{
					//if the array param it's already in the list, just add the index to the respective array
					for (var i = 0; i < toDelete.length; i++)
					{
						if(toDelete[i].arrayRef === array)
						{
							toDelete[i].indexes.push(index);
							return;
						}
					}
					//if the array do not exist in the list
					toDelete.push(
					{
						arrayRef : array,
						indexes:[index]
					});
				}
			}
		});
	}
});
module.exports = Tool;