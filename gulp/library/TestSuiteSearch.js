
var	_ = require('underscore')
,	fs = require('fs')
,	glob = require("glob").sync
,	minimatch = require("minimatch")
,	path = require('path')
,	TestCaseSearch = require('./TestCaseSearch')
;


var TestSuiteSearch = function(sourceGlobs)
{
	var self = this;


	var initialize = function()
	{
		self.sourceGlobs = sourceGlobs;
		self.suites = {};
		self.loadSuites(sourceGlobs);
	}


	self.expandSourceGlobs = function(globs)
	{
		var files = [];

		globs.forEach(function(sourceGlob)
		{
			glob(sourceGlob, {nodir: true}).forEach(function(paths)
			{
				files = files.concat(paths);
			});
		});

		return files;
	}


	self.loadSuites = function(globs)
	{
		self.sourceGlobs = Array.isArray(globs) ? globs : [globs]
		var filePaths = self.filePaths = self.expandSourceGlobs(globs);

		filePaths.forEach(function(filePath)
		{
			_.extend(
				self.suites, self.extractTestSuites(filePath)
			);
		});
	}


	self.makeTestSuiteEntry = function(testSuiteData)
	{
		var suiteSources = testSuiteData.files || testSuiteData.tests;
	
		if (Array.isArray(suiteSources))
		{
			return testSuiteData;
		}

		return null;
	}


	self.extractTestSuites = function(filePath)
	{
		var suites = {};
		var parsedData = null;

		var fileName = path.basename(filePath, '.json');

		try
		{
			parsedData = JSON.parse(
				fs.readFileSync(filePath, {encoding: 'utf8'})
			);
		}
		catch (error)
		{
			console.log("");
			console.log('\x1b[33m  WARNING! Invalid JSON file:');
			console.log("  " + filePath + '\x1b[0m');
			return suites;
		}

		var suitesData = {};
		var hasData = !_.isEmpty(parsedData) && _.isObject(parsedData);

		var isSuitesSubentry = hasData && !_.isEmpty(parsedData.suites) && _.isObject(parsedData.suites);
		
		if (isSuitesSubentry)
		{
			parsedData = parsedData.suites;
		}

		hasData = !_.isEmpty(parsedData) && _.isObject(parsedData);
		var isSingleSuite =  hasData && (parsedData.files || parsedData.tests);
		var isSuitesCollection = hasData && (_.toArray(parsedData)[0].files || _.toArray(parsedData)[0].tests);


		if (isSuitesCollection)
		{
			suitesData = parsedData;
		}
		else if (isSingleSuite)
		{
			if (parsedData.name)
			{
				suitesData[parsedData.name] = parsedData;
			}

			suitesData[fileName] = parsedData;
		}

		Object.keys(suitesData).forEach(function(suiteName)
		{
			var suiteEntry = suitesData[suiteName];
			suiteEntry = self.makeTestSuiteEntry(suiteEntry);

			if (suiteEntry)
			{
				if (Array.isArray(suitesData))
				{
					if (suiteEntry.name)
					{
						suiteName = suiteEntry.name;
					}
					else
					{
						suiteName = fileName + "_" + suiteName;
					}
				}

				var suiteKey = self.normalizeName(suiteName);
				
				suiteEntry.name = suiteName;
				suiteEntry.keyname = suiteKey;

				suiteEntry.sourceGlobs = suiteEntry.files || suiteEntry.tests;
				delete suiteEntry.tests;
				delete suiteEntry.files;

				suites[suiteKey] = suiteEntry;
			}
		});

		return suites;
	}


	self.normalizeName = function(suiteName)
	{
		if (typeof suiteName !== 'string')
		{
			throw new Error(typeof suiteName + ' is not a valid value for suiteName');
		}

		return suiteName.toLowerCase().replace(/\s/, '');
	}


	self.find = function(suiteName)
	{
		var suiteKey = self.normalizeName(suiteName);

		if (self.suites[suiteKey])
		{
			return self.suites[suiteKey];
		}

		return null;
	}


	self.getTestCasesFromSuite = function(suiteName, sourceDirs)
	{
		var testCases = [];
		var suite = self.find(suiteName);

		if (!suite)
		{
			throw new Error('Suite ' +  suiteName + ' not found.');
		}

		suite.sourceGlobs.forEach(function(srcGlob)
		{
			var filters = [];

			if (/\//.test(srcGlob))
			{
				filters.push({
					pattern: srcGlob
				,	against: 'location'
				});
			}
			else if (/\.js$/.test(srcGlob) || /^(SCA|SB|SCIS)_/.test(srcGlob))
			{
				filters.push({
					pattern: srcGlob
				,	against: 'name'
				});
			}
			else
			{
				filters.push({
					pattern: srcGlob
				,	against: 'module'
				});	
			}

			var testSearch = new TestCaseSearch(sourceDirs, filters);

			testCases = testCases.concat(
				testSearch.getTestCases()
			);
		});

		return testCases;
	}

	initialize();
}


module.exports = TestSuiteSearch;
