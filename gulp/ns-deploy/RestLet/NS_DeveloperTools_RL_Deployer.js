
function _get(data)
{
	'use strict';

	var result = {};

	if (data.get === 'target-folders')
	{
		result = Folder.getApplications();
	}
	else if (data.get === 'list-websites')
	{
		result = getAdvancedWebsites()
	}
	else if (data.get === 'domain-configuration')
	{
		result = getConfigurationForDomain(data)
	}
	else if (data.get === 'revisions' && data.target_folder)
	{
		result = new Deployment({target_folder: data.target_folder}).getBackups();
	}

	return result;
}

function getConfigurationForDomain(data)
{
	var configurationKey = data.website+'|'+data.domain;

	try 
	{
		var search = nlapiCreateSearch('customrecord_ns_sc_configuration',
			[new nlobjSearchFilter('custrecord_ns_scc_key', null, 'is', configurationKey)],
			[new nlobjSearchColumn('custrecord_ns_scc_value')]
		);

		var result = search.runSearch().getResults(0, 1000);
		if (!result.length)
		{
			return {domainUnmanagedFolder:''};
		}
		var record = result[result.length - 1];

		var value = JSON.parse(record.getValue('custrecord_ns_scc_value'));
		return {domainUnmanagedFolder: value.unmanagedResourcesFolderName||''};

	}
	catch(ex)
	{
		return {error: ex}
	}
}

function getWebappIdForDomain (website, domain)
{
	var count = website.getLineItemCount('shoppingdomain')
	,    domains = [];

	for (var i = 1; i < count + 1; i++)
	{
		var domainValue =  website.getLineItemValue('shoppingdomain', 'domain', i);
		var touchpointsValue =  website.getLineItemValue('shoppingdomain', 'touchpoints', i);
		domains.push({ domain: domainValue, touchpoints: touchpointsValue});
	}
	var webAppId;

	for (var i = 0; i < domains.length; i++)
	{
		if (domains[i].domain == domain)
		{
			var touchpoints;
			try 
			{
				//this try/catch is necessary because of platform issue : for empty domains, the json value is not valid, i.e. {"":}
				touchpoints = JSON.parse(domains[i].touchpoints);
			} 
			catch(ex)
			{
				touchpoints = [];
			}
			if (touchpoints)
			{
				for (var key in touchpoints[0])
				{
					webAppId = touchpoints[0][key];
					if (webAppId)
					{
						break;
					}
				}
			}
			break;
		}
	}

	if(!webAppId)
	{
		webAppId = websiteGetGeneralTouchpointWebapp(website)[0];//TODO: not the first, but 'home'
	}
	return webAppId;
}

function websiteGetGeneralTouchpointWebapp(website)
{
	var result = [];
	var touchpointCount = website.getLineItemCount('entrypoints');
	for (var i = 1; i <= touchpointCount; i++) 
	{
		var webAppId =  website.getLineItemValue('entrypoints', 'webapp', i);
		result.push(webAppId);
	}
	return result;
}

function getAdvancedWebsites()
{
	var websites = [];
	var webSiteSearchFilters = new nlobjSearchFilter('sitetype', null, 'is', 'ADVANCED');
	var webSiteSearchResults = nlapiSearchRecord('website', null, webSiteSearchFilters);
	for (var i = 0; i < webSiteSearchResults.length; i++)
	{
		var website = nlapiLoadRecord('website', webSiteSearchResults[i].getId());
		websites.push(website);	
	}

	var websiteDomainData = [];

	for (var i = 0; i < websites.length; i++)
	{
		var ws = websites[i]
		,	domainsCount = ws.getLineItemCount('shoppingdomain');

		for(var j = 0; j < domainsCount; j++)
		{
			var domain =  ws.getLineItemValue('shoppingdomain', 'domain', j+1);
			if(domain)
			{
				var webappId = getWebappIdForDomain(ws, domain);
				if(!webappId)
				{
					continue; //sometimes this happens with old domains that seems to be still indexed...
				}
				var webappFolderId = nlapiLookupField('webapp', webappId,'folderid');
				var folder = nlapiLoadRecord('folder', webappFolderId);
				var folderName = folder.getFieldValue('name')

				websiteDomainData.push({
					domain: domain
				,	ws: ws.getId()
				,	wsname: nlapiLookupField('website', ws.getId(), 'displayname')
				,	webapp: webappId
				,	webappFolderId: webappFolderId
				,	webappFolderName: folderName
				});
			}
		}
	}

	//TODO: we are sending the whole website record and we just only need displayname and id.
	return {
		websites: websites.map(function(ws){return {displayname: ws.getFieldValue('displayname'), id: ws.getId()}}) 
	,	websiteDomainData: websiteDomainData
	}
}

function _post(data)
{
	'use strict';

	var d = new Deployment(data);

	return d.deploy();
}

function _put(data)
{
	'use strict';

	if (data.rollback_to)
	{
		try
		{
			var d = new Deployment(JSON.parse(nlapiLoadFile(data.rollback_to).getValue()));
			return d.deploy();
		}
		catch (e)
		{
			return e;
		}
	}
	else if (data.saveConfiguration)
	{
		try
		{
			return saveConfiguration(data);
		}
		catch (e)
		{
			return e;
		}
	}
}


function saveConfiguration(data)
{
	nlapiLogExecution('DEBUG', 'saveConfiguration', configurationKey+'-'+data.unmanagedResourcesFolderName);
	var configurationKey = data.website+'|'+data.domain;
	
	try 
	{
		var search = nlapiCreateSearch('customrecord_ns_sc_configuration',
			[new nlobjSearchFilter('custrecord_ns_scc_key', null, 'is', configurationKey)],
			[new nlobjSearchColumn('custrecord_ns_scc_value')]
		);
		var record;
		var result = search.runSearch().getResults(0, 1000);
		// return {'something': result.length}
		if (!result.length)
		{
			//record not found, then we create it with only this property so the application can access it
			record = nlapiCreateRecord('customrecord_ns_sc_configuration');
			record.setFieldValue('custrecord_ns_scc_key', configurationKey);
			var config = {unmanagedResourcesFolderName: data.unmanagedResourcesFolderName};
			record.setFieldValue('custrecord_ns_scc_value', JSON.stringify(config));
		}
		else
		{
			result = result[result.length - 1];
			record = nlapiLoadRecord('customrecord_ns_sc_configuration', result.getId());
			var value = JSON.parse(record.getFieldValue('custrecord_ns_scc_value'))||{};
			value.unmanagedResourcesFolderName = data.unmanagedResourcesFolderName;
			record.setFieldValue('custrecord_ns_scc_value', JSON.stringify(value));
		}

		nlapiSubmitRecord(record);
		return {};
	}
	catch(ex)
	{
		return {error: ex};
	}
}

function _delete()
{
	'use strict';

	return {method: 'delete'};
}


_get, _post, _put, _delete;
