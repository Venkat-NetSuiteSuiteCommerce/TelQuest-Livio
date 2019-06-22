/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module HandlebarsExtra 'Handlebars.CompilerNameLookup' exports a function helper used in the templates to see if an object is a backbone model and access it 
// using expressions like 'model.name'. See gulp/tasks/templates.js 'Handlebars.JavaScriptCompiler.prototype.nameLookup'. 

define(
	'Handlebars.CompilerNameLookup'
,	[
	]
,	function (
	)
{
	'use strict';


	/* globals Backbone */
	// heads up ! for separate templates from the rest of .js it is optimal that this file don't require backbone with AMD but globally. 

	return function(parent, name)
	{

		if(parent instanceof Backbone.Model)
		{
			if (name === '__customFieldsMetadata')
			{				
				return  parent.__customFieldsMetadata;
			}
			else
			{ 
				return parent.get(name);
			}
		}
		else
		{
			return parent[name];
		}
	}; 
}); 
