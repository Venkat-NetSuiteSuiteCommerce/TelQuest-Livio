var _ = require('underscore')
,	shell = require('shelljs')
,	package_manager = require('../package-manager/')

,	distro = package_manager.distro
,	path = require('path')

,	exec = require('./exec')

,	esprima = require('esprima');



describe('gulp javascript', function()
{
	var fileSizes = {};

	it('remove LocalDistribution folder', function()
	{
		shell.rm('-rf', distro.folders.distribution)
	});

	it('gulp javascript', function(cb)
	{
		exec('gulp', ['javascript'], function(code)
		{
			expect(code).toBe(0);
			cb();
		});
	});

	it('generates files parsable by esprima', function(cb)
	{
		_.each(distro.tasksConfig.javascript, function (config)
		{
			var filepath = path.join(distro.folders.distribution, 'javascript', config.exportFile);
			var jsfile = shell.cat(filepath);
			if(distro.isSCLite)
			{
				expect(!jsfile).toBe(true);
				cb();
			}
			fileSizes[config.exportFile] = fileSizes[config.exportFile] || {};
			fileSizes[config.exportFile].javascript = jsfile.length;
			try
			{
				var syntax = esprima.parse(jsfile);
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

	it('gulp javascript --nouglify', function(cb)
	{
		exec('gulp', ['javascript', '--nouglify'], function(code)
		{
			expect(code).toBe(0);
			cb();
		});
	});

	it('generates files parsable by esprima', function(cb)
	{
		_.each(distro.tasksConfig.javascript, function (config)
		{
			var filepath = path.join(distro.folders.distribution, 'javascript', config.exportFile);
			var jsfile = shell.cat(filepath);		
			if(distro.isSCLite)
			{
				expect(!jsfile).toBe(true);
				cb();
			}	
			fileSizes[config.exportFile] = fileSizes[config.exportFile] || {};
			fileSizes[config.exportFile].javascriptNouglify = jsfile.length;
			expect(fileSizes[config.exportFile].javascriptNouglify > fileSizes[config.exportFile].javascript).toBe(true);
			try
			{
				var syntax = esprima.parse(jsfile);
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
