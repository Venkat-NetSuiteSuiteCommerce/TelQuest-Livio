/* jshint node: true */
'use strict'

var gulp = require('gulp');
var styleguide = require('sc5-styleguide');
var sass = require('gulp-sass');
var package_manager = require('../package-manager');

var sassGlobs = 'LocalDistribution/sass/BaseSassStyles/**/*.scss';
var outputPath = 'output';
var serverPort = 3000;

gulp.task('styleguide:generate', ['sass-prepare'], function() {
  return gulp.src(sassGlobs)
    .pipe(styleguide.generate({
        title: 'SuiteCommerce - Styleguide',
        server: true,
        port: serverPort,
        rootPath: outputPath,
        overviewPath: './gulp/library/sc5-styleguide/SUITECOMMERCE-STYLEGUIDE.md',
        readOnly: true,
        disableEncapsulation: true
      }))

    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide:applystyles', ['sass'], function() {
  return gulp.src('LocalDistribution/css/myaccount.css')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);