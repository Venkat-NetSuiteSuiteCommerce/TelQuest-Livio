/* jshint node: true */
'use strict';

var gulp = require('gulp')
,       path = require('path')
,       package_manager = require('../package-manager')
,       chmod = require('gulp-chmod')
,       dest = path.join(process.gulp_dest, 'javascript');

gulp.task('javascript-move', function()
{
        return gulp.src(package_manager.getGlobsFor('javascript-move'))
                .pipe(chmod({ write:true }))
                .pipe(gulp.dest(dest), { mode: '0777' });
});
