var shell = require('shelljs')
,	package_manager = require('../package-manager/')
,	distro = package_manager.distro
,	distroUtil = require('./distro-util')
,	exec = require('./exec')
,	path = require('path')


describe('The template specified with', function() 
{
	var s = "";
	beforeAll(function(cb)
	{
		//make a backup of the distro.json
		shell.cp('-f', 'distro.json', 'distro_backup_override.json');
		//install a module that override a template and require other one using data-template attribute
		distroUtil.installModule('assets/custom_modules/LiteCustomizationExamples@1.0.0', 'cool_store_custom');

		//delete LocalDistribution folder
		shell.rm('-rf', distro.folders.distribution)

		exec('gulp', ['javascript'], function(code)
		{
			expect(code).toBe(0);			
			s = distro.isSCLite ? shell.cat(path.join(distro.folders.distribution, 'tmp', 'shopping-templates.js')) : shell.cat(path.join(distro.folders.distribution, 'javascript', 'shopping.js'));			
			cb();
		});
	});

	afterAll(function()
	{
		//restore the distro.json
		shell.mv('-f', 'distro_backup_override.json', 'distro.json');
	});
	
	it('data-template needs to be included in the compiled templates file', function()
	{
		expect(s).toContain('my_facet_items_empty_phone');
	});

	it('data-phone-template needs to be included in the compiled templates file', function()
	{
		expect(s).toContain('my_facet_items_empty_phone');		
	});

	it('data-tablet-template needs to be included in the compiled templates file', function()
	{
		expect(s).toContain('my_facet_items_empty_tablet');		
	});
});