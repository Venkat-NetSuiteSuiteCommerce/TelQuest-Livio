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
};


var known_dirs = {}
function ensureDir(folder_name, parent)
{
	if (known_dirs[parent + '---' + folder_name])
	{
		return known_dirs[parent + '---' + folder_name];
	}

	var filters = [new nlobjSearchFilter('name', null, 'is', folder_name)];

	if (!parent)
	{
		filters.push(new nlobjSearchFilter('istoplevel', null, 'is', 'T'));
	}
	else
	{
		filters.push(new nlobjSearchFilter('parent', null, 'is', parent));
	}


	var folderExists = nlapiSearchRecord(
		'folder'
	,	null
	,	filters
	,	null);

	if (folderExists && folderExists.length)
	{
		result = folderExists[0].getId();
	}
	else
	{
		var folder_record = nlapiCreateRecord('folder', true);
		folder_record.setFieldValue('name', folder_name);
		folder_record.setFieldValue('parent', parent);
		result = nlapiSubmitRecord(folder_record);
	}
	known_dirs[parent + '---' + folder_name] = result;
	return result;
}

function ensurePath(folder_id, path)
{
	var tokens = path.split('/').filter(function(x){ return x.length > 0; });

	var parent = folder_id
	tokens.forEach(function(folder_name)
	{
		parent = ensureDir(folder_name, parent);
	});

	return parent;
}


function writeFile(folder_id, path, type, contents)
{
	'use strict';

	type = TYPE_MAP[type] || 'PLAINTEXT';

	var path_tokens = path.split('/')
		file_name = path_tokens[path_tokens.length-1];
	
	var folder_id = ensurePath(folder_id, path.replace(file_name, ''));

	var file_record = nlapiCreateFile(file_name, type, contents);
	file_record.setFolder(folder_id);
	file_record_id = nlapiSubmitFile(file_record);

	return file_record_id;
}


function findDir(folder_name, parent)
{
	if (known_dirs[parent + '---' + folder_name])
	{
		return known_dirs[parent + '---' + folder_name];
	}

	var filters = [new nlobjSearchFilter('name', null, 'is', folder_name)];

	if (!parent)
	{
		filters.push(new nlobjSearchFilter('istoplevel', null, 'is', 'T'));
	}
	else
	{
		filters.push(new nlobjSearchFilter('parent', null, 'is', parent));
	}


	var folderExists = nlapiSearchRecord(
		'folder'
	,	null
	,	filters
	,	null);

	if (folderExists && folderExists.length)
	{
		result = folderExists[0].getId();
		known_dirs[parent + '---' + folder_name] = result;
		return result;
	}
	else
	{
		return false
	}
}

function findPath(path)
{
	var tokens = path.split('/').filter(function(x){ return x.length > 0; });

	var parent = null
	tokens.forEach(function(folder_name)
	{
		parent = findDir(folder_name, parent);
	});

	return parent;
}



function listAllFiles(folder_id, base)
{
	'use strict';

	var result = [];


	var files = nlapiSearchRecord(
		'file'
	,	null
	,	[new nlobjSearchFilter('folder', null, 'is', folder_id)]
	,	[new nlobjSearchColumn('name')]
	);

	files && files.length && files.forEach(function(file)
	{
		var value = nlapiLoadFile(file.getId()).getValue()
		,	hash_with_encrypt = nlapiEncrypt(value, 'sha1')
		,	hash_with_credentials = new nlobjCredentialBuilder("rawtext{GUID}Hash:", 'www.netsuite.com');

		result.push({
			path: base + '/' + file.getValue('name')
		,	hash_with_encrypt: hash_with_encrypt
		,	hash_with_credentials: hash_with_credentials.sha1().utf8()
		});
	});

	var folders = nlapiSearchRecord(
		'folder'
	,	null
	,	[new nlobjSearchFilter('parent', null, 'is', folder_id)]
	,	[new nlobjSearchColumn('name')]
	);

	folders && folders.length && folders.forEach(function(folder)
	{
		listAllFiles(folder.getId(), base + '/' + folder.getValue('name')).forEach(function(file)
		{
			result.push(file);
		})
	});


	return result;
}



function getChildFolders(parent_id)
{
	'use strict';

	var folders = nlapiSearchRecord(
		'folder'
	,	null
	,	[new nlobjSearchFilter('parent', null, 'is', parent_id)]
	,	[new nlobjSearchColumn('name')]
	);

	return folders.map(function(folder) { return {id: folder.getId(), name: folder.getValue('name')}; });
}

function getFolderByName(name, parent_id)
{

	var folders = nlapiSearchRecord(
		'folder'
	,	null
	,	[
			new nlobjSearchFilter('parent', null, 'is', parent_id)
		,	new nlobjSearchFilter('name', null, 'is', name)
		]
	,	null
	);

	return folders[0].getId();
}


function _get(data)
{
	'use strict';


	if (data.get === 'target-folders')
	{
		var result = []
		,	hosting_files = getChildFolders(-100);

		hosting_files.forEach(function(hosting_folder)
		{
			hosting_folder.publishers = [];
			getChildFolders(getFolderByName('SSP Applications', hosting_folder.id)).forEach(function(publisher)
			{
				publisher.applications = []
				getChildFolders(publisher.id).forEach(function(application)
				{
					publisher.applications.push(application);
				});

				if (publisher.applications.length)
				{
					hosting_folder.publishers.push(publisher);
				}
			});

			if (hosting_folder.publishers.length)
			{
				result.push(hosting_folder)
			}
		});

		return result;
	}
	
}

function _post(data)
{
	'use strict';

	var start = Date.now();
	var result = [];

	data.files.forEach(function(file)
	{
		file.id = writeFile(parseInt(data.target_folder), file.path, file.type, file.contents)
		delete file.contents;
		result.push(file);
	});

    return JSON.stringify({
		method: 'post'
	,	time: Date.now() - start
	,	files: result
	});
}

function _put()
{
	'use strict';

    return JSON.stringify({method: 'put', result: result});
}

function _delete()
{
	'use strict';

	return JSON.stringify({method: 'delete'});
}


_get, _post, _put, _delete;
