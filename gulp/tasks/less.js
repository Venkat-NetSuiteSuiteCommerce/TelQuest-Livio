/* jshint node: true */

/*
@module gulp.less

This gulp task will compile the project's less stylesheets generating a .css file.

##Usage: compile all project's less files

	gulp less

##Declaring less in ns.package.json

The less files are those referenced by the property gulp.less in module's ns.package.json file. Example:

	{
		"gulp": {
			...
		,	"less": [
				"Less/*.less"
			]
			...
		}
	}

*/

'use strict';

var gulp = require('gulp')
,	less = require('gulp-less')
,	path = require('path')
,	gif = require('gulp-if')
,	chmod = require('gulp-chmod')
,	sourcemaps = require('gulp-sourcemaps')
,	minifyCSS = require('gulp-minify-css')

,	args   = require('yargs').argv

,	package_manager = require('../package-manager');


gulp.task('less', function()
{
	var globs = package_manager.getGlobsFor('less');

	if (!globs.length)
	{
		return null;
	}

	/// use sourcemaps taking precedence to argv --less sourcemap and then to local task lessSourcemap definition
	var useSourcemaps = args.less === 'sourcemap' || 
		package_manager.isGulpLocal && package_manager.getTaskConfig('local.lessSourcemap', false);

	// This should be temporal untill we find a better solution or move to a new css precompiler
	return gulp.src(globs)
		.pipe(package_manager.handleOverrides())
		.pipe(gif(useSourcemaps, sourcemaps.init()))
		.pipe(less({
			paths: ['./Modules']
		})).on('error', package_manager.pipeErrorHandler)
		.pipe(gif(args.compress, minifyCSS({ keepSpecialComments: '*' })))
		.pipe(gif(useSourcemaps, sourcemaps.write('.')))
		.pipe(chmod({write: true}))
		.pipe(gulp.dest(path.join(process.gulp_dest, 'css')));
});

gulp.task('watch-less', [], function()
{
	// need to watch every file because package_manager.getGlobsFor('less') doesn't return dependencies
	gulp.watch(package_manager.getGlobsFor('less'), ['less']);
});
