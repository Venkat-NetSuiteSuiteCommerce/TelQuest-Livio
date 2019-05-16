/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Categories.ServiceController.js
// ----------------
// Service to manage categories
define(
	'Categories.ServiceController'
,	[
		'ServiceController'
	,	'Categories.Model'
	]
,	function(
		ServiceController
	,	CategoriesModel
	)
	{
		'use strict';
		return ServiceController.extend({

			name: 'Categories.ServiceController'

		,	options: {
				common: {
					requireLoggedInPPS: true
				}
			}

		,	get: function()
			{
				var fullurl = this.request.getParameter('fullurl');

				if (fullurl)
				{
					return CategoriesModel.get(fullurl);
				}
				else
				{
					var menuLevel =  this.request.getParameter('menuLevel');

					if (menuLevel)
					{
						return CategoriesModel.getCategoryTree(menuLevel);
					}
				}
			}
		});
	}
);
