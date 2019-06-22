var _ = require('underscore')
,	shell = require('shelljs')
,	package_manager = require('../package-manager/')

,	distro = package_manager.distro
,	path = require('path')

,	exec = require('./exec')

,	distroUtil = require('./distro-util')
,	fs = require('fs')
,	esprima = require('esprima')

describe('gulp languages', function()
{
	var SCALocales = ['cs_CZ', 'da_DK', 'de_DE', 'en_US', 'es_AR', 'es_ES', 'fr_CA', 'fr_FR', 'it_IT', 'ja_JP', 'ko_KR', 'nl_NL', 'pt_BR', 'ru_RU', 'sv_SE', 'th_TH', 'tr_TR', 'zh_CN', 'zh_TW']

	it('init', function(cb)
	{
		shell.cp('-f', 'distro.json', 'distro_backup.json'); 
		shell.rm('-rf', distro.folders.distribution)
		cb()
	}); 

	it('gulp languages', function(cb)
	{
		exec('gulp', ['languages'], function(code)
		{
			expect(code).toBe(0);
			cb();
		});
	});

	it('should generate language files for each app', function(cb)
	{
		package_manager.distro.tasksConfig.javascript.forEach(function(config)
		{
			SCALocales.forEach(function(locale)
			{
				var fileName = path.join(distro.folders.distribution, 'languages', path.basename(config.exportFile, '.js')) + '_' + locale + '.js';
				
				expect(shell.test('-f', fileName)).toBe(true)
				var jsFile = shell.cat(fileName)
				try
				{
					var syntax = esprima.parse(jsFile);
					expect(syntax.body.length > 0).toBe(true);
				}
				catch(ex)
				{
					expect(ex).toBe(undefined);
					cb();
				}
			})
		})
		cb()
	});

	it('end', function()
	{ 
		shell.cp('-f', 'distro_backup.json', 'distro.json'); 
	})

}); 
