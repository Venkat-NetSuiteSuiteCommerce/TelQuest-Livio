
var gulp = require('gulp');

gulp.task('watch',
	[
		'frontend'
	,	'watch-javascript'
	,	'watch-sass'
	,	'watch-languages'
	,	'watch-fonts'
	,	'watch-images'
]);
