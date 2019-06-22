/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	'Utilities.ResizeImage'
,	[
		'SC.Configuration'
	,	'Utils'

	,	'underscore'
	]
,	function (
		Configuration
	,	Utils

	,	_
	)
{
	'use strict';

	return function resizeImage (url, size)
	{
		url = url || Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Configuration.get('imageNotAvailable'));
		size = Configuration['imageSizeMapping.'+ size] || size;

		var resize = _.first(_.where(Configuration.get('siteSettings.imagesizes', []), {name: size}));

		if (!!resize)
		{
			return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
		}

		return url;
	};
});