/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Location
define('Location.Collection'
,	[	
		'Location.Model'
	,	'underscore'
	,	'Backbone.CachedCollection'
	]
,	function
	(
		LocationModel
	,	_
	,	BackboneCachedCollection
	)
{
	'use strict';

	//@class Location.Collection @extend Backbone.Collection
	return BackboneCachedCollection.extend({

		//@property {Location.Model} model
		model: LocationModel

		//@property {String} url
	,	url: _.getAbsoluteUrl('services/Location.Service.ss')

		//@method parse Transforms the JSON response to extract  the array of models from the correct
		//response as to know what page is loaded
	,	parse: function parse (response)
		{
			if (!_.isUndefined(response.totalRecordsFound))
			{
				this.totalRecordsFound = response.totalRecordsFound;
				this.recordsPerPage = response.recordsPerPage;
				return response.records;
			}
			else
			{
				return response;
			}
		}

		//@method update
		//@param {Object} options
		//@param {Object} callbacks
	,	update: function update (options, callbacks)
		{
			return this.fetch(_.extend({
				data: {
					//@property {String} latitude
					latitude: options.latitude
					//@property {String} longitude
				,	longitude: options.longitude
					//@property {String} radius
				,	radius: options.radius
					//@property {String} sort
				,	sort: options.sort
					//@property {Number} page
				,	page: options.page
					//@property {Number} locationtype
				,	locationtype: options.locationtype
					//@property {Number} results_per_page
				,	results_per_page: options.results_per_page
				}
			,	reset: !!options.reset
			,	killerId: options.killerId
			}, callbacks));
		}

	});
});