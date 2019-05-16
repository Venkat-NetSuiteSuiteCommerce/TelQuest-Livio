/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Case.Collection.js
// -----------------------
// Case collection
// @module Case
define(
		'Case.Collection'
,	[
		'Case.Model'

	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		Model

	,	_
	,	Backbone
	)
{
	'use strict';

	// @class Case.Collection @extends Backbone.Collection
	return Backbone.Collection.extend ({

		url: _.getAbsoluteUrl('services/Case.Service.ss')

	,	model: Model

	,	initialize: function ()
		{
			// The first time the collection is filled with data
			// we store a copy of the original collection
			this.once('sync reset', function ()
			{
				if (!this.original)
				{
					this.original = this.clone();
				}
			});
		}

	,	parse: function (response)
		{
			this.totalRecordsFound = response.totalRecordsFound;
			this.recordsPerPage = response.recordsPerPage;

			return response.records;
		}

	,	update: function (options)
		{
			var filter = options.filter || {};

			this.fetch({
				data: {
					filter: filter.value
				,	sort: options.sort.value
				,	order: options.order
				,	page: options.page
				}
			,	reset: true
			,	killerId: options.killerId
			});
		}
	});
});
