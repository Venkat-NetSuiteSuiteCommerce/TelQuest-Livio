/* jshint node: true */

/*
@module gulp.deploy

This gulp task will build the project for production and push it into a netsuite's account. ASks the user about the
target netsuite account, user credentials, and the file cabinet folder they wish to deploy to.

By default it will use the folder ```DeployDistribution``` and it will delete it and re-generate it time you call it.

##User requirements:

 * By default, the 'deployer' script is required to be deployed in the target account (located in folder ns-deploy/Restlet). This script is automatically installed with the bundle and its ids are defined in distro.json > deploy.
 * The user must have web services (suitetalk) privileges.
 * An SSP application must exist into which to deploy.

##Usage

For compiling and deploying the full distribution from scratch:

	gulp deploy

By default, gulp deploy is intelligent enought to only upload the files that had changed. If you want to force all files upload, then
use

	gulp deploy --clean-manifest

Also the second time you execute the command the previous credentials, account and folder will be remember but the password.
So, if you want to re-deploy in another account/folder then you need first to remove the file .nsdeploy and you will be asked
again for credentials in the prompt:

	rm .nsdeploy
	gulp deploy

Passing ```--source``` argument the user can indicate to compile and deploy just certain gulp tasks. This
increases the deployment speed when you need to deploy just certain parts of the application when developing:

	gulp --source ssp-libraries
	gulp --source ssp-files
	gulp --source services
	gulp --source sass

If the deploy script/deploy id are not the defaults (customscript_sca_deployer / customdeploy_sca_deployer)
you can always pass these ids as arguments:

	gulp deploy --deploy-id=customdeploy_sca_deployer_2 --script-id=customscript_sca_deployer_2

The deploy will also upload all the sources in a zip file so anybody can download the distribution. Nevertheless this
is not mandatory to the deployed site to work, so it can be disabled by using the --no-backup argument.

If you have your sources already compiled you can pass --skip-compilation argument. Use this only if you know what you are doing!

*/

'use strict';

var args   = require('yargs').argv
,	gulp = require('gulp')
,	path = require('path')
,	async = require('async')
,	ns = require('../ns-deploy')
,	mapFunctions = require('../library/map-functions')
,	package_manager = require('../package-manager')
// ,	del = require('del').sync
,	shell = require('shelljs')
,	_ = require('underscore')
,	inquirer = require('inquirer')
,	fs = require('fs');

// Only if we are invoking deploy from the command line.
if (args._.indexOf('deploy') >= 0 && !args.skipCompilation)
{
	process.gulp_dest = process.gulp_dest_deploy;
	if (!args.skipCompilation)
	{
		shell.rm('-rf', process.gulp_dest);
		shell.mkdir('-p', process.gulp_dest);
}
}

function deploy(cb)
{
	shell.rm('-rf', process.gulp_dest + '/processed-macros');
	shell.rm('-rf', process.gulp_dest + '/processed-templates');
	shell.rm('-rf', process.gulp_dest + '/sass');

	// heads up! the following if implements an experimental - not documented feature for being able to deploy using only suitetalk so we don't depend on any remote suitelet.
	if(args.onlySuitetalk)
	{
		doOnlySuitetalk(cb);
		return;
	}

	var options = {};

	if (args.interactive)
	{
		options = {
			interactive: true
		};
	}
	else if (args.tag || args.description)
	{
		options = {
			tag: args.tag
		,	description: args.description
		};
	}
	if(args.to)
	{
		options.newDeploy = true;
	}
	if(args.m)
	{
		options.molecule = args.m;
	}

	var files = [path.join(process.gulp_init_cwd, '.nsdeploy')];

	if(args.f)
	{
		files = args.f.split(',');
	}

	if(args.password)
	{
		inquirer.prompt(
		{
				type: 'password'
			,	name: 'password'
			,	message: 'Password'
			,	validate: function(input)
				{
					return input.length > 0 || 'Please enter a password';
				}
			}
		,	function(answers)
			{
				options.password = answers.password;
				runDeploy(files, options, cb);
			}
		);
	}
	else
	{
		runDeploy(files, options, cb);
	}
}

function runDeploy(files, options, cb)
{
	var tasks = _.map(files, function(file){
	return function(cb)
		{
			var configs = package_manager.getTaskConfig('deploy', []);
			options.distroName = package_manager.distro.name;
			options.file = file;
			options.scriptId = configs.scriptId;
			options.deployId = configs.deployId;
			options.publicList = configs.publicList;
			options.backup = configs.backup;

			var license_text = package_manager.distro.license.text;

			if(args.instrumentBc)
			{
				var customRequireJsPath = path.join(package_manager.getModuleFolder('ViewContextDumper'), '/JavaScript/require.custom.bc.js')
				var customRequireFsContents = fs.readFileSync(customRequireJsPath).toString()
				fs.writeFileSync(path.join(process.gulp_dest, 'javascript', 'require.js'), customRequireFsContents)
			}

			gulp.src(process.gulp_dest + '/**')
				.pipe(mapFunctions.mapAddLicense(license_text))
				.pipe(ns.deploy(options))
				.on('end', function()
				{
					cb();
				});
		};
	});

	async.series(tasks, function(err)
	{
		cb(err);
		process.exit();
	});
}

function deployVersion ()
{
	return gulp.src('./version.txt')
			.pipe(gulp.dest(process.gulp_dest), { mode: '0777' });
}

function doOnlySuitetalk()
{
	console.log('\n*** Deploying using only SuiteTalk. Experimental! ***\n');

	var CredentialsInquirer = require('credentials-inquirer');
	var credentialsInquirer = new CredentialsInquirer();
	credentialsInquirer.credentials.vm = args.vm;
	credentialsInquirer.credentials.molecule = args.m;
	credentialsInquirer.credentials.nsVersion = args.nsVersion;
	credentialsInquirer.credentials.applicationId = args.applicationId;

	credentialsInquirer.main()
	.then(function()
	{
		var credentials = credentialsInquirer.credentials
		,	jsUploaderCredentials = credentialsInquirer.getAsNsUploader(credentials);

		var Uploader = require('ns-uploader');
		credentials = {
			email: jsUploaderCredentials.email
		,	password: jsUploaderCredentials.password
		,	roleId: jsUploaderCredentials.roleId
		,	account: jsUploaderCredentials.account
		,	molecule: jsUploaderCredentials.molecule
		,	vm: jsUploaderCredentials.vm
		,	nsVersion: jsUploaderCredentials.nsVersion
		,	applicationId: jsUploaderCredentials.applicationId
		};

		var config = {
			targetFolderId: jsUploaderCredentials.target_folder
		,	sourceFolderPath: process.gulp_dest_deploy
		};
		var t0 = new Date().getTime();
		var uploader = new Uploader(credentials);

		var bar;
		var Progress = require('progress');
		uploader.addProgressListener(function(actual, total)
		{
			if(!bar)
			{
				bar = new Progress('Uploading [:bar] :percent', {
					complete: '='
				,	incomplete: ' '
				,	width: 50
				,	total: total
				});
			}
			bar.tick(1);
		});

		uploader
		.main(config)
		.then(function ()
		{
			var took = ((new Date().getTime() - t0)/1000/60) + '';
			took = took.substring(0, Math.min(4, took.length)) + ' minutes';
			console.log('Deploy finished, took', took);
		})
		.catch(function(err)
		{
			console.log('ERROR in deploy', err, err.stack, '.\nDeploy aborted. ');
		});
	})
	.catch(function(err)
	{
		console.log('Error obtaining credentials: ', err, err.stack, '.\nDeploy aborted. ');
	});
	return;
}


var source = ['default'];
if (args.source)
{
	source = args.source.split(',');
}
else if (args.skipCompilation)
{
	source = [];
}
else if (args.dev)
{
	source = ['services','ssp-libraries','ssp-files', 'scripts'];
}
source.push('deploy-version');

gulp.task('deploy-version', deployVersion);


gulp.task('deploy',	source, deploy);
gulp.task('deploy-no-deps', deploy);

gulp.task('rollback', function(cb)
{
	ns.rollback(cb);
});
