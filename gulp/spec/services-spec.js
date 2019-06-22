var _ = require('underscore')
,	shell = require('shelljs')
,	package_manager = require('../package-manager/')

,	distro = package_manager.distro
,	path = require('path')

,	exec = require('./exec')

,	distroUtil = require('./distro-util')
,	fs = require('fs')


describe('gulp services', function()
{
	it('start', function()
	{
		shell.cp('-f', 'distro.json', 'distro_backup.json'); 
		distroUtil.uninstallModule('cool_store_custom/MyModule2@1.0'); 
		shell.rm('-rf', distro.folders.distribution)
	})
	it('rm -rf LocalDistribution && gulp services', function(cb)
	{
		exec('gulp', ['services'], function(code)
		{
			expect(code).toBe(0);
			expect(!!shell.cat(path.join(distro.folders.distribution, 'services/MyModule2.Service.ss'))).toBe(false)
			cb();
		});
	});
	it('install MyModule2.0 && gulp services', function(cb)
	{
		distroUtil.installModule('assets/custom_modules/MyModule2@1.0', 'cool_store_custom');
		shell.rm('-rf', distro.folders.distribution)
		exec('gulp', ['services'], function(code)
		{
			expect(code).toBe(0);
			expect(shell.cat(path.join(distro.folders.distribution, 'services/MyModule2.Service.ss')).indexOf('function service')!==-1).toBe(true)
			cb();
		});
	});

	it('end', function()
	{
		distroUtil.uninstallModule('cool_store_custom/MyModule2@1.0'); 
		shell.cp('-f', 'distro_backup.json', 'distro.json'); 
	})

}); 
