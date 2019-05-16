/* jshint node: true */
'use strict';

var gulp = require('gulp')
,	_ = require('underscore')
,	map = require('map-stream')
,	vm = require('vm')
,	path = require('path')
,	chmod = require('gulp-chmod')

,	insert = require('gulp-insert')

,	concat = require('gulp-concat')
,	jst = require('gulp-jst')
,	changed = require('gulp-changed')

,	package_manager = require('../package-manager');


gulp.task('macros-jst', function()
{
	var globs = package_manager.getGlobsFor('macros');

	if (!globs.length)
	{
		return null;
	}
	
	var dest = path.join(process.gulp_dest, 'processed-macros', 'raw');
	
	return gulp.src(globs)
		.pipe(package_manager.handleOverrides())
		.pipe(changed(dest, {extension: '.macro.js'}))
		.pipe(jst())
		.pipe(map(
			function(file, cb)
			{
				var macros = {};
				var sandbox = {
					_: _
				,	context: {
						registerMacro: function(name, fn)
						{
							var original_source = fn.toString()
							,	prefix = '\\n\\n<!-- MACRO STARTS: ' + name + ' -->\\n'
							,	posfix = '\\n<!-- MACRO ENDS: ' + name + ' -->\\n'
								// Adds comment lines at the begining and end of the macro
								// The rest of the mumbo jumbo is to play nice with underscore.js
							,	modified_source = ';var __t, __p = \'\', __e = _.escape, __j = Array.prototype.join;try{var __p="' + prefix + '";' + original_source.replace(/^function[^\{]+\{/i, '').replace(/\}[^\}]*$/i, '') +';__p+="' + posfix + '";return __p;}catch(e){SC.handleMacroError(e,"'+ name +'")}' || []
								// We get the parameters from the string with a RegExp
							,	parameters = original_source.slice(original_source.indexOf('(') + 1, original_source.indexOf(')')).match(/([^\s,]+)/g) || [];

							parameters.push(modified_source);

							// Add the macro to SC.macros
							macros[name] = Function.apply(null, parameters);
						}
					}
				};

				try
				{
					vm.runInNewContext('var tmp = ' + file.contents.toString() + '; tmp(context)', sandbox);

					var result = '';
					_.each(macros, function(macro_fn, macro_name)
					{
						result += macro_fn.toString().replace('function anonymous(', '\'' + macro_name + '\': function ' + macro_name + '(') + ',';
					});
					result = result.slice(0, -1);

					file.path = file.path.replace('.js', '.macro.js');
					file.contents = new Buffer(result);
					cb(null, file);
				}
				catch(err)
				{
					throw new Error('Error compiling macro:' + file.path + ': ' + err);
				}

			}
		))
		.pipe(chmod({write: true}))
		.pipe(gulp.dest(dest));
});


gulp.task('macros', ['macros-jst'], function()
{
	return gulp.src(path.join(process.gulp_dest, 'processed-macros', 'raw', '*.macro.js'))
		.pipe(package_manager.handleOverrides())
		.pipe(concat('Macros.js', {newLine: ','}))
		.pipe(insert.wrap('define(\'Macros\', function(){ return SC.macros = {', '};});'))
		.pipe(gulp.dest(path.join(process.gulp_dest, 'processed-macros')));
});


gulp.task('watch-macros', function()
{
	gulp.watch(package_manager.getGlobsFor('macros'), ['macros']);
});
