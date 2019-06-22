/*
@module gulp.clean

This will clean up all generated files, mainliy these are the folders Distribution and Deploy. 

##Usage

	gulp clean

*/

var	gulp = require('gulp')
,	del = require('del');

gulp.task('clean', function(cb)
{
	'use strict';

	del([process.gulp_dest_distro, process.gulp_dest_deploy], function (err)
	{
		cb(err);
	});
});