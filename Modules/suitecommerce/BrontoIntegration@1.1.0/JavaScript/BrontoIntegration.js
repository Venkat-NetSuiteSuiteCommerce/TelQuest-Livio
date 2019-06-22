/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module BrontoIntegration
define('BrontoIntegration'
,	[
        'SC.Configuration'
    
    ,  'jQuery'
	]
,	function (
        Configuration
	
    ,  jQuery
	)
{
	'use strict';
	
    /*
    @class BrontoIntegration

    Loads Bronto Adapter script once on afterAppendView if it runs on the browser and the Bronto instanceId is set in the Configuration
    
    loadScript() appends the Bronto adapter script based on the configuration (instance id and adapter url). data-bronto-integrations attribute is set to the instance id
    mountToApp() runs only on the browser and if the Bronto account id is set, attaches the loadScript to once afterAppendView
    */

	return {
        //@property {String} instanceId
		instanceId: ''
        //@property {String} adapterUrl
    ,   adapterUrl: ''
        //@method loadScript @return {Void}
	,	loadScript: function ()
		{
		  jQuery('body').append(jQuery('<script src="' + this.adapterUrl + '" data-bronto-integrations="' + this.instanceId + '"></script>'));
		}
        //@method mountToApp @return {Void}
	,	mountToApp: function (application)
		{
            if (SC.ENVIRONMENT.jsEnvironment === 'browser')
            {
                var bronto_config = Configuration.bronto;
                
                if (bronto_config && bronto_config.accountId)
                {
                    this.instanceId = bronto_config.accountId;
                    this.adapterUrl = bronto_config.adapterUrl;	
                    application.getLayout().once('afterAppendView', jQuery.proxy(this, 'loadScript'));
                }
            }
		}	
	};
});