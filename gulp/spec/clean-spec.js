// var shell = require('shelljs')
// ,	package_manager = require('../package-manager')
// ,	exec = require('./exec')

// describe('gulp --clean', function() 
// {
// 	it('gulp --clean should delete folders Backups and Distribution', function(cb) 
// 	{
// 		shell.mkdir(package_manager.distro.folders.distribution);
// 		expect(shell.test('-d', package_manager.distro.folders.distribution)).toBe(true);
		
// 		// shell.mkdir('Backups');
// 		// expect(shell.test('-d', 'Backups')).toBe(true);
		
// 		shell.mkdir(package_manager.distro.folders.deploy);
// 		expect(shell.test('-d', package_manager.distro.folders.deploy)).toBe(true);

// 		exec('gulp', ['clean'], function(code)
// 		{
// 			expect(code).toBe(0);
// 			expect(shell.test('-d', package_manager.distro.folders.deploy)).toBe(false);
// 			expect(shell.test('-d', package_manager.distro.folders.distribution)).toBe(false);
// 			// expect(shell.test('-d', 'Backups')).toBe(false);
// 			cb();
// 		});		
// 	});	
// });
