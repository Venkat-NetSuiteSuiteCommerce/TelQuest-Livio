// webdriverio script that opens a jasmine spec page and will output results to stdout. the client js code will notify when the test 
// finish running - and this is done in the jasmine generator defined at gulp/tasks/unit-test.js

var webdriverio = require('webdriverio')
,	Q = require('q')
; 

var options = {
	desiredCapabilities: {
		browserName: 'chrome'
	}
}
,	url = 'http://localhost:7777/test1.html'

,	fail = false;

webdriverio
	.remote(options)
	.init()
	.url(url)

    .timeoutsAsyncScript(15000)
	.executeAsync(function(done)
	{
		var timer = setInterval(function()
		{
			if(window.jasmineDone)
			{
				clearInterval(timer);
				done(true)
			}
		}, 100)
	})
	.execute(function()
	{
		var msg = document.querySelectorAll('.alert .passed').length ? document.querySelectorAll('.alert .passed')[0].innerHTML : 'fail'; 
		return JSON.stringify({
			failed: document.querySelectorAll('.symbol-summary .failed').length
		,	msg: msg
		});
	})
	.then(function(result)
	{
		// console.log('result', result)
		var value = JSON.parse(result.value)
		console.log(value.msg);
		fail = value.failed;
	})
	.end()
	.then(function()
	{
		process.exit(fail ? 1 : 0);
	});
