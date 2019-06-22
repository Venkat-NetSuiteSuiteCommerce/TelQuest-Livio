
var	_ = require('underscore')
,	fs = require('fs')
,	glob = require("glob").sync
,	minimatch = require("minimatch")
,	path = require('path')
;


var TestCaseSearch = function(sourceGlobs, filters)
{
	var self = this;

	var initialize = function()
	{
		self.sourceGlobs = [];
		self.filters = filters = self.fixFilters(filters);
		self.testEntries = [];
		self.loadEntries(sourceGlobs);
	}


	self.fixFilters = function(rawFilters)
	{
		var fixedFilters = [];

		rawFilters.forEach(function(filter)
		{
			filter = _.clone(filter);

			if (!filter.type || filter.type === 'glob')
			{
				var srcGlob = filter.pattern;
				
				// use unix dir sep
				srcGlob = srcGlob.replace(/\\/g, "/");
				// search module subdirectories in all the cases
				srcGlob = srcGlob.replace(/^\*\//, '**/');
				srcGlob = srcGlob.replace(/\/\*$/, '/**');

				filter.pattern = srcGlob;
			}

			fixedFilters.push(filter);
		});

		return fixedFilters;
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


	self.loadEntries = function(globs)
	{
		globs = Array.isArray(globs) ? globs : [globs]
		self.sourceGlobs = globs;

		var filePaths = self.filePaths = self.expandSourceGlobs(globs);

		filePaths.forEach(function(filePath)
		{
			self.testEntries.push(
				self.makeTestEntry(filePath)
			);
		});
	}


	self.makeTestEntry = function(filePath)
	{
		filePath = filePath.replace(new RegExp('\\' + path.sep), '/');

		var file = path.basename(filePath);
		var name = file.replace(/\.js$/i, '');
		var location = name;

		var module = '';
		var folder = '';


		var moduleRegex;

		if (filePath.indexOf('@') === -1)
		{
			moduleRegex = new RegExp('([^/\@]+)/[^/]+/Automation/Tests/(.*)', 'i');
		}
		else
		{
			moduleRegex = new RegExp('([^/\@]+)[^/]*/Automation/Tests/(.*)', 'i');
		}

		var moduleMatch = filePath.match(moduleRegex);

		if (moduleMatch)
		{
			module = moduleMatch[1];
			folder = path.dirname(moduleMatch[2]);

			if (folder !== '.')
			{
				location = folder + '/' + location;
			}

			location = module + '/' + location;
		}

		return {
			'name': name
		,	'module': module
		,	'location': location
		,	'filePath': filePath
		}
	}


	self.filterTestEntry = function(entry)
	{
		var testMatch = true;

		filters.forEach(function(filter)
		{
			var target = entry[filter.against];

			if (!target)
			{
				return false;
			}

			var filterType = filter.type || 'glob';

			if (filterType == 'glob')
			{
				var matchesGlob = minimatch(
					target
				,	filter.pattern.replace(/\.js$/i, '')
				,	{nocase: true}
				);

				testMatch = testMatch && matchesGlob;
			}
		});

		return testMatch;
	}


	self.getFilteredEntries = function()
	{
		return _.filter(self.testEntries, function(entry)
		{
			return self.filterTestEntry(entry);
		})
	}


	self.getTestCases = function()
	{
		return self.getFilteredEntries();
	}


	self.getFiles = function()
	{
		return _.pluck(self.getFilteredEntries(), 'filePath');
	}


	initialize();
}



module.exports = TestCaseSearch;