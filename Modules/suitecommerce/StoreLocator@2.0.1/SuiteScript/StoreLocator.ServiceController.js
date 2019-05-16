/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define(
	'StoreLocator.ServiceController'
,   [
		'ServiceController'
	,   'StoreLocator.Model'
	]
,   function(
		ServiceController
	,   StoreLocatorModel
	)
	{
		'use strict';

		return ServiceController.extend({

			name: 'Location.ServiceController'

		,   get: function()
			{
				var id = this.request.getParameter('internalid');
				
				if (id)
				{
				   return StoreLocatorModel.get({
						internalid: id
					});
				}
				else
				{
				   return StoreLocatorModel.list({
						'latitude': this.request.getParameter('latitude')
					,	'longitude': this.request.getParameter('longitude')
					,	'radius': this.request.getParameter('radius')
					,	'sort': this.request.getParameter('sort')
					,	'page': this.request.getParameter('page')
					,	'locationtype': this.request.getParameter('locationtype')
					,	'results_per_page': this.request.getParameter('results_per_page')
					});
				}
			}
		});
	}
);