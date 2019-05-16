/*
jasmine custom reporter proposal for all netsuite Commerce Applications automation. Usage: 

	jasmine.getEnv().addReporter(require('./ns-jasmine-reporter.js'));

*/

var _ = require('underscore');
var Class = function(){}

_.extend(Class.prototype, {

	jasmineStarted: function(suiteInfo) 
	{
		console.log('Running suite with ' + suiteInfo.totalSpecsDefined);
	}

,	suiteStarted: function(result) 
	{
		console.log('Suite started: ' + result.description + ' whose full description is: ' + result.fullName);
	}

,	specStarted: function(result) 
	{
		console.log('Spec started: ' + result.description + ' whose full description is: ' + result.fullName);
	}

,	specDone: function(result) 
	{
		console.log('Spec: ' + result.description + ' was ' + result.status);
		for(var i = 0; i < result.failedExpectations.length; i++) 
		{
			console.log('Failure: ' + result.failedExpectations[i].message);
			console.log(result.failedExpectations[i].stack);
		}
	}

,	suiteDone: function() 
	{
		console.log('Suite: ' + result.description + ' was ' + result.status);
		for(var i = 0; i < result.failedExpectations.length; i++) 
		{
			console.log('AfterAll ' + result.failedExpectations[i].message);
			console.log(result.failedExpectations[i].stack);
		}
	}

,	jasmineDone: function() 
	{
		console.log('Finished suite');
	}
});

module.exports = Class;
