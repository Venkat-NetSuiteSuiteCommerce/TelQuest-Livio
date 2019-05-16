var shell = require('shelljs')
,	path = require('path')

module.exports = {

	distroFile: 'distro.json'

,	read: function()
	{
		return JSON.parse(shell.cat(this.distroFile));
	}

,	write: function(distro)
	{
		JSON.stringify(distro, null, '\t').to(this.distroFile);
	}

,	installModule: function(srcFolder, targetFolder)
	{
		targetFolder = targetFolder || 'cool_store_custom'
		shell.mkdir('Modules/' + targetFolder);
		shell.cp('-rf', 
			path.join(__dirname, srcFolder), 
			'Modules/' + targetFolder);
		var version = srcFolder.split('@')[1];
		var moduleName = path.basename(srcFolder.split('@')[0])

		var distro = this.read(); 
		console.log('installing module '+targetFolder + '/' + moduleName+', version: '+version)
		distro.modules[targetFolder + '/' + moduleName] = version; 	
		this.write(distro);		
	}

	// @method uninstallModule @param module somesing like 'suitecommerce/Address@1.0.0'
,	uninstallModule: function(module)
	{
		var version = module.split('@')[1];
		var moduleName = module.split('@')[0];
		var distro = this.read();
		delete distro.modules[moduleName];
		this.write(distro);
		shell.rm('-rf', 'Modules/' + module);
	}

}