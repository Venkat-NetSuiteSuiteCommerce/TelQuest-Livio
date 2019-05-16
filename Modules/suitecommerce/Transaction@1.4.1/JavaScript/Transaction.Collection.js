/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Transaction
define('Transaction.Collection'
,	[	'Transaction.Model'
	,	'Backbone'
	,	'Backbone.CachedSync'
	,	'underscore'
	]
,	function (
		TransactionModel
	,	Backbone
	,	BackboneCachedSync
	,	_
	)
{
	'use strict';

	//@class Transaction.Collection @extend Backbone.Collection
	return Backbone.Collection.extend({

		//@property {Transaction.Model} model
		model: TransactionModel

		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedCollection)
	,	cacheSupport: false
		//@method  initialize
	,	initialize: function ()
		{
			if (this.cacheSupport)
			{
				var self = this;

				_.each(BackboneCachedSync, function (fn, name)
				{
					self[name === 'cachedSync' ? 'sync' : name] = fn;
				});
			}
		}

		//@property {String} url
	,	url: 'services/Transaction.Service.ss'

		//@method parse Transform the JSON response to extract away the array of model from the correct
		//response as to know what page is loaded
		//@param {Transaction.Model.List.Result} response
		//@return {Transaction.Model.List.Result.Record}
	,	parse: function (response)
		{
			if (response.page)
			{
				this.totalRecordsFound = response.totalRecordsFound;
				this.recordsPerPage = response.recordsPerPage;
				this.page = response.page;
				return response.records;
			}
			else
			{
				return response;
			}
		}

		//@method update
		//@param {Transaction.Collection.UpdateOptions} options
		//@return {Void}
	,	update: function (options)
		{
			//@class Transaction.Collection.UpdateOptions
			//@property {DateRange?} range
			var range = options.range || {};

			this.fetch({
				data: {
					//@property {value:String?} filter
					filter: options.filter && options.filter.value
					//@property {value:String?} sort
				,	sort: options.sort.value
					//@property {String?} order
				,	order: options.order
				,	from: range.from
				,	to: range.to
					//@property {String?} page
				,	page: options.page
				}
			,	reset: true
				//@property {String?} killerId
			,	killerId: options.killerId
			});
		}
	});
});


//@class DateRange
//@property {String} from Date expressed in millisecond (getTime)
//@property {String} to Date expressed in millisecond (getTime)