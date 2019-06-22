/* jshint node: true */
'use strict';

/*
@module gulp.configuration
#gulp configuration

This gulp task will compile all the module's configuration to generate the file LocalDistribution/configurationManifest.json.

Each module can declare configuration properties by using the 'configuration' property in ns.package.json. For example:

	{
		"gulp": {
			"configuration": [
				"Configuration/*.json"
			]
		}
	}

*/

var gulp = require('gulp')
,	gif = require('gulp-if')
,	map = require('map-stream')
,	concat = require('gulp-concat')
,	_ = require('underscore')
,	path = require('path')
,	fs = require('fs')
,	package_manager = require('../package-manager')
,	args = require('yargs').argv

,   validationErrors = {}
,	Tool = require('../config')
,	chmod = require('gulp-chmod');

var tool, configurationManifest;

gulp.task('configuration', function(cb2)
{
	var manifestFileName = 'configurationManifest.json';

	if (package_manager.getTaskConfig('configuration.ignore', false))
	{
		cb2(null);
		return;
	}
	var doValidate = package_manager.getTaskConfig('configuration.validate', true);
	tool = new Tool();
	configurationManifest = [];

	var stream = gulp.src(package_manager.getGlobsFor('configuration'))
		.pipe(package_manager.handleOverrides())
		.pipe(gif(doValidate, map(validateJSONSchema)))
		.pipe(gif(areConfigsValid, map(function(file, cb)
		{
			var configuration_content = JSON.parse(file.contents.toString());
			configurationManifest.push(configuration_content);
			cb(null, file);
		})))
		.pipe(concat(manifestFileName))
		.pipe(map(configurationTasks))
		.pipe(map(function(file, cb)
		{
			file.contents = new Buffer(JSON.stringify(configurationManifest, '\t', 4));
			cb(null, file);
		}))
		.pipe(gif(args.jsdoc, map(function(file, cb)
		{
			tool.generateJsDocs({manifest: file, output: 'configuration-jsdocs.js'});
			cb(null, file);
		})))
		.pipe(chmod({write: true}))
		.pipe(gulp.dest(process.gulp_dest, { mode: '0777' }));

	stream.on('end', function(err)
	{
		var defaultConfig = {};
		_.each(configurationManifest, function(entry)
		{
			_.each(entry.properties, function(value, key)
			{
				if (value.default !== undefined)
				{
					setPathFromObject(defaultConfig, key, value.default);
				}
			});
		});
		fs.writeFileSync(path.join(process.gulp_dest, 'configurationManifestDefaults.json'), JSON.stringify(defaultConfig, 0, '\t'));
		cb2(err);
	});
});

// @method setPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} value the value to set
var setPathFromObject = function (object, path, value)
{
	if (!path)
	{
		return;
	}
	else if (!object)
	{
		return;
	}

	var tokens = path.split('.')
	,	prev = object;

	for(var token_idx = 0; token_idx < tokens.length-1; ++token_idx)
	{
		var current_token = tokens[token_idx];

		if( _.isUndefined(prev[current_token]))
		{
			prev[current_token] = {};
		}
		prev = prev[current_token];
	}

	prev[_.last(tokens)] = value;
};

var configurationTasks = function (file, cb)
{
	var errors = tool.modifications(configurationManifest);
	var doValidate = package_manager.getTaskConfig('configuration.validate', true);
	if (errors.length)
	{
		cb('Modifications errors: \n' + errors.join('\n'), file);
	}
	else if(doValidate)
	{
		var groupingErrors = tool.validateReferences(configurationManifest);
		if(groupingErrors.length)
		{
			cb('Grouping errors: \n' + groupingErrors.join('\n'), file);
		}
		else
		{
			cb(null, file);
		}
	}
	else
	{
		cb(null, file);
	}
};

var validateJSONSchema = function (config_file, cb)
{
	var configJson;
	try
	{
		configJson = JSON.parse(config_file.contents.toString());
	}
	catch(ex)
	{
		console.log('Configuration error. Invalid configuration json file: ', config_file.path);
	}
	var errors = tool.validateJSONSchema(configJson);
	if(errors)
	{
		console.log('Configuration error. Invalid json schema file: ', config_file.path);
		validationErrors[config_file.path] = errors;
	}

	cb(null, config_file);
};

var areConfigsValid = function ()
{
	if(_.keys(validationErrors).length > 0)
	{
		console.log('Configuration not JSON Schema v4 compliant. Errors: \n');

		_.each(validationErrors, function(error, file)
		{
		   console.log('At: ' + file, '\n', error, '\n');
		});

		process.exit(1);
	}

	return true;
};
