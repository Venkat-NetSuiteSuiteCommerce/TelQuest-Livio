/* jshint node: true */

/*
@module gulp.format
#gulp format

This gulp task will run the SASS code indentation tool so the code comply to our coding style standards.

##Usage: formatting a single module

	gulp format-sass --module ProductList

##Usage: formatting all modules

	gulp format-sass

*/

'use strict';

var gulp = require('gulp')
,	package_manager = require('../package-manager')
,	args   = require('yargs').argv
,	cssfmt = require('gulp-cssfmt');

gulp.task('format-sass', function ()
{
	var globs;
	if (args.module)
	{
		globs = package_manager.getGlobsForModule(args.module, 'sass');
	}
	else
	{
		globs = package_manager.getGlobsFor('sass');
	}

	if (globs.length)
	{
		return gulp.src(globs)
			.pipe(package_manager.handleOverrides())
			.pipe(cssfmt())
			.pipe(gulp.dest(function(file) {
				return file.base;
			}, { mode: '0777' }));
	}
});
