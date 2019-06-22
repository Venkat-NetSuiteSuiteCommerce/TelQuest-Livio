/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Categories
define('Categories.Collection'
,	[
		'Backbone'
	,	'underscore'
	,	'Utils'
	,	'SC.Configuration'
	]
,	function (
		Backbone
	,	_
	,	Utils
	,	Configuration
	)
{
	'use strict';

	// @class Categories.Collection @extends Backbone.Collection
	return Backbone.Collection.extend({

		url: function()
		{
			var url = _.addParamsToUrl(
				Utils.getAbsoluteUrl('services/Categories.Service.ss')
			,	{
					'menuLevel': Configuration.get('categories.menuLevel')
				}
			);

			return url;
		}

	,	initialize: function ()
		{

		}
	});
});
