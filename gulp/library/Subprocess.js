var	_ = require('underscore')
,	spawn = require('child_process').spawn	
;

var subprocess = function(cmd, args, options, callback)
{
	if (_.isEmpty(options))
	{
		options = {}
	}

	if (_.isEmpty(options.stdio))
	{
		options.stdio = [
			0, // use parents stdin for child
			1, // use parent's stdout stream - IMPORTANT if we dont do this things like the spinner will break the automation.
			2  // fs.openSync('err.out', 'w') // direct child's stderr to a file
		]
	}

	var child = spawn(cmd, args, options);

	child.on('close', function()
	{
		callback.apply(null, arguments); 
	});

	return child;
};


module.exports = subprocess;