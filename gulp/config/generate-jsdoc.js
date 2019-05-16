/*

@module config 
@class ConfigurationTool

*/
var Tool = require('./tool')
,	_ = require('underscore')
,	fs = require('fs')
,	jsdocTool = require('short-jsdoc')

_.extend(Tool.prototype, {

	configToJsTypes: {
		array: 'Array'
	,	string: 'String'
	}

,	generateJsDocs: function(config)
	{
		var self = this;
		var manifest = JSON.parse(config.manifest.contents.toString());

		var jsdoc = ['/*', '@module sc.configuration', '@class SC.Configuration'];

		var arrayOfClass;
		this.iterateProperties(manifest, function(p)
		{
			
			if(p.type==='array' && _.keys(p.items).length)
			{
				arrayOfClass = p.id;				
				jsdoc.push('@property' + ' {Array<' + arrayOfClass + '>} ' + p.id + ' ' + (p.description||'No description') + 
					'. \n\nLocation in the UI: ' + self.getLocationInUI(p, manifest) + ' @public');
			}
			// else if(p.isArrayOfObjectProperty)
			// {
			// 	if(arrayOfClass)
			// 	{
			// 		jsdoc.push('@class SC.Configuration.' + arrayOfClass)
			// 	}				
			// 	jsdoc.push('@property' + ' {' + (self.configToJsTypes[p.type] || p.type) + '} ' + p.id + ' ' + (p.description||'No description')+ 
			// 		'. \n\nLocation in the UI: ' + self.getLocationInUI(p, manifest) + ' @public');
			// }
			else
			{
				jsdoc.push('')
				jsdoc.push('@class SC.Configuration')
				jsdoc.push('@property' + ' {' + (self.configToJsTypes[p.type] || p.type) + '} ' + p.id + ' ' + (p.description||'No description') + 
					'. \n\nLocation in the UI: ' + self.getLocationInUI(p, manifest) + ' @public');
			}
		})
		jsdoc.push('*/')
		fs.writeFileSync(config.output, jsdoc.join('\n'));

		jsdocTool.make({
			inputDirs: [config.output]
		,	output: 'config-jsdoc'
		,	projectMetadata: {name: 'SC Configuration'}
		,	vendor: ['javascript']
		}); 
	}

,	getLocationInUI: function(node, manifest)
	{
		var s = '';
		if(node.group)
		{
			var group = _.find(manifest, function(val, key) {return val.group && val.group.id === node.group}).group
			s += '*Tab*: ' +group.title
		}
		if(node.subtab)
		{
			var subtab = _.find(manifest, function(val, key) {return val.subtab && val.subtab.id === node.subtab}).subtab
			s += ', *Sub tab*: ' +subtab.title
		}
		return s;
	}
});

module.export = Tool; 