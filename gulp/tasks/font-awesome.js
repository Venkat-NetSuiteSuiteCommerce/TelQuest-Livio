/* jshint node: true */
'use strict';

var gulp = require('gulp')
,	path = require('path')
,	map = require('map-stream')
,	fs = require('fs')
,	xml2js = require('xml2js')
,	package_manager = require('../package-manager')

,	svg2ttf = require('gulp-svg2ttf')
,	ttf2eot = require('gulp-ttf2eot')
,	ttf2woff = require('gulp-ttf2woff');


gulp.task('font-awesome', ['sass'], function(cb)
{
	var globs = package_manager.getGlobsFor('font-awesome')
	,	dest = path.join(package_manager.getNonManageResourcesPath(), 'font-awesome');

	if (!globs || globs.length === 0)
	{
		return cb();
	}

	var move_stream = gulp.src(globs)
		.pipe(package_manager.handleOverrides())
		.pipe(gulp.dest(dest, { mode: '0777' }));

	move_stream.on('end', function()
	{
		var fa_svg = path.join(dest, 'fontawesome-webfont.svg')
		,	used_fonts = [];

		var css_stream = gulp.src(path.join(package_manager.getNonManageResourcesPath(), 'css/**/*.css'))
			.pipe(map(function(file, cb)
			{
				var new_fonts = file.contents.toString()
					.match(/content:\s*\"\\f(.*?)\"/ig);

				if (new_fonts && new_fonts.length)
				{
					used_fonts = used_fonts.concat(new_fonts.map(function(val) { return val.replace(/content:\s*\"\\/i, '').replace('"', ''); } ));
				}

				cb(null, file);
			}));

		css_stream.on('end', function()
		{
			xml2js.parseString(fs.readFileSync(fa_svg, {encoding: 'utf8'}).replace(/unicode=\"\&\#x/ig, 'unicode="'), function(err, result)
			{
				var new_glyph = [];
				result.svg.defs[0].font[0].glyph.forEach(function(glyph)
				{
					if (~used_fonts.indexOf(glyph.$.unicode.replace(';', '')))
					{
						glyph.$.unicode = '&#x' + glyph.$.unicode;
						new_glyph.push(glyph);
					}
				});

				result.svg.defs[0].font[0].glyph = new_glyph;

				var builder = new xml2js.Builder()
				,	xml = builder.buildObject(result)
				,	custom_folder = path.join(dest, 'custom')
				,	new_fa_svg =  path.join(dest, 'custom', 'fontawesome-webfont.svg');

				xml = xml.replace(/unicode=\"\&amp\;/ig, 'unicode="&');

				if (!fs.existsSync(custom_folder))
				{
					fs.mkdirSync(custom_folder);
				}
				fs.writeFileSync(new_fa_svg, xml);

				var ttf_stream = gulp.src([new_fa_svg])
					.pipe(svg2ttf())
					.pipe(gulp.dest(custom_folder, { mode: '0777' }));

				ttf_stream.on('end', function()
				{
					var eot_stream = gulp.src([path.join(dest, 'custom', 'fontawesome-webfont.ttf')])
						.pipe(ttf2eot())
						.pipe(gulp.dest(custom_folder, { mode: '0777' }));

					eot_stream.on('end', function()
					{
						gulp.src([path.join(dest, 'custom', 'fontawesome-webfont.ttf')])
							.pipe(ttf2woff())
							.pipe(gulp.dest(custom_folder, { mode: '0777' }))
							.on('end', function()
							{
								cb();
							});
					});
				});
			});

		});
	});
});
