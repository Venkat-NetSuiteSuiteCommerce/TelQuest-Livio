/* jshint node: true */
/*
@module gulp.local

This gulp task will start a local development environment server. The idea is to have a agile development environment
where the user just modify the project JavaScript, Sass, Less and templates and they are automatically compiled and
even the browser is reloaded to show the changes.

##JavaScript

For compiling JavaScript internally it uses the task 'gulp javascript' so it support two main modalities

#Usage: compiilng JavaScript like in production

	gulp local

#Usage: loading JavaScript with require js

This is more agile for working because JavaScript don't need to be compiled:

	gulp local --js require

##Implementation

Files are watched using nodejs watch and when changes are detected specific gulp task are called to compiling files,
like gulp javascript, gulp sass, gulp templates etc.

*/

'use strict';

var gulp = require('gulp')
,	gutil = require('gulp-util')
,	package_manager = require('../package-manager')
,	batch_logger = require('../library/batch-logger')
,	_ = require('underscore')
,	fs = require('fs')
,	path = require('path')
,	args   = require('yargs').argv
,	express = require('express')
,	child_process = require('child_process')
,	serveIndex = require('serve-index');

function initServer(cb)
{
	var http_config = package_manager.getTaskConfig('local.http', false)
	,	https_config = package_manager.getTaskConfig('local.https', false);

	if (!http_config && !https_config)
	{
		gutil.log('No server configuration specified in the files');
		cb();
	}

	(args.nginx ? initServerNginx : initServerExpress)(http_config, https_config, cb);
}

function initServerExpress(http_config, https_config, cb)
{
	var app = express();

	// Allow CORS requests in server
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		next();
	});

	app.use('/', express.static(process.gulp_dest));
	app.use('/Modules', express.static(package_manager.env.srcDir));
	app.use('/', serveIndex(process.gulp_dest));
	app.use('/Modules', serveIndex(package_manager.env.srcDir));

	// we also serve jasmine library for the unit tests
	var jasmine = package_manager.getModuleFolder('jasmine');

	if(jasmine)
	{
		app.use('/jasmine', express.static(jasmine));
		app.use('/jasmine', serveIndex(jasmine));
	}

	var logger = batch_logger();

	// Starts the http server
	if (http_config)
	{
		app.listen(http_config.port, '0.0.0.0', cb);
		logger.push('+- Local http server available at: ', gutil.colors.cyan(
			'http://localhost:' + http_config.port + '/'
		));
	}

	// Starts the https server
	if (https_config)
	{
		var https = require('https')
		,	keyfile
		,	certfile;

		try
		{
			keyfile = process.env[https_config.key] || https_config.key;
			certfile = process.env[https_config.cert] || https_config.cert;

			var https_options = {
				key: fs.readFileSync(keyfile, 'utf8')
			,	cert: fs.readFileSync(certfile, 'utf8')
			};

			var server = https.createServer(https_options, app);

			server.listen(https_config.port, '0.0.0.0');
			logger.push('+- Local https server available at: ', gutil.colors.cyan(
				'https://localhost:' + https_config.port + '/'
			));
		}
		catch(ex)
		{
			logger.push(gutil.colors.red('+- Could not start secure local server. Reason: ' + ex.toString()));
		}
	}

	// cb();
	logger.push('+- Watching current folder: ', gutil.colors.cyan(path.join(process.cwd(), 'Modules')));
	logger.push('+- To cancel Gulp Watch enter: ', gutil.colors.cyan('control + c'));
	logger.flush();
}

function initServerNginx(http_config, https_config, cb)
{
	var nginxBasePath = path.resolve(path.join('gulp', 'nginx'));
	var configTemplate = fs.readFileSync(path.join(nginxBasePath, 'configuration.tpl'), 'utf8');
	var httpTemplate  = fs.readFileSync(path.join(nginxBasePath, 'http.conf.tpl'), 'utf8');
	var httpsTemplate  = fs.readFileSync(path.join(nginxBasePath, 'https.conf.tpl'), 'utf8');

	var templateOptions = {
		http_config: !!http_config
	,	https_config: !!https_config
	,	rootDir: path.resolve('.')
	,	localDistributionPath: JSON.stringify(process.gulp_dest)
	,	srcDir: package_manager.env.srcDir
	};

	var configResult = _.template(configTemplate, templateOptions);
	fs.writeFileSync(path.join(nginxBasePath, 'configuration'), configResult, 'utf8');

	if(http_config)
	{
		var httpResult = _.template(httpTemplate, templateOptions);
		fs.writeFileSync(path.join(nginxBasePath, 'http.conf'), httpResult, 'utf8');
	}

	if(https_config)
	{
		templateOptions.keyfile = process.env[https_config.key] || https_config.key;
		templateOptions.certFile = process.env[https_config.cert] || https_config.cert;
		var httpsResult = _.template(httpsTemplate, templateOptions);
		fs.writeFileSync(path.join(nginxBasePath, 'https.conf'), httpsResult, 'utf8');
	}

	var nginxArguments = [
		'-c', 'configuration'
	,	'-p', nginxBasePath
	];

	try
	{
		fs.mkdirSync(path.join(nginxBasePath, 'temp'));
	}
	catch(err)
	{
	}

	try
	{
		fs.mkdirSync(path.join(nginxBasePath, 'logs'));
	}
	catch(err)
	{
	}


	var nginx_process = child_process.spawn('nginx', nginxArguments, { stdio: [0,1,2] });
	cb = _.once(cb);
	nginx_process.on('error', cb);
	setTimeout(function(){ cb(null, nginx_process); }, 2000);
}

module.exports = {
	initServerNginx: initServerNginx,
	initServerExpress: initServerExpress,
	initServer: initServer
};

gulp.task('local-install', function()
{
	// just define a flag so other tasks know if they must exit on error or not. i.e. when 'gulp local' we don't want to kill the local server on sass, handlebars, javascript errors.
	package_manager.isGulpLocal = true;	
});

gulp.task('init-server', initServer);

gulp.task('local', function(cb) 
{
	//this are the dependecies of the task "local"
	var sequence = require('run-sequence');
	sequence('local-install',['frontend', 'watch', 'javascript-entrypoints'], 'init-server', cb);
});

// TODO remove in the future
gulp.task('local-nginx', [], function(cb)
{
	cb('Use gulp local --nginx');
});
