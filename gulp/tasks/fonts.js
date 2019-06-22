/* jshint node: true */
'use strict';

var gulp = require('gulp')
,	path = require('path')
,	package_manager = require('../package-manager')
,	changed = require('gulp-changed');


gulp.task('fonts', function()
{
	var dest = path.join(process.gulp_dest, 'fonts')
	,	globs = package_manager.getGlobsFor('fonts');

	if (globs.length)
	{
		return gulp.src(globs)
			.pipe(package_manager.handleOverrides())
			.pipe(changed(dest))
			.pipe(gulp.dest(dest, { mode: '0777' }));
	}
});

gulp.task('watch-fonts', [], function()
{
	gulp.watch(package_manager.getGlobsFor('fonts'), ['fonts']);
});
