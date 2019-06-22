var _ = require('underscore')
,	shell = require('shelljs')
,	package_manager = require('../package-manager/')

,	distro = package_manager.distro
,	path = require('path')
,	glob = require('glob').sync

,	exec = require('./exec')

,	esprima = require('esprima')

;

describe('gulp javascript', function()
{
	it('remove LocalDistribution folder', function()
	{
		shell.rm('-rf', distro.folders.distribution)
	});

	it('gulp templates', function(cb)
	{
		exec('gulp', ['templates'], function(code)
		{
			expect(code).toBe(0);
			cb();
		});
	});

	it('verifies that each declared template is compiled', function(cb)
	{
		// note: if some template is not compiled is estrange but not necessary an error
		var files = [];
		_.each(package_manager.getGlobsFor('templates'), function(f)
		{
			files.push(glob(f));
		});
		files = _.flatten(files);
		files = _.map(files, function(f){return path.basename(f);}); 
		_.each(files, function(f)
		{
			var tpl = shell.cat(path.join(distro.folders.distribution, 'processed-templates', f + '.js'));
			// console.log(path.join(distro.folders.distribution, 'processed-templates', f + '.js'))
			expect(tpl.length > 0).toBe(true);
			try
			{
				var syntax = esprima.parse(tpl);
				expect(syntax.body.length > 0).toBe(true);
			}
			catch(ex)
			{
				expect(ex).toBe(undefined);
				cb();
			}
		}); 
		cb();
	});
}); 
