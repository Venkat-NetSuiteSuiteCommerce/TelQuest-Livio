

function Folder(id)
{
	'use strict';

	this.id = id;
	if (arguments.length === 2)
	{
		this.name = arguments[1];
	}
	this.known_dirs = {};
}


Folder.getApplications = function()
{
	'use strict';

	return new Folder(-100).getChildFolders().filter(function(hosting)
	{
		var ssp_app_folder = hosting.getChildFolder('SSP Applications');
		if (ssp_app_folder)
		{
			hosting.publishers = ssp_app_folder.getChildFolders().filter(function(publishers)
			{
				publishers.application = publishers.getChildFolders();
				return publishers.application.length;
			});
			return hosting.publishers.length;
		}
		return false;
	});
};




Folder.prototype.getChildFolders = function()
{
	'use strict';

	var search = nlapiSearchRecord(
		'folder'
	,	null
	,	[new nlobjSearchFilter('parent', null, 'is', this.id)]
	,	[new nlobjSearchColumn('name')]
	);

	return (search || [])
		.map(function(folder)
		{
			return new Folder(folder.getId(), folder.getValue('name'));
		});
};

Folder.prototype.getChildFolder = function(name)
{
	'use strict';
	return this.getChildFolders().filter(function(child)
	{
		return child.name === name;
	})[0] || null;
};


Folder.prototype.getChildFiles = function()
{
	'use strict';
	var self = this;
	return nlapiSearchRecord(
		'file'
	,	null
	,	[new nlobjSearchFilter('folder', null, 'is', this.id)]
	,	[new nlobjSearchColumn('folder')]
	)
	.filter(function(file)
	{
		return file.getValue('folder') === self.id;
	})
	.map(function(file)
	{
		return nlapiLoadFile(file.getId());
	});
};



Folder.prototype.ensurePath = function(path)
{
	'use strict';

	var tokens = path.split(/[\\\/]/).filter(function(x){ return x.length > 0; })
	,	next_parent = this.id
	,	self = this;

	tokens.forEach(function(folder_name)
	{
		if (self.known_dirs[next_parent + '---' + folder_name])
		{
			next_parent = self.known_dirs[next_parent + '---' + folder_name];
			return next_parent;
		}

		var child_folder = nlapiSearchRecord(
			'folder'
		,	null
		,	[
				new nlobjSearchFilter('name', null, 'is', folder_name)
			,	new nlobjSearchFilter('parent', null, 'is', next_parent)
			]
		,	null
		);

		if (child_folder && child_folder.length)
		{
			next_parent = child_folder[0].getId();
		}
		else
		{
			var folder_record = nlapiCreateRecord('folder', true);
			folder_record.setFieldValue('name', folder_name);
			folder_record.setFieldValue('parent', next_parent);

			next_parent = nlapiSubmitRecord(folder_record);
		}
		self.known_dirs[next_parent + '---' + folder_name] = next_parent;
	});

	return next_parent;
};


Folder.prototype.writeFile = function(path, type, contents, setIsOnline)
{
	'use strict';

	type = TYPE_MAP[type] || 'PLAINTEXT';

	var path_tokens = path.split(/[\\\/]/)
	,	file_name = path_tokens[path_tokens.length-1]
	,	conteiner_folder = path.replace(file_name, '');

	var file_record = nlapiCreateFile(file_name, type, contents);

	file_record.setFolder(this.ensurePath(conteiner_folder));

	if (setIsOnline)
	{
		//nlapiLogExecution('DEBUG', 'writeFile: ' + path, setIsOnline);
		file_record.setIsOnline(true);
	}

	var file_record_id = nlapiSubmitFile(file_record);

	return file_record_id;
};


var TYPE_MAP = {
	'application/x-autocad': 'AUTOCAD'
,	'image/x-xbitmap': 'BMPIMAGE'
,	'text/csv': 'CSV'
,	'application/vnd.ms-excel': 'EXCEL'
,	'application/x-shockwave-flash': 'FLASH'
,	'image/gif': 'GIFIMAGE'
,	'application/x-gzip-compressed': 'GZIP'
,	'text/html': 'HTMLDOC'
,	'image/ico': 'ICON'
,	'text/javascript': 'JAVASCRIPT'
,	'application/javascript': 'JAVASCRIPT'
,	'image/jpeg': 'JPGIMAGE'
,	'message/rfc822': 'MESSAGERFC'
,	'audio/mpeg': 'MP3'
,	'video/mpeg': 'MPEGMOVIE'
,	'application/vnd.ms-project': 'MSPROJECT'
,	'application/pdf': 'PDF'
,	'image/pjpeg': 'PJPGIMAGE'
,	'text/plain': 'PLAINTEXT'
,	'image/x-png': 'PNGIMAGE'
,	'image/png': 'PNGIMAGE'
,	'application/postscript': 'POSTSCRIPT'
,	'application/vnd.ms-powerpoint': 'POWERPOINT'
,	'video/quicktime': 'QUICKTIME'
,	'application/rtf': 'RTF'
,	'application/sms': 'SMS'
,	'text/css': 'STYLESHEET'
,	'image/tiff': 'TIFFIMAGE'
,	'application/vnd.visio': 'VISIO'
,	'application/msword': 'WORD'
,	'text/xml': 'XMLDOC'
,	'application/zip': 'ZIP'
// binary types below are uploaded as ZIP 
// because Netsuite doesn't nlapiCreateFile() doesn't support
// MISCBINARY file type. 
,	'image/svg+xml': 'ZIP'
,	'application/x-font-ttf': 'ZIP'
,	'application/font-woff': 'ZIP'
,	'application/vnd.ms-fontobject': 'ZIP'
,	'image/x-icon': 'ZIP'
};
