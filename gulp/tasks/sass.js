/* jshint node: true */
/*
@module gulp.sass

This gulp task will compile the project's sass stylesheets generating a .css file.

##Implementation

It uses lib-sass Sass implementation so it is faster that the estandar implementation.

##Usage: compile all project's sas files

	gulp sass

##Declaring sass in ns.package.json

The sass files are those referenced by the property gulp.sass in module's ns.package.json file. Example:

	{
		"gulp": {
			...
		,	"sass": [
				"Sass/*.scss"
			]
			...
		}
	}

*/

'use strict';

var path = require('path')

,	gulp = require('gulp')
,	del = require('del')
,	fs = require('fs')
,	bless = require('gulp-bless')
,	map = require('map-stream')
,	sass = require('gulp-sass')
,	glob = require('glob').sync
,	_ = require('underscore')
,	sourcemaps = require('gulp-sourcemaps')

,	package_manager = require('../package-manager')
,	Handlebars = require('handlebars')
,	args   = require('yargs').argv
,	gif = require('gulp-if');

var tmp = path.join(process.gulp_dest, 'sass')
,	dest = path.join(package_manager.getNonManageResourcesPath(), 'css')
,	dest_ie = path.join(package_manager.getNonManageResourcesPath(), 'css_ie');

// It's needed add an extra Sass file as a dependency of MyAccount when 'styleguide' task is called.
// This action is required only to build the Styleguide site.
var styleguide = args._.indexOf('styleguide') !== -1;

//Auxiliary task that generate a file structure where all files per module are flatten.
//This task is which enable just specifying the scss file name in the distro.json instead of all its path
gulp.task('sass-prepare', function (cb)
{
	var sass_configuration = package_manager.getTaskConfig('sass', {}),
		sass_src = package_manager.getGlobsFor('sass');

	if (!sass_src.length)
	{
		cb();
	}

	// _styleguide.scss file will add a depency of MyAccount application.
	if (styleguide) {
		var application = _.find(sass_configuration.applications, function (application) {
			return application.exportFile === 'myaccount.css';
		});

		if (application) {
			var dependency = _.find(application.dependencies, function (dependency) {
				return dependency.module === 'BaseSassStyles';
			});

			if (dependency) {
				dependency.include.push('base/_styleguide.scss');
			}
		}
	}

	gulp.src(sass_src)
		.pipe(package_manager.handleOverrides())
		.pipe(map(function (file, cb)
		{
			var relative_path = file.path.replace(file.base, '');
			file.base = path.join(file.cwd);
			file.path = path.join(file.base, package_manager.getModuleForPath(file.path).moduleName, relative_path);

			cb(null, file);
		}))
		//In the latest version of node-sass when a escaped character like '\f085' appears it is transformed into its representation
		//instead of maintained
		.pipe(map(function (file, cb)
		{
			var re = /:\s*\"\\(f.*?)\"/ig
			,	file_content = file.contents.toString();

			if (re.test(file_content))
			{
				var data = file_content.replace(re,':\"\\\\$1\"');
				file.contents = new Buffer(data);
			}

			cb(null, file);
		}))
		.pipe(gulp.dest(tmp, { mode: '0777' }))
		.on('end', function () {
			// _styleguide.scss is copied to 'LocalDistribution/sass/BaseSassStyles/base'.
			if (styleguide) {
				gulp.src('gulp/library/sc5-styleguide/lib/app/css-suitecommerce/_styleguide.scss')
					.pipe(gulp.dest(path.join(tmp, 'BaseSassStyles/base'), { mode: '0777' }))
					.on('end', function() {
						cb();
					});
			} else {
				cb();
			}
		});
});


gulp.task('clean-sass-tmp', ['sass'], function (cb)
{
	if (package_manager.isGulpLocal)
	{
		return cb();
	}

	del(tmp, {force: true}, cb);
});

function getFilesFromGlobs (globs_patterns)
{
	var full_paths = _.flatten(_.map(globs_patterns, function (pattern)
		{
			return glob(pattern);
		}));

	var result = [];
	_.each(full_paths, function (full_path_file)
	{
		if (!package_manager.isOverrideFile(full_path_file))
		{
			result.push(path.basename(full_path_file, '.scss').substr(1));
		}
	});

	return result;
}


gulp.task('sass', ['generate-sass-index'], function ()
{
	var config = package_manager.getTaskConfig('sass', {})
	,	variables_string = '';

	config.variables = config.variables || {};

	// Creates a sass snipet for the variables that came from the distro
	if (config && config.variables && Object.keys(config.variables).length)
	{
		Object.keys(config.variables).forEach(function (key)
		{
			variables_string += '$' + key + ': ' + JSON.stringify(config.variables[key]) + ';\n';
		});
	}

	/// use sourcemaps taking precedence to argv --sass sourcemap and then to local task sassSourcemap definition
	var useSourcemaps = package_manager.isGulpLocal || args.sass === 'sourcemap';

	/// use blessing
	var blessSASS = !package_manager.isGulpLocal && (args.bless || package_manager.getTaskConfig('sass.bless', true));

	var sassOptions = {
		includePaths: [tmp]
	};
	// compressing and using sourcemaps doesn't go well together. So they not are used at the same time
	if(!useSourcemaps)
	{
		sassOptions.outputStyle = 'compressed';
	}
	return gulp.src(path.join(tmp, '**/*.scss'))
		.pipe(package_manager.handleOverrides())
		.pipe(map(function (file, cb)
		{
			// Adds the Variables snipet we created before.
			if (path.basename(file.path).indexOf('_') !== 0 && variables_string.length)
			{
				var template = Handlebars.compile(file.contents.toString())
				,	result = template(config.variables);

				file.contents = new Buffer(variables_string + result);
			}

			cb(null, file);
		}))
		.pipe(gif(useSourcemaps, sourcemaps.init()))
		.pipe(sass(sassOptions)).on('error', package_manager.pipeErrorHandler)
		.pipe(map(function (file, cb)
		{
			//file.path = path.join('default', 'css', path.basename(file.path));
			file.path = path.basename(file.path);
			file.base = '.';
			cb(null, file);
		}))
		//Un-enconde special characters
		.pipe(map(function (file, cb)
		{
			var re = /:\s*\"\\(\\f.*?)\"/ig
			,	file_content = file.contents.toString();

			var data = file_content.replace(re,':\"$1\"');
			file.contents = new Buffer(data);

			cb(null, file);
		}))
  		.pipe(gif(useSourcemaps, sourcemaps.write('.')))
		.pipe(gulp.dest(dest, { mode: '0777' }))
		.pipe(gif(blessSASS, bless({
			imports: false
		})))
		.pipe(gif(blessSASS, map(function (file, cb)
		{
			file.path = file.path.replace('-blessed', '_');
			cb(null, file);
		})))
		.pipe(gif(blessSASS, gulp.dest(dest_ie, { mode: '0777' })));
});

gulp.task('watch-sass', [], function()
{
	var to_execute = ['sass'];

	// If styleguide task was called, 'styleguide:generate' and 'styleguide:applystyles' tasks will be added to the 'watch' task.
	if (styleguide) {
		to_execute = to_execute.concat(['styleguide:generate', 'styleguide:applystyles']);
	}

	// need to watch every file because package_manager.getGlobsFor('sass') doesn't return dependencies
	gulp.watch('./Modules/**/*.scss', to_execute);
});






// generate sass index


var generateSassIndex = function(application, distro)
{
	var file_dependencies = []
		,	file_dependencies_never_prefix = []
		,	file_index_content = ''
		,	file_index_content_never_prefix = ''
		,	module_files = [];

	_.each(application.dependencies, function (dependency)
	{
		dependency = _.isString(dependency) ? {module: dependency} : dependency;

		if (dependency.include)
		{
			module_files = mapFileNameToPath(dependency, dependency.include);
		}
		else
		{
			var globs = package_manager.getGlobsForModule(dependency.module, 'sass')
			,	files = getFilesFromGlobs(globs);

			if (dependency.exclude)
			{
				module_files = mapFileNameToPath(dependency, _.difference(files, dependency.exclude));
			}
			else
			{
				module_files = mapFileNameToPath(dependency, files);
			}
		}
		if (dependency.neverPrefix)
		{
			file_dependencies_never_prefix = file_dependencies_never_prefix.concat(module_files);
		}
		else
		{
			file_dependencies = file_dependencies.concat(module_files);
		}
	});

	file_index_content = file_dependencies.join('\n');
	file_index_content_never_prefix = file_dependencies_never_prefix.join('\n');

	if (application.prefixAllWith)
	{
		file_index_content = application.prefixAllWith + ' {\n' + file_index_content + '\n}';
	}

	var final_output = file_index_content_never_prefix + '\n' + file_index_content;
	return final_output;
}


function mapFileNameToPath (dependency, files)
{
	var useRealPaths = args.sassIndexPreserveOriginalPath;
	return _.map(files, function (file_name)
	{
		if(!useRealPaths)
		{
			// example: @import "../twitter-bootstrap-sass/variables";
			return '@import "../' + dependency.module + '/' + file_name + '";';
		}
		else
		{
			// example: twitter-bootstrap-sass@3.3.1/assets/stylesheets/bootstrap/_tables.scss
			// in this case we resolve to the real file path that match ns.package.json sass glob

			var packageJson = glob('Modules/*/' + dependency.module + '@*/ns.package.json') //TODO : do this with package_manager
			packageJson = packageJson[0] // TODO: what if there is ore than one ns.package.json ?
			packageJson = JSON.parse(fs.readFileSync(packageJson).toString())
			var sassGlobs = path.join(package_manager.getModuleFolder(dependency.module), packageJson.gulp.sass[0])
			var sassFileFound = glob(sassGlobs).filter(function(file)
			{
				var file_name_no_ext = path.basename(file, '.scss')
				file_name_no_ext = file_name_no_ext.startsWith('_') ? file_name_no_ext.substring(1, file_name_no_ext.length) : file_name_no_ext
				var finalFile = path.join(path.dirname(file), file_name_no_ext + '.scss')

				var originalNameWithoutExtension = path.basename(file_name, '.scss')

				return path.basename(finalFile, '.scss') == originalNameWithoutExtension

				// return finalFile.endsWith(originalNameWithoutExtension+'.scss')
			})

			if(!sassFileFound || !sassFileFound.length)
			{
				console.log('Error: gulp sass dependency file not found, module: ', dependency.module,
					'file name: ', file_name,
					'trying to resolve glob: ', sassGlobs,
					'that matches : ', glob(sassGlobs)
				);
				sassFileFound = []
			}
			// else if(sassFileFound.length > 1)
			// {
			// 	console.log('gulp sass warning: more than one sass file matched for', dependency.module, file_name, ', including all:  ', sassFileFound)
			// }
			sassFileFound = sassFileFound.map(function(fileFound)
			{

				fileFound = fileFound.split('/')
				fileFound.splice(0, 2)
				fileFound = fileFound.join('/')
				fileFound = fileFound.substring(0, fileFound.length-'.scss'.length)

				// remove the '_' from file name:
				var outFileName = path.basename(fileFound)
				outFileName = outFileName.startsWith('_') ? outFileName.substring(1, outFileName.length) : outFileName
				outFileName = path.join(path.dirname(fileFound), path.basename(outFileName, '.scss'))

				return '@import "../' +  outFileName.replace(/\\/g, '/') + '";'
			})

			return sassFileFound.join('\n')

		}
	});
}


gulp.task('generate-sass-index', ['sass-prepare'], function ()
{
	var sass_configuration = package_manager.getTaskConfig('sass', {});

	_.each(sass_configuration.applications, function (application)
	{
		var output = generateSassIndex(application, package_manager.distro)
		,	new_module_folder_name = path.join(tmp, application.name);
		try
		{
			fs.mkdirSync(new_module_folder_name);
		}
		catch (ex)
		{
			if (ex && ex.code !== 'EEXIST')
			{
				console.log('Error creating folder:', new_module_folder_name);
			}
		}
		fs.writeFileSync(path.join(new_module_folder_name, application.name.toLowerCase() + '.scss'), output);
	});
});
