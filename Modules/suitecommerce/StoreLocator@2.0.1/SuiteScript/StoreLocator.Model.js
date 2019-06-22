/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module StoreLocator
define('StoreLocator.Model'
,	[
		'SC.Model'

	,	'Application'
	,	'Utils'
	,	'Location.Model'
	,	'Models.Init'
	]
,	function (
		SCModel

	,	Application
	,	Utils
	,	LocationModel
	,	ModelsInit
	)
{
	'use strict';

	// @class StoreLocator.Model
	// @extends SCModel
	return LocationModel.extend({
		name: 'StoreLocator'

		//@method list Overrides filters for the retrieving the first three nearest stores.
		//@param {Object} data
		//@returns {Array<Object>} list of stores
	,	list: function (data)
		{
			data.locationtype = data.locationtype || SC.Configuration.storeLocator.defaultTypeLocations;

			if (ModelsInit.context.getFeature('SUBSIDIARIES'))
			{
				data.subsidiary = data.subsidiary || ModelsInit.session.getShopperSubsidiary();
			}
			else
			{
				delete data.subsidiary;
			}

			var result = this.search(data);

			if (!result.length && !result.recordsPerPage)
			{
				data.radius = undefined;
				data.results_per_page = data.results_per_page || SC.Configuration.storeLocator.defaultQuantityLocations;
				data.page = 1;
				result = this.search(data);
			}

			return result;
		}

	});
});