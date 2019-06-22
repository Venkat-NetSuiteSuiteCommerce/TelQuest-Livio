var shell = require('shelljs')
,	package_manager = require('../package-manager')
,	exec = require('./exec')
,	path = require('path')
,	_ = require('underscore')

describe('ns_npm_repository dependencies tests', function()
{
	var initialDir = shell.pwd()
	it('preconditions', function()
	{
		shell.cd(path.join(__dirname, '../../ns_npm_repository/preconditions'))
		expect(shell.exec('npm install').code).toBe(0);
		expect(shell.exec('npm test').code).toBe(0);
	})
	it('suitetalk4node', function()
	{
		shell.cd(path.join(__dirname, '../../ns_npm_repository/suitetalk4node'))
		expect(shell.exec('npm install').code).toBe(0);
		expect(shell.exec('npm test').code).toBe(0);
	})
	it('ns-uploader', function()
	{
		shell.cd(path.join(__dirname, '../../ns_npm_repository/ns-uploader'))
		expect(shell.exec('npm install').code).toBe(0);
		expect(shell.exec('npm test').code).toBe(0);
	})
	
	it('end', function()
	{
		shell.cd(initialDir)
	})
})