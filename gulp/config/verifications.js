/*
@module config 
@class ConfigurationTool
*/

var Tool = require('./tool')
,	_ = require('underscore')
,	PluginContainer = require('./PluginContainer')

Tool.prototype.init.install({
	name: 'verifications'
,	execute: function(self)
	{		
		//heads up! we are requiring this here to not make the rest of devtools slower:
		var	metaSchema = require('./json-meta-schema/meta-schema-draftv4')
		,	validator = require('is-my-json-valid')

		//@method validate validates the json schema of given object @param {Object} data
		self.validate = validator(metaSchema, {verbose: 'true'}); 
	}
});

_.extend(Tool.prototype, {

	// @method validateJSONSchema @param data @return {Array<String>} the errors or falsy otherwhise. 
	validateJSONSchema: function(data)
	{
		var result = this.validate(data);
		return !result ? this.validate.errors : undefined;
	}
	/*
	@method validateReferences perform the following validations : 

	 * any property or subtab referencing an undeclared group gives error
	 * duplicated properties declarations gives an error

	@param data
	@returns {Array<String>} errors
	*/
,	validateReferences: function(data)
	{
		var self = this, groups = {}, groupsCount = {}, subtabs = {}, subtabsCount = {}, props = {}, errors = [];

		//verify duplicated groups and subtabs declarations
		_.each(data, function(field)
		{
			if(field.group)
			{
				groups[field.group.id] = field.group
				groupsCount[field.group.id] = groupsCount[field.group.id] || 0;
				groupsCount[field.group.id]++;
			}
			if(field.subtab)
			{
				subtabs[field.subtab.id] = field.subtab
				subtabsCount[field.subtab.id] = subtabsCount[field.subtab.id] || 0;
				subtabsCount[field.subtab.id]++;
			}
		});

		_.each(groupsCount, function(val, key)
		{
			if(val>1)
			{
				errors.push('Duplicated group declaration: '+key)
			}
		})
		_.each(subtabsCount, function(val, key)
		{
			if(val>1)
			{
				errors.push('Duplicated subtab declaration: '+key)
			}
		})

		this.iterateProperties(data, function(property)
		{
			self.validatePropertyId(property.id, errors);
			if(props[property.id])
			{
				errors.push('Duplicated property declaration: '+property.id)
			}
			props[property.id] = true;
			if(property.group && !groups[property.group])
			{
				errors.push('property: '+property.id+' references non existent group '+property.group)
			}
			if(property.subtab && !subtabs[property.subtab])
			{
				errors.push('property: '+property.id+' references non existent subtab '+property.subtab)
			}
		}); 
		return errors;
	}

,	validatePropertyId: function(id, errors)
	{
		var regex = /^[a-zA-Z_\.]+$/;
		if(!regex.exec(id))
		{
			errors.push('invalid property id: '+id+' . can only contain letters and characters _.');
		}
	}
});