/* jshint node: true */
'use strict';

var gulp = require('gulp')

,	path = require('path')

,	package_manager = require('../package-manager')
,	helpers = require('./helpers');

gulp.task('scripts', function()
{
	return gulp.src(package_manager.getGlobsFor('scripts'))
		.pipe(package_manager.handleOverrides())
		.pipe(gulp.dest(path.join(process.gulp_dest, 'scripts'), { mode: '0777' }));
});
