var shell = require('shelljs')
,	package_manager = require('../package-manager')
,	exec = require('./exec')
,	package_manager = require('../package-manager/')
,	distro = package_manager.distro
,	distroUtil = require('./distro-util')
,	_ = require('underscore')
,	path = require('path')
describe('file patch', function() 
{

	it('remove LocalDistribution folder', function()
	{
		shell.rm('-rf', distro.folders.distribution)
		shell.cp('-f', 'distro.json', 'distro_backup_override.json'); 
	});

	it('make sure the module is not installed', function(cb) 
	{
		distroUtil.uninstallModule('cool_store_custom/NightSkin@1.0'); 
		shell.rm('-rf', distro.folders.distribution)
		exec('gulp', ['sass'], function(code)
		{
			expect(code).toBe(0);
			var exportFile = distro.tasksConfig.sass.applications[0].exportFile;
			console.log('seba', path.join(distro.folders.distribution, 'css', exportFile))
			var s = shell.cat(path.join(distro.folders.distribution, 'css', exportFile))
			expect(s.indexOf('#132435')!==-1).toBe(false)
			cb();
		});
	});	

	it('install module and execute gulp javascript', function(cb) 
	{
		distroUtil.installModule('assets/custom_modules/NightSkin@1.0', 'cool_store_custom');
		
		shell.rm('-rf', distro.folders.distribution)
		exec('gulp', ['sass'], function(code)
		{
			expect(code).toBe(0);
			var exportFile = distro.tasksConfig.sass.applications[0].exportFile;
			var s = shell.cat(path.join(distro.folders.distribution, 'css', exportFile))
			expect(s.indexOf('#132435')!==-1).toBe(true)
			cb();
		});
	});	

	it('restore backup', function()
	{
		shell.mv('-f', 'distro_backup_override.json', 'distro.json')
		distroUtil.uninstallModule('cool_store_custom/NightSkin@1.0'); 
	}); 
});
