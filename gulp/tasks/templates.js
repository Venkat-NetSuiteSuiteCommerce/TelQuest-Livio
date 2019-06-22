/* jshint node: true */

/*
@module gulp.templates

This gulp task will compile the project's templates.

##Implementation

If template file extension is .txt then the template will be compiled using underscore templates (_.template).
If the template file extension is .tpl then the template is compiled using [handlebarsjs.com](handlebars templates).

##Usage

	gulp templates

##Result

It will compile all found templates files and generate the files
Distribution/processed-tempaltes/*.tpl.js, each of these being the compiled JavaScript
function template defined as a requirejs module. The name of this module is almost the same as the
template's filename. For example, 'my_template.tpl' file generates the 'my_template_tpl' requirejs module.

##Declaring templates in ns.package.json

The templates files are those referenced by the property gulp.templates in module's ns.package.json file. Example:

	{
		"gulp": {
			...
		,	"templates": [
				"Templates/*.tpl"
			]
			...
		}
	}

*/

'use strict';

var gulp = require('gulp')

,	del = require('del')

,	path = require('path')

,	package_manager = require('../package-manager')
,	dest = path.join(process.gulp_dest, 'processed-templates');


var Handlebars = require('handlebars');
// overrides Handlebars compiler public API to resolve the expression foo.bar into foo.get('bar') dynamically in case foo is a Backbone.Model
Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name)
{
	return 'compilerNameLookup('+parent+',"'+name+'")';
};

// install the compilerNameLookup function globally so other gulp tasks using Handlebars work. (handlebars used from node only)
global.compilerNameLookup = function(parent, name)
{
	return parent[name];
};

var buildStreams = function()
{
	var lazypipe = require('lazypipe')
	,	gulp_handlebars = require('gulp-handlebars')
	,	jst = require('gulp-jst')
	,	map = require('map-stream');
	
	var compile_templates = function compile_templates()
	{
		return gulp_handlebars({handlebars: Handlebars});
	};

	var handlebarsStream = lazypipe()
	.pipe(compile_templates)
	.pipe(map, function (file, cb)
	{
		var current_contents = file.contents.toString()
		,	module_name = path.basename(file.path, '.js');

		var deps = findTemplateDependencies(current_contents, module_name);

		file.contents = new Buffer(
			'define(\'' + module_name + '.tpl\', [' + deps.join(',') + '], function (Handlebars, compilerNameLookup){ var template = Handlebars.template(' + current_contents + '); template.Name = \'' + module_name + '\'; return template;});'
		);

		file.path = file.path.replace('.js', '.tpl.js');

		cb(null, file);
	});

	var jstStream = lazypipe()
	.pipe(jst)
	.pipe(map, function (file, cb)
	{
		var current_contents = file.contents.toString()
		,	module_name = path.basename(file.path, '.js');

		current_contents = current_contents.replace('function(', 'function ' + module_name + '(');

		file.contents = new Buffer(
			'define(\'' + module_name + '.tpl\', function(){ return ' + current_contents + '});'
		);

		file.path = file.path.replace('.js', '.tpl.js');

		cb(null, file);
	});

	return {handlebarsStream: handlebarsStream, jstStream: jstStream};
};


gulp.task('clean-templates', ['javascript'],function(cb)
{
	if (package_manager.isGulpLocal)
	{
		return cb();
	}

	del(dest, { force:true },  cb);
});

gulp.task('templates', function()
{
	var changed = require('gulp-changed')
	,	gulpif = require('gulp-if')
	,	map = require('map-stream')
	,	streams = buildStreams()
	,	handlebarsStream = streams.handlebarsStream
	,	jstStream = streams.jstStream;

	var result = gulp.src(package_manager.getGlobsFor('templates'))
		.pipe(package_manager.handleOverrides())
		.pipe(map(function (file, cb)
		{
			// last_template = file.path;
			var file_content = file.contents.toString();

			file.contents = new Buffer(minifyMarkup(file_content, file.path));
			cb(null, file);
		}))
		.pipe(changed(dest, {extension: '.tpl.js'}))
		.pipe(gulpif(/[.]tpl$/, handlebarsStream(), jstStream())).on('error', package_manager.pipeErrorHandler)
		.pipe(map(function (file,cb)
		{
			cb(null,file);
		}))
		.pipe(gulp.dest(dest, { mode: '0777' }));

	return result;
});


function minifyMarkup (text, filePath)
{
	var minified = text
		// remove spaces between tags.
		.replace(/\>\s+</g, '><')
		// remove html comments that our markup could have.
		.replace(/<!--[\s\S]*?-->/g, '')

		.replace(/[\n\r\s]+</g, ' <')
		.replace(/>[\n\r\s]+/g, '> ');

	if(path.extname(filePath) === '.tpl')
	{
		minified = minified
			.replace(/[\n\r\s]+\{\{/g, ' {{')
			.replace(/\}\}[\n\r\s]+/g, '}} ');
	}

	return minified;
}

// if a template contains a data-template="foo" then we must add foo.tpl as a dependency of this template because the view might include that template.
function findTemplateDependencies(content, module_name)
{
	var regex = /data-\w*\-{0,1}template=\\"([^"]+)\\"/gm
	,	result
	,	deps = ['\'Handlebars\'', '\'Handlebars.CompilerNameLookup\''];
	do
	{
		result = regex.exec(content);
		if(result && result.length > 1)
		{
			if(package_manager.distro.isSCLite)
			{
				process.dataTemplateDependencies[module_name] = process.dataTemplateDependencies[module_name] || {};
				var templatesOfTheModule = process.dataTemplateDependencies[module_name];
				templatesOfTheModule[result[1]] = result[1];
			}
			deps.push('\'' + result[1] + '.tpl\'');

		}
	}
	while(result);
	return deps;
}



gulp.task('templates.require', ['templates'], function() {});

gulp.task('watch-templates', ['templates'], function()
{
	gulp.watch(package_manager.getGlobsFor('templates'), ['templates']);
});

gulp.task('watch-templates.require', ['watch-templates'], function() { });
