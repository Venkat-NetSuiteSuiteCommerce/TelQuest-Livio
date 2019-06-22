function Deployment(options)
{
	'use strict';

	this.options = options;
	this.deployment_folder = new Folder(this.options.target_folder);
}


Deployment.prototype.deploy = function()
{
	'use strict';

	var deployment_result = {files: []}
	,	self = this;

	this.options.files.forEach(function(file)
	{
		//nlapiLogExecution('DEBUG', file.path, file.setIsOnline);
		var file_id = self.deployment_folder.writeFile(file.path, file.type, file.contents, file.setIsOnline);
		deployment_result.files.push({
			path: file.path
		,	id: file_id
		,	type: file.type
		});
	});

	this.backup();

	return deployment_result;
};


// var FILE_LIMIT = 200000;
var FILE_LIMIT = 5242880;


Deployment.prototype.backup = function()
{
	'use strict';

	this.options.deployment_time = Date.now();
	var file_name = new Date().toISOString().replace('T', ' ').substring(0, 18);

	var payload = JSON.stringify(this.options);

	if (payload.length > FILE_LIMIT)
	{
		var parts = []
		,	files = this.options.files
		,	files_payload = JSON.stringify(files)
		
		for(var i = 0; i < Math.ceil(files_payload.length / FILE_LIMIT); i++)
		{
			var part_name = file_name + '.files.part-' + (i+1) + '.json'
			,	part_id = this.deployment_folder.writeFile(
					'backups/' + part_name
				,	'PLAINTEXT'
				,	files_payload.slice(FILE_LIMIT * i, FILE_LIMIT * (i + 1))
				);

			parts.push({
				name: part_name
			,	id: part_id
			});
		}
		
		delete this.options.files;
		this.options.files_parts = parts;

		this.deployment_folder.writeFile(
			'backups/' + file_name + '.json'
		,	'PLAINTEXT'
		,	JSON.stringify(this.options)
		);

		this.options.files = files;
		delete this.options.files_parts;
	}
	else
	{
		this.deployment_folder.writeFile(
			'backups/' + file_name + '.json'
		,	'PLAINTEXT'
		,	payload
		);
	}
};


Deployment.prototype.getBackups = function()
{
	'use strict';
	return this.deployment_folder.getChildFolder('backups').getChildFiles().map(function(file)
	{
		var content = JSON.parse(file.getValue());
		content.file_id = file.getId();
		content.file_name = file.getName();

		delete content.files;
		delete content.files_parts;

		return content;
	});
};

