/* jshint node: true */
'use strict';

var map = require('map-stream')
,	path = require('path')
,	args   = require('yargs').argv;

module.exports = {

	dev: function(stream)
	{
		return this.passThrough(args.dev, stream);
	}

,	notDev: function(stream)
	{
		return this.passThrough(!args.dev, stream);
	}

,	passThrough: function(condition, stream)
	{
		if (condition)
		{
			return stream;
		}
		else
		{
			return map(function(file, cb)
			{
				cb(null, file);
			});
		}
	}
,	map_renamer: function(files_map)
	{
		return map(function(file, cb)
		{
			file.path = path.resolve(path.dirname(path.resolve(file.path)), files_map[file.path]);
			cb(null, file);
		});
	}
};