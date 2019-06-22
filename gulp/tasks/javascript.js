/* jshint node: true */

/*
@module gulp.javascript
#gulp javascript

This gulp task will compile the project's javascript output. It support two different kind of compilation:

## Compiling for production

For generating production code we use the amd-optimizer build tool that will generate all the required
JavaScript code dependencies from a application's Starter.js file that is declared in distro.json file
property javascript->entryPoint. Then, some extra tools like minification thorough uglify and/or sourcemap.
Also for performance reasons the final output is transformed using the tool amdclean.
can be done as well. Examples:

	gulp javascript
	gulp javascript --js sourcemap
	gulp javascript --js require
	gulp javascript --noamdclean
	gulp javascript --nouglify

Notice that generating sourcemaps or running uglify can take longer.

##Compiling for development

We support compilation type suited for development using the argument '--js require'. This will generate a requirejs
config file pointing to the real files in Modules/. This way you don't need to do any compilation on your JavaScript
files, just save them and reload your browser. This task is called indirectly when running our development environment using:

	gulp local --js require

##Declaring javascript in ns.package.json

The javascript files that are able to be compiled are those referenced by the property gulp.javascript
in module's ns.package.json file. Also the compiled templates (using gulp templates). Example:

	{
		"gulp": {
			...
		,	"javascript": [
				"JavaScript/*"
			]
		}
	}

*/

'use strict';

var path = require('path')

,	gulp = require('gulp')
,	_ = require('underscore')

,	package_manager = require('../package-manager')
,	fs = require('fs')
,	File = require('vinyl')
,	through = require('through')

,	amdOptimize = require('amd-optimize')
,	sourcemaps = require('gulp-sourcemaps')
,	uglify = require('gulp-uglify')
,	amdclean = require('../amdclean')
,	concat = require('gulp-concat')
,	map = require('map-stream')
,	add = require('gulp-add')
,	gif = require('gulp-if')
,	async = require('async')
,	args   = require('yargs').argv


var dest = path.join(process.gulp_dest, 'javascript');

var isSCIS = !package_manager.distro.isSCA && !package_manager.distro.isSCLite;

var almondNSPackage = 'almond'
var almondNSPackageSection = 'javascript'
if(args.instrumentBc){
	almondNSPackage = 'ViewContextDumper'
	almondNSPackageSection = 'instrumented-javascript'
}

function getGlobs()
{
	return _.union(
		[path.join(process.gulp_dest, 'processed-templates', '*.js')]
	,	package_manager.getGlobsFor('javascript')
	,	[path.join(process.gulp_dest, 'javascript-dependencies', '*.js')]
	,	package_manager.getGlobsFor('unit-test-files')
	);
}

// templateManifests
// In SCLite we don't have javascript and so we are not able to calculate the templates dependencies for an application.
// Then we generate templates manifests for each application so another task is able to compile them.
function templateManifests(config)
{
	var files = [];
	var onFile = function(file)
	{
		var fileIsTemplate = file.path.match(/\.tpl\.js$/) ||
			path.basename(file.path).indexOf('handlebars.runtime') === 0 ||
			path.basename(file.path).indexOf('Handlebars.CompilerNameLookup') === 0;

		if (!fileIsTemplate)
		{
			this.emit('data', file);
		}
		else if (file.path.match(/\.tpl\.js$/))
		{
			files.push(path.basename(file.path));
		}
	};

	var onEnd = function()
	{
		var manifestName = 'templates-manifest-' + path.basename(config.exportFile, '.js') + '.json';
		fs.writeFileSync(manifestName, JSON.stringify(files, null, 2));

		this.emit('end');
	};

	return through(onFile, onEnd);
}

function compileSCA(config, cb, generateTemplateManifests)
{
	var stream = gulp.src(getGlobs())
		.pipe(package_manager.handleOverrides());

	requireJSCopy();

	var useRequire = args.js === 'require' ||
			package_manager.isGulpLocal &&
			package_manager.getTaskConfig('local.jsRequire', false) && args.js !== 'compile';

	if (!useRequire)
	{
		var indexContent =	'require.config(' + JSON.stringify(config.amdConfig) + ');\n' +
							'require([' + (isSCIS ? '\'almond\', ' : '') + '\'' + config.entryPoint + '\']);\n'

		//	--noamdclean takes precedence over the config.amdclean setting from the distro.json file
		,	useAMDclean = args.noamdclean === undefined && config.amdclean || args.noamdclean !== undefined && !args.noamdclean
		,	indexModule = (!useAMDclean) ? config.entryPoint+'.index' : config.entryPoint
		,	doUglify = !args.nouglify && !package_manager.isGulpLocal;

		stream = stream
			.pipe(gif(!useAMDclean, add(indexModule + '.js', indexContent)))
			.pipe(gif(args.js === 'sourcemap', sourcemaps.init()))
			.pipe(amdOptimize(indexModule, config.amdConfig)).on('error', package_manager.pipeErrorHandler)
			.pipe(gif(generateTemplateManifests, templateManifests(config)))
			.pipe(concat(config.exportFile))
			.pipe(gif(doUglify, uglify({preserveComments: 'some'}))).on('error', package_manager.pipeErrorHandler)
			.pipe(gif(args.js === 'sourcemap', sourcemaps.write('.')));
	}
	else
	{
		stream = stream.pipe(generateStarterLocalFiles(config));
	}

	stream.pipe(gulp.dest(dest), { mode: '0777' });
	stream.on('end', function()
	{
		cb();
	});
}
function compileTemplates(config, cb)
{
	// @function getAMDIndexFile builds an index file that depends on all given files - to be used as amdoptimize's index
	// @return {index:String,content:String} @param {Array} requiredFiles @param config
	function getAMDIndexFile(requiredFiles, config)
	{
		var requiredModules = _.map(requiredFiles, function(f){return path.basename(f, '.js');});
		var indexName = 'SCLite_' + path.basename(config.exportFile, '.js') + '_templates';
		var counter = 0;

		var indexContent =
			'define(\''+indexName+'\', [' +
			_.map(requiredModules, function(m){if(m.indexOf('handlebars.runtime') === 0){return '\'Handlebars\''; }return '\'' + m + '\''; }).join(', ') +
			'], function(' +
			_.map(requiredModules, function(){counter++;return 'a'+counter;}).join(', ') +
			'){});';

		return {name: indexName, content: indexContent};
	}

	function getOnlyTemplatesGlobs(config)
	{
		var shell = require('shelljs')
		,	glob = require('glob').sync
		var appName = path.basename(config.exportFile, '.js');
		var templateManifest = 'templates-manifest-' + appName + '.json';
		if(!shell.test('-f', templateManifest))
		{
			return [];
		}
		templateManifest = JSON.parse(shell.cat(templateManifest));

		var templatesToAdd = {};

		var templates = _.map(templateManifest, function(templateFile)
		{
			var parentTemplate = path.basename(templateFile, '.tpl.js');
			templatesToAdd = _.extend(templatesToAdd, process.dataTemplateDependencies[parentTemplate] || {});
			return path.join(process.gulp_dest, 'processed-templates', templateFile);
		});
		templates = _.union(templates, _.map(templatesToAdd, function(t)
		{
			return path.join(process.gulp_dest, 'processed-templates', t+'.tpl.js');
		}));

		// we will recreate another override map to be more performant
		if(!package_manager.overrides.mapLocal)
		{
			package_manager.overrides.mapLocal = {};
			_.each(package_manager.overrides.map, function(val, key)
			{
				var p = path.join(process.gulp_dest, 'processed-templates', path.basename(key) + '.js');
				package_manager.overrides.mapLocal[p] = val;
			});
		}
		var files = _.union(
			[path.join(process.gulp_dest, 'javascript-libs.js')]
		,	templates
		);
		return files;
	}

	var requiredFiles = getOnlyTemplatesGlobs(config);
	var indexFile = getAMDIndexFile(requiredFiles, config);
	var outputFile = path.basename(config.exportFile, '.js') + '-templates' + '.js';
	var doUglify = !args.nouglify && !package_manager.isGulpLocal;
	var amdOptimizeConfig = _.extend(config.amdConfig, {preserveFiles:true, preserveComments:true});
	gulp.src(requiredFiles)
		.pipe(add(indexFile.name + '.js', indexFile.content))
		.pipe(amdOptimize(indexFile.name, amdOptimizeConfig)).on('error', package_manager.pipeErrorHandler)
		.pipe(concat(outputFile))

		.pipe(gif(doUglify, uglify({preserveComments: 'some'}))).on('error', package_manager.pipeErrorHandler)

		.pipe(gulp.dest(path.join(package_manager.getNonManageResourcesPath()), { mode: '0777' }))

		.on('end', cb);
}

function processJavascript(cb)
{
	var configs = package_manager.getTaskConfig('javascript', []);

	configs = _.isArray(configs) ? configs : [configs];
	async.each(
		configs
	,	function(config, cb)
		{
			//this is to build the SCL distribution (yo n:release) and for SCA
			if(package_manager.distro.isSCA || (package_manager.distro.isSCLite && args.generateAllJavaScript))
			{
				compileSCA(
					config
				, 	function(){
						compileTemplates(config, cb);
					}
				,	true
				);
			}
			//this is for the developer of a SCL website
			else if(package_manager.distro.isSCLite)
			{
				compileTemplates(config, cb);
			}
			//used for SCIS
			else
			{
				compileSCA(config, cb, false);
			}

		}
	,	function()
		{
			cb();
		}
	);
}

// generates a bootstrapper script that requires the starter script using require.js
function generateStarterLocalFiles(config)
{
	var paths = {};

	var onFile = function(file)
	{
		var normalized_path = path.resolve(file.path)
		,	moduleName = path.basename(normalized_path, '.js')
		,	override_info = package_manager.getOverrideInfo(normalized_path);

		if (override_info.isOverriden)
		{
			normalized_path = override_info.overridePath;
		}

		var relativePath = path.relative(dest, normalized_path).replace(/\\/g,'/').replace(/\.js$/, '');
		paths[moduleName] = relativePath;
	};

	var fixPaths = function()
	{
		_.each(config.amdConfig.paths, function(renamedModuleName, originalModuleName)
		{
			paths[originalModuleName] = paths[renamedModuleName];
		});
	};

	var onEnd = function()
	{
		fixPaths();

		var entry_point = config.entryPoint
		,	require_config = _.defaults({ paths: paths }, config.amdConfig);

		require_config.waitSeconds = 0;
		delete require_config.baseUrl;

		var	starter_content = _.template(
			'try {\nrequire.config(<%= require_config %>);\nrequire(<%= entry_point %>)\n} catch(e) { };'
		,	{
				require_config: JSON.stringify(require_config, null, '\t')
			,	entry_point: JSON.stringify([entry_point])
			}
		);

		var file = new File({
			path: config.exportFile,
			contents: new Buffer(starter_content)
		});

		this.emit('data', file);
		this.emit('end');
	};

	return through(onFile, onEnd);
}

module.exports = {
	generateStarterLocalFiles: generateStarterLocalFiles
};

function requireJSCopy()
{
	return gulp.src(package_manager.getGlobsForModule('require.js', 'javascript'))
		.pipe(gulp.dest(dest, { mode: '0777' }));
}

function ensureFolder(name)
{
	try
	{
		fs.mkdirSync(name);
	}
	catch(ex)
	{

	}
}

gulp.task('javascript-entrypoints', [], function()
{
	var configs = package_manager.getTaskConfig('javascript', []);
	ensureFolder(process.gulp_dest);
	ensureFolder(path.join(process.gulp_dest, 'javascript-dependencies'));
	_(configs).each(function(config)
	{
		var contentPrefix = ''
		if(args.instrumentBc)
		{
			if(!_.contains(config.dependencies, 'ViewContextDumper'))
			{
				config.dependencies.push('ViewContextDumper');
			}
			
			contentPrefix = '\nINTRUMENT_BC_ARGUMENT = "' + args.instrumentBc + '";\n' + 
				(args.instrumentationServer ? ('INTRUMENT_BC_SERVER = "' + args.instrumentationServer + '";\n') : '')
		}

		var dependenciesModuleName = config.entryPoint + '.Dependencies';
		var fn_params = []; //we must pass the arguments because an amdclean issue
		for (var i = 0; i < _(config.dependencies).keys().length; i++) { fn_params.push('a'+i); }
		var content = contentPrefix + 'define(\''+dependenciesModuleName+'\', ' + JSON.stringify(config.dependencies) + ', function('+fn_params.join(',')+'){ return Array.prototype.slice.call(arguments); }); ';

		fs.writeFileSync(path.join(process.gulp_dest, 'javascript-dependencies', dependenciesModuleName+'.js'), content);
	});
});

gulp.task('backward-compatibility-amd-unclean', [], function(cb)
{
	var outputFile = 'backward-compatibility-amd-unclean.js'
	,	glob = require('glob').sync
	,	map = require('map-stream')
	,	doUglify = !args.nouglify && !package_manager.isGulpLocal
	,	files = _.union(
			_.flatten(_.map(package_manager.getGlobsForModule(almondNSPackage, almondNSPackageSection), function(g){return glob(g);}))
		,	_.flatten(_.map(package_manager.getGlobsForModule('SC.Extensions', 'javascript-almond-fix'), function(g){return glob(g);}))
		,	_.flatten(_.map(package_manager.getGlobsFor('javascript-ext'), function(g){return glob(g);}))
	);

	gulp.src(files)
		.pipe(map(function(file, cb)
		{
			if(path.basename(file.path, '.js') === 'almond' || path.basename(file.path, '.js') === 'LoadTemplateSafe')
			{
				var file_content = '';
				if(path.basename(file.path, '.js') === 'almond')
				{
					file_content += 'var was_undefined = (typeof define === \'undefined\');\n';
				}
				file_content += 'if(was_undefined)\n{\n';
				file_content += file.contents.toString();
				file_content += '\n}\n';

				file.contents = new Buffer(file_content);
			}
			cb(null, file);
		}))
		.pipe(concat(outputFile))
		.pipe(gif(doUglify, uglify({preserveComments: 'some'}))).on('error', package_manager.pipeErrorHandler)
		.pipe(gulp.dest(path.join(process.gulp_dest), { mode: '0777' }))
		.on('end', cb);
});

gulp.task('libs', ['backward-compatibility-amd-unclean'], function(cb)
{
	function getAMDIndexFile(requiredFiles)
	{
		var requiredModules = _.map(requiredFiles, function(f){return path.basename(f, '.js');});
		var indexName = 'index-javascript-lib';
		var counter = 0;

		var indexContent =
			'define(\''+indexName+'\', [' +
			_.map(requiredModules, function(m){if(m.indexOf('handlebars.runtime') === 0){return '\'Handlebars\''; }return '\'' + m + '\''; }).join(', ') +
			'], function(' +
			_.map(requiredModules, function(){counter++;return 'a'+counter;}).join(', ') +
			'){});';

		return {name: indexName, content: indexContent};
	}

	var	glob = require('glob').sync
	,	outputFile = 'javascript-libs.js'
	,	doUglify = !args.nouglify && !package_manager.isGulpLocal
	,	files = _.union(
			_.flatten(_.map(package_manager.getGlobsForModule(almondNSPackage, almondNSPackageSection), function(g){return glob(g);}))
		,	_.flatten(_.map(package_manager.getGlobsForModule('SC.Extensions', 'javascript-almond-fix'), function(g){return glob(g);}))
		,	_.flatten(_.map(package_manager.getGlobsForModule('handlebars', 'javascript'), function(g){return glob(g);}))
		,	_.map(package_manager.getGlobsForModule('HandlebarsExtras', 'javascript'), function(g)
			{
				return _.find(glob(g), function(f){return f.indexOf('Handlebars.CompilerNameLookup.js')!==-1;});
			})
		)
	,	indexFile = getAMDIndexFile(files)
	,	amdOptimizeConfig = {paths: {'Handlebars': 'handlebars.runtime-v4.0.10'}, preserveFiles:true, preserveComments:true};

	var mapStream = require('map-stream');

	gulp.src(files)
		.pipe(add(indexFile.name + '.js', indexFile.content))
		//.pipe(mapStream(function(file, cb){console.log(file.path); cb(null, file)}))
		.pipe(amdOptimize(indexFile.name, amdOptimizeConfig)).on('error', package_manager.pipeErrorHandler)
		.pipe(concat(outputFile))
		.pipe(gif(doUglify, uglify({preserveComments: 'some'}))).on('error', package_manager.pipeErrorHandler)
		.pipe(gulp.dest(path.join(process.gulp_dest), { mode: '0777' }))
		.on('end', cb);
});

var js_deps = ['templates', 'javascript-entrypoints'];
!isSCIS && js_deps.push('libs');

gulp.task('javascript', js_deps, processJavascript);

gulp.task('javascript-no-deps', processJavascript);

gulp.task('watch-javascript', ['watch-templates'], function()
{
	if(package_manager.distro.isSCLite)
	{
		gulp.watch(path.join(process.gulp_dest, 'processed-templates/*'), ['javascript-no-deps']);
	}
	else
	{
		gulp.watch(package_manager.getGlobsFor('javascript'), ['javascript-no-deps']);
	}
});
