/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module BackboneExtras
#Backbone.sync()
Overrides native Backbone.sync to pass company and site id on all requests
*/
define('Backbone.Sync'
,	[	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		Backbone
	,	_
	,	jQuery
	,	Utils
	)
{
	'use strict';

	// @method sync SCA Overrides @?method Backbone.Model.url to add model's 'internalid' as parameter @return {String}
	Backbone.sync = _.wrap(Backbone.sync, function (fn, method, model, options)
	{
		var url = options.url || _.result(model, 'url');

		if (url)
		{
			options = options || {};

			if (url.indexOf('&c=') < 0 && url.indexOf('?c=') < 0)
			{
				url = url + (~url.indexOf('?') ? '&' : '?') + jQuery.param({
					// Account Number
					c: SC.ENVIRONMENT.companyId
				});
			}

			if (url.indexOf('&n=') < 0 && url.indexOf('?n=') < 0)
			{
				url = url + (~url.indexOf('?') ? '&' : '?') + jQuery.param({
					// Site Number
					n: SC.ENVIRONMENT.siteSettings.siteid
				});
			}
		}

		options.url = url;
		

		var actionDetails = model.get('actionDetails');
		if (actionDetails)
		{
			//Adds extra information to improve the performance metrics
			options.url = Utils.addParamsToUrl(options.url, actionDetails);
			model.unset('actionDetails');
		}

		return fn.apply(this, [method, model, options]);
	});




	return Backbone.sync;
});

