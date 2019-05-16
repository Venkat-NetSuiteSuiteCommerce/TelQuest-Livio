var ROOT = '/home/sg/Perforce/sgurin_pown_2/Platform_Solutions/ECommerce/Reference_Implementations/'


var _ = require('underscore')
,	shell = require('shelljs')
,	fs = require('fs')
,	suitetalk = require('suitetalk')
,	glob = require('glob')
,	package_manager = require('../package-manager')
,	exec = require('./exec')
,	path = require('path')

//hardcoded DATA - account, target distro.json to test, and some file internalids
var nsdeploy = {
    'distroName': 'SuiteCommerce Advanced Denali',
    'email': 's@gurin.com',
    'account': '3690872',
    'role': 3,
    'hostname': 'rest.netsuite.com',
    'target_folder': '49279',
    'password': 'Test123$$$'
}

var shoppingCssInternalId = '131533';

// suitetalk init:
nsdeploy.roleId = nsdeploy.role; 

suitetalk.setCredentials(nsdeploy);


describe('gulp deploy', function()
{
	var timestamp = 'body_content_' + new Date().getTime();

	it('remote file should not contain the timestamp', function(cb)
	{
		suitetalk.get({
			recordType: 'file'
		,	internalId: shoppingCssInternalId
		})
		.then(function(response)
		{
			var readResponse = response.getResponse[0].readResponse[0]; 
			var content =  new Buffer(readResponse.record[0].content[0].trim(), 'base64').toString();
			expect(content.indexOf(timestamp)).toBe(-1)
			cb();
		})
		.catch(function(err){expect(err).toBe(undefined); cb(); })
	});

	it('modify the sources and deploy', function(cb)
	{
		var cssRule = '\nbody:after{content:"' + timestamp + '"}\n'

		var baseSassStylesFolder = package_manager.getModuleFolder('suitecommerce/BaseSassStyles');
		baseSassStylesFolder = path.join('Modules', baseSassStylesFolder, 'Sass', '_base.scss')
		cssRule.toEnd(baseSassStylesFolder)
		JSON.stringify(nsdeploy, null, 2).to('.nsdeploy')

		exec('gulp', ['deploy', '--no-backup'], function(code)
		{
			expect(code).toBe(0);
			cb();
		});
	})

	it('remote file should contain the timestamp', function(cb)
	{
		suitetalk.get({
			recordType: 'file'
		,	internalId: shoppingCssInternalId
		})
		.then(function(response)
		{
			var content =  new Buffer(response.getResponse[0].readResponse[0].record[0].content[0].trim(), 'base64').toString();
			expect(content.indexOf(timestamp)===-1).toBe(false)
			cb();
		})
		.catch(function(err){expect(err).toBe(undefined); cb(); })
	});


	it('clean', function()
	{
		shell.rm('-rf', 'test1');
		shell.rm('-rf', 'test2');
	})
})
