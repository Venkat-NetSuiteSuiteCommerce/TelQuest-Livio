/* jslint node: true */
"use strict";
var map = require('map-stream');


function writeReport (reportJSON, file)
{
	if (file.hasOwnProperty('jshint') && !file.jshint.success)
	{
		var result = {
			"title": file.path.replace(/.*[\\\/]/, ''),
			"fullTitle": file.path
		};

		reportJSON.results.stats.failures = reportJSON.results.stats.failures + 1;
		result.error = failure_message(file.jshint.results, file.path) + ": " + failure_details(file.jshint.results);
		reportJSON.results.failures.push(result);
	}
	//no return - reportJSON and file arguments past by reference
}

function encode(s) {
	var pairs = {
		"&": "&amp;",
		'"': "&quot;",
		"'": "&apos;",
		"<": "&lt;",
		">": "&gt;"
	};
	for (var r in pairs) {
		if (typeof (s) !== "undefined") {
			s = s.replace(new RegExp(r, "g"), pairs[r]);
		}
	}
	return s || "";
}

function failure_message (failures, file_name)
{
	var result = (failures.length === 1 ? "1 Failure" : (failures.length + " Failures")) + " on file: " + file_name;
	console.log(result);
	return result;
}

function failure_details (failures)
{
	var msg = [];
	var item;
	for (var i = 0; i < failures.length; i = i + 1)
	{
		item = failures[i];
		msg.push(i + 1 + ". line " + item.error.line + ", char " + item.error.character + ": " + encode(item.error.reason));
		console.log("line " + item.error.line + ", char " + item.error.character + ":\t " + item.error.reason);
	}
	console.log('\n\n');
	return msg.join("\n");
}

module.exports = function (reportJSON)
{
	reportJSON.results = reportJSON.results || {
		stats: {
			"passes": 0,
			"failures": 0
		}
	};

	reportJSON.results.failures = [];

	return map(function (file, cb)
	{
		writeReport(reportJSON, file);
		cb(null, file);
	});
};