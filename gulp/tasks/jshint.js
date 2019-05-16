/* jshint node: true */

/*
@module gulp.jshint
#gulp jshint

This gulp task will run jshint on all the project's JavaScript files or only in a given list of modules

##Usage: Doing jshint in given modules

	gulp jshint --modules ProductList,Utilities

##Usage: Doing jshint in all modules

	gulp jshint

*/

'use strict';

var gulp = require('gulp')
,	args   = require('yargs').argv
,	package_manager = require('../package-manager')
,	JshintReporter = require('../jshint-reporter')
,	jshint = require('gulp-jshint')
,	fs = require('fs')
,	gif = require('gulp-if');

gulp.task('jshint', function()
{
	var globs
	,	report = {}
	,	modules = args.modules;

	if(modules)
	{
		modules = modules.split(',');
	}

	globs = package_manager.getGlobsForJSHint(modules);
	
	if (globs.length)
	{
		var stream= gulp.src(globs)
			.pipe(package_manager.handleOverrides())
			.pipe(jshint())
			.pipe(gif(args.reporter === 'json', new JshintReporter(report), jshint.reporter('jshint-stylish')));

		if (args.reporter === 'json')
		{
			stream.on('end', function ()
			{
				fs.writeFileSync('jshintReport.json', JSON.stringify(report.results, null, 2), 'utf-8');
			});
		}

		return stream;
	}

	else if (args.reporter === 'json')		
	{
		fs.writeFileSync('jshintReport.json', JSON.stringify({stats: {}}, null, 2), 'utf-8');
	}
});
