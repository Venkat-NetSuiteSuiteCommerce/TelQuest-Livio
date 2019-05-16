/*
@module config 
@class ConfigurationTool
The configuration tool is meant to be used from the gulp tasks to validate and apply configuration modifications at buildtime. 
*/
var _ = require('underscore')
,	path = require('path')
,	PluginContainer = require('./PluginContainer')

var Tool = function()
{
	this.init.executeAll(this);
};

_.extend(Tool.prototype, {


	// @property {PluginContainer} init extensions can register here behavior that needs to be executed when 
	// the instance is created (constructor). Given parameter is this/self
	init: new PluginContainer()

,	iterateProperties: function(data, fn)
	{
		_.each(data, function(object)
		{
			_.each(object.properties, function(property, id)
			{
				var context = property;
				context = _.extend(context, {
					id: id
				});
				fn(context)
				if(property.type==='array' && property.items && property.items.type==='object')
				{
					_.each(property.items.properties, function(arrayObjectProp, arrayObjectPropId)
					{
						var childId = id+'.'+arrayObjectPropId;
						var childContext = arrayObjectProp
						//TODO: remove id property since gives error when copying and pasting properties from output file in filecabinet. 
						childContext = _.extend(childContext, {id: childId});
						fn(childContext);
					});
				}
			});
		});
	}

,	getProperty: function(data, propertyId)
	{
		var result;
		this.iterateProperties(data, function(property)//TODO: performance - ._each don't break
		{
			if(property.id === propertyId)
			{
				result = property.id === propertyId ? property : result;
			}
		})
		return result; 
	}
});


module.exports = Tool; 