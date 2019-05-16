var shell = require('shelljs')
,	package_manager = require('../package-manager')
,	exec = require('./exec')
,	request = require('request')
,	async = require('async')
,	esprima = require('esprima')

describe('gulp local', function() 
{
	var port = parseInt(package_manager.distro.tasksConfig.local.http.port, 10);
	var url = 'http://localhost:'+port+'/';
	var gulpLocal

	it('port must be unused', function(done) 
	{
		request(url, function (error, response, body)
		{
			expect(error && error.code === 'ECONNREFUSED')
			done();
		});
	});	

	it('start gulp local and wait till port is taken', function(done) 
	{
		var interval = setInterval(function()
		{
			request(url, function (error, response, body) 
			{
				if(!error)
				{
					clearTimeout(interval)
					// gulpLocal.kill('SIGHUP')
					expect(body.toString().indexOf('<body')!==-1).toBe(true)
					done() 
				}
			});
		}, 1000);
		gulpLocal = exec('gulp', ['local'], function(code)
		{
			// expect(code!==0).toBe(true)
		});
	});	

	it('should serve declared jaavscript file which are valid', function(done)
	{
		async.eachSeries(package_manager.distro.tasksConfig.javascript, function(jsapp, cb)
		{
			request(url+'javascript/'+jsapp.exportFile, function (error, response, body)
			{
				expect(!!error).toBe(false)
				try
				{
					var syntax = esprima.parse(body);
					expect(syntax.body.length > 0).toBe(true);
				}
				catch(ex)
				{
					expect(ex).toBe(undefined);
					cb(ex);
				}
				cb(null)
			});
		}, 
		done)
	});

	it('kill the process', function(done)
	{
		process.kill(gulpLocal.pid)
		done();
	})

});
