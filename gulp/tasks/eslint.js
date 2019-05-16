/* jshint node: true */

'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var args   = require('yargs').argv;
var gIf = require('gulp-if');

var jsonlint = require('jsonlint');
var fs = require('fs');
var _ = require('underscore');

var modulesToLint = args.lintfiles || 'Modules/**/*.js';

if( args.pdistrolint ) {
    var distroFilePath = 'distros/' + args.pdistro + '.part.json';
    var distroFile = jsonlint.parse(fs.readFileSync(distroFilePath, {encoding: 'utf8'}));

    if ( distroFile && distroFile.modules && _.keys(distroFile.modules).length >= 1 ) {
        modulesToLint = [];
        _.each(distroFile.modules, function(ver, moduleName) {
            modulesToLint.push('Modules/' + moduleName + '@' + ver + '/**/*.js');
        });
    }
}

gulp.task('eslint', function() {
    return gulp.src(modulesToLint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(gIf(!args.nolint, eslint.failAfterError()));
});