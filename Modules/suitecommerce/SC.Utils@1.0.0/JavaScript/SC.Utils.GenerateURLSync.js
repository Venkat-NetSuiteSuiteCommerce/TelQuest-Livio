/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC
define('SC.Utils.GenerateURLSync'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	// @method sync SCA Overrides @?method Backbone.Model.url to add model's 'internalid' as parameter
	// @return {String}
	return function generateURLSync (model, options)
	{
		var url = options.url || _.result(model, 'url');

		if (url)
		{
			options = options || {};

			if (url.indexOf('&c=') < 0 && url.indexOf('?c=') < 0)
			{
				url = url + (~url.indexOf('?') ? '&' : '?') + 'c=' + SC.ENVIRONMENT.companyId;
			}

			if (url.indexOf('&n=') < 0 && url.indexOf('?n=') < 0)
			{
				url = url + (~url.indexOf('?') ? '&' : '?') + 'n=' + SC.ENVIRONMENT.siteSettings.siteid;
			}
		}

		return url;
	};

});