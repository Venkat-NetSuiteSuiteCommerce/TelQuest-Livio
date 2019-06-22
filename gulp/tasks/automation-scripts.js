'use strict';

var gulp = require('gulp')
,	args = require('yargs').argv
,	glob = require('glob').sync
,	packageManager = require('../package-manager')
,	fs = require('fs')
,	path = require('path')
,	_ = require('underscore')
;


var automationCoreModule = _.findWhere(
	packageManager.contents, { moduleName: 'Automation.Core' }
);

var getAutomationCorePath = function(relPath)
{
	var automationCoreModule = _.findWhere(
		packageManager.contents, { moduleName: 'Automation.Core' }
	);

	if (!automationCoreModule)
	{
		console.log('Unable to find \'Automation.Core\' Module.');
		process.exit(1);
	}

	var automationCorePath = path.join(automationCoreModule.absoluteBaseDir, 'Automation');

	if (relPath)
	{
		automationCorePath = path.join(automationCorePath, relPath);
	}

	return automationCorePath;
};




function getAvailableScripts()
{
	var scriptLocations = packageManager
		.getGlobsFor('automation-scripts')
		.map(function(patt) {
			return glob(patt);
		});
	;

	scriptLocations = _.flatten(scriptLocations);

	var availableScripts = [];

	scriptLocations.forEach(function(scriptIndex)
	{
		availableScripts.push({
			name: path.basename(path.dirname(scriptIndex))
		,	entryFile: scriptIndex
		,	entryDir: path.dirname(scriptIndex)
		});
	});

	return availableScripts;
}


function showScripts(scriptList, headerText)
{
	if (headerText)
	{
		console.log(headerText);
	}

	scriptList.forEach(function(scriptEntry)
	{
		console.log(" - " + scriptEntry.name);
	})

	console.log("");
}


function dumpConfSummary()
{
	var creds = Preconditions.Configuration.credentials;
	console.log("\n GLOBAL CONFIGURATION SETTINGS\n");
	console.log("   Account  : " + creds.account);
	console.log("   Email    : " + creds.email);
	console.log("   RoleId   : " + creds.roleId);
	console.log("   Molecule : " + creds.molecule);
	console.log("");
}


function createAutomationEnvironment() {
	var AutomationEnv = {
		suite: {}
	,	browserAllowGeoLocation: true
	,	debug    : args.debug || args.wait || args.await || false
	,	verbose  : args.verbose
	,	pause    : parseInt(args.pause) || null
	,	highlight: args.redtrace || args.highlight || false
	,	highlightPause: args.highlightPause || args['highlight-pause'] || null
	,	dumpFile: args.dumpFile || args['dump-file'] || args['dump']
	,	preloadWebsite: args.preloadWebsite || args["preload-website"] || true
		//yargs creates automatically no-cache
	,	cache: (!_.isUndefined(args.cache)) ? args.cache : true
	}

	AutomationEnv.Browser = {
		name: args.browser || AutomationEnv.suite.browser || 'chrome'
	,	host: args.host || AutomationEnv.suite.host
	,	port: args.port || AutomationEnv.suite.port
	}

	AutomationEnv.SuiteTalk = {
		'itemSearchDefaultLimit': args['suitetalk-item-search-limit'] || 30
	}

	return AutomationEnv;
}


gulp.task('automation-scripts', [], function()
{

	var availableScripts = getAvailableScripts();

	var scriptNameArgument = args.run;

	if (scriptNameArgument)
	{
		var scriptName =  scriptNameArgument.toLowerCase();
		var scriptEntry = availableScripts.find(function(scriptEntry)
		{
			return scriptName === scriptEntry.name.toLowerCase();
		});

		if (scriptEntry)
		{
			global.AutomationEnvironment = createAutomationEnvironment();

			global.PackageManager = require(getAutomationCorePath('Lib/PackageManager'));
			global.Preconditions = require('preconditions');
			
			var ErrorHandling = PackageManager.require('Automation.Core/Automation/JasmineHelpers/ErrorHandling');

			var Configuration = PackageManager.require('Automation.Precondition/Automation/Preconditions/Configuration.Module');
			global.Preconditions.Configuration = Configuration;

			Configuration.loadConfiguration(function(err, config)
			{
				console.log("\n EXECUTING SCRIPT: " + scriptEntry.name + '\n');
				dumpConfSummary();
				
				require(path.resolve(scriptEntry.entryFile));
			});
		}
		else
		{
			showScripts(availableScripts, "\n Available scripts:\n");
			console.log('\n Unable to find automation script with name "' + scriptNameArgument + '"\n')
		}
		
		return;
	}

	showScripts(availableScripts, "\n Available scripts:\n");
	console.log("\n Usage: gulp automation-scripts --run scriptname\n")
});
