/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CMSadapterInstaller
define('CMSadapterInstaller'
,	[	'CMSadapter'
	,	'CMSadapter.v2'
	,	'CMSadapter.v3'
	,	'SC.Configuration'
	]
,	function (
		CMSadapter
	,	CMSadapter2
	,	CMSadapter3
	,	Configuration
	)
{
	'use strict';

	// @class CMSadapterInstaller responsible of initializing the CMSAdapter depending on the configured CMS version.
	return {

		mountToApp: function (application)
		{
			var cms_adapter_version = Configuration.get('cms.adapterVersion')
			,	cms_adapter = null;

			switch (cms_adapter_version)
			{
				case '2':
					cms_adapter = CMSadapter2;
					break;

				case '3':
					cms_adapter = CMSadapter3;
					break;
			}		

			if (cms_adapter)
			{
				return cms_adapter.mountAdapter(application);
			}
		}
	};
});
