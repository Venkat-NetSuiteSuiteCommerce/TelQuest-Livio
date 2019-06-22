var shell = require('shelljs')
,	package_manager = require('../package-manager')
,	exec = require('./exec')
,	package_manager = require('../package-manager/')
,	distro = package_manager.distro
,	distroUtil = require('./distro-util')
,	_ = require('underscore')
,	path = require('path')
,	fs = require('fs')

describe('file patch', function() 
{
	it('remove LocalDistribution folder', function()
	{
		shell.rm('-rf', distro.folders.distribution)
		shell.cp('-f', 'distro.json', 'distro_backup_override.json') 
	})

	it('gulp javascript without installing the module shouldnt hack require.js', function(cb) 
	{
		var distro = distroUtil.read()
		_.each(distro.tasksConfig.javascript, function(app)
		{
			app.dependencies = _.difference(app.dependencies, ['ViewContextDumper'])
		})
		distroUtil.write(distro)

		shell.rm('-rf', 'DeployDistribution')

		// Execute: 
		// gulp deploy --source javascript --noamdclean --nouglify --skip-deploy
		exec('gulp', ['deploy', 
			'--source', 'javascript', 
			'--noamdclean', 
			'--nouglify',
			'--skip-deploy'
			], function(code)
		{
			expect(code).toBe(0)
			_.each(distro.tasksConfig.javascript, function(app)
			{
				var js = fs.readFileSync(path.join('DeployDistribution', 'javascript', app.exportFile)).toString()
				expect(js.indexOf('INTRUMENT_BC_ARGUMENT')==-1).toBe(true)
				expect(js.indexOf('define(\'ViewContextDumper\'')==-1).toBe(true)
			})
			cb()
		})
	})	

	it('add ViewContextDumper in javascript dependencies but dont need to do it in modules array', function(cb) 
	{
		var distro = distroUtil.read()
		_.each(distro.tasksConfig.javascript, function(app)
		{
			app.dependencies = _.union(app.dependencies, ['ViewContextDumper'])
		})
		distroUtil.write(distro)

		// Execute: 
		// gulp deploy --source javascript --noamdclean --nouglify --skip-login --instrument-bc bracnsh123123
		exec('gulp', ['deploy', 
			'--source', 'javascript', 
			'--noamdclean', 
			'--nouglify',
			'--skip-deploy',
			'--instrument-bc', 'features-store-pickup'
			], function(code)
		{
			expect(code).toBe(0)
			_.each(distro.tasksConfig.javascript, function(app)
			{
				var js = fs.readFileSync(path.join('DeployDistribution', 'javascript', app.exportFile)).toString()
				expect(js.indexOf('INTRUMENT_BC_ARGUMENT')==-1).toBe(false)
				expect(js.indexOf('define(\'ViewContextDumper\'')==-1).toBe(false)
				
			})
			cb()
		})
	})	

	it('restore backup', function()
	{
		shell.mv('-f', 'distro_backup_override.json', 'distro.json') 
	}) 
})
