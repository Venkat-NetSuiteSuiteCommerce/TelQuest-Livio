var shell = require('shelljs')
,	path = require('path')
,	fs = require('fs')
,	package_manager = require('../package-manager')
,	exec = require('./exec')
,	distroUtil = require('./distro-util')

describe('ssp-files', function() 
{
	it('make sure the module is not installed', function() 
	{
		distroUtil.uninstallModule('cool_store_custom/MyModule2@1.0'); 
	});	

	it('backup distro.json and copy our module', function(cb) 
	{
		shell.cp('-f', 'distro.json', 'distro_backup.json'); 
		distroUtil.installModule('assets/custom_modules/MyModule2@1.0', 'cool_store_custom')
		exec('gulp', ['ssp-files'], function(code)
		{
			expect(code).toBe(0); 		
			cb();
		});		
	});	
		
	it('verify it works', function()
	{
		var content = shell.cat('LocalDistribution/MyModule2_one.ssp');
		expect(content.length > 0).toBe(true); 
		expect(content.indexOf('var something=\'hello\',bar=\'world\';console.log([something,bar].join(\' \'))')!==-1).toBe(true); 
		expect(content.indexOf('var since this is invalid javascript it wont be transformed')!==-1).toBe(true); 
		expect(/something\?t=\d+/.exec(content) !== null).toBe(true); 
	}); 

	it('restore backup', function()
	{
		shell.mv('-f', 'distro_backup.json', 'distro.json')
		distroUtil.uninstallModule('cool_store_custom/MyModule2@1.0'); 
	}); 

});
