/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Quote
define(
	'Quote.Collection'
,	[	
		'Quote.Model'

	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		QuoteModel

	,	_
	,	Backbone
	)
{
	'use strict';

	// @class Quote.Collection @extends Backbone.Collection
	return Backbone.Collection.extend({

		//@property {Quote.Model} model
		model: QuoteModel

		//@property {String} url
	,	url: 'services/Quote.Service.ss?types=Estimate'

		//@method parse
		//@param {Quote.Model.List.Result} response This is the backend service response when fetching the model\
		//@return {Arra<Transaction.Model.List.Result.Record>}
	,	parse: function (response)
		{
			this.totalRecordsFound = response.totalRecordsFound;
			this.recordsPerPage = response.recordsPerPage;

			return response.records;
		}

		//@method update Method used by the ListHeader to filter the current list when seeing the Quote List
		//@param {Collection.Filter} options
		//@return {Void}
	,	update: function (options)
		{
			var range = options.range || {}
			,	from = range.from && _.stringToDate(range.from)
			,	to = range.to && _.stringToDate(range.to);

			this.fetch({
				data: {
					filter: options.filter.value
				,	sort: options.sort.value
				,	order: options.order
				,	from: from || null
				,	to: to || null
				,	page: options.page
				}
			,	reset: true
			,	killerId: options.killerId
			});
		}
	});
});