/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//Backend Configuration file
// @module ssp.libraries
// @class Configuration Backend Configuration file
define('Configuration'
,	[
		'Utils'
	,	'underscore'
	,	'SC.Models.Init'
	,	'Console'
	]
,	function(
		Utils
	,	_
	,	ModelsInit
	)
{
	'use strict';

	/*
		Recursive extension of an object. Similar to _.extend() in lodash
		If the source and target are array, the target size it's going to
		be set to the same size of the source.
	*/
	function mergeConfigurationObjects(target, source)
	{
		if(!_.isObject(target))
		{
			return source;
		}
		if (_.isArray(source) && _.isArray(target))
		{
			target.length = source.length;
		}
		_.each(source, function(value, key)
		{
			if(key in target)
			{
				target[key] = mergeConfigurationObjects(target[key], value);
			}
			else
			{
				target[key] = value;
			}
		});

		return target;
	}

	SC.Configuration =
	{
		get: function (path, defaultValue)
		{
			return Utils.getPathFromObject(this, path, defaultValue);
		}
	};

	var domain = ModelsInit.session.getSiteSettings(['touchpoints']).touchpoints.home.match(/^http(s?)\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[2];

	/* globals ConfigurationManifestDefaults */
	SC.Configuration = mergeConfigurationObjects(SC.Configuration, typeof(ConfigurationManifestDefaults) === 'undefined' ? {} : ConfigurationManifestDefaults);

	// then we read from the record, if any, and mix the values with the default values in the manifest.
	if (Utils.recordTypeExists('customrecord_ns_sc_configuration'))
	{
		var siteid = ModelsInit.session.getSiteSettings(['siteid']).siteid
		,	config_key = domain ? siteid + '|' + domain : siteid + '|all'
		,	search = nlapiCreateSearch('customrecord_ns_sc_configuration', [new nlobjSearchFilter('custrecord_ns_scc_key', null, 'is', config_key)], [new nlobjSearchColumn('custrecord_ns_scc_value')])
		,	result = search.runSearch().getResults(0, 1000);

		var configuration = result.length && JSON.parse((result[result.length - 1]).getValue('custrecord_ns_scc_value')) || {};
		SC.Configuration = mergeConfigurationObjects(SC.Configuration, configuration);
	}

	//Adapt the values of multiDomain.hosts.languages and multiDomain.hosts.currencies to the structure requiered by hosts
	SC.Configuration.hosts = [];

	if (SC.Configuration.multiDomain && SC.Configuration.multiDomain.hosts && SC.Configuration.multiDomain.hosts.languages)
	{
		_.each(SC.Configuration.multiDomain.hosts.languages, function(language)
		{
			var storedHost = _.find(SC.Configuration.hosts, function(host)
			{
				return host.title === language.host;
			});

			function getLanguageObj()
			{
				return {
					title: language.title
				,	host: language.domain
				,	locale: language.locale
				};
			}

			if (!storedHost)
			{
				SC.Configuration.hosts.push(
					{
						title: language.host
					,	languages: [
							getLanguageObj()
						]
					,	currencies: _.filter(SC.Configuration.multiDomain.hosts.currencies, function(currency)
						{
							return currency.host === language.host;
						})
					}
				);
			}
			else
			{
				storedHost.languages.push(
					getLanguageObj()
				);
			}
		});
	}

	SC.Configuration.categories = ModelsInit.context.getSetting('FEATURE', 'COMMERCECATEGORIES') === 'T' ? SC.Configuration.categories : false;

	/* globals __sc_ssplibraries_t0 */
	if (typeof(__sc_ssplibraries_t0) !== 'undefined')
	{
		SC.Configuration.__sc_ssplibraries_time = new Date().getTime() - __sc_ssplibraries_t0;
	}

	return SC.Configuration;
});
