/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Invoice
define('Invoice.Collection'
,	[	'Invoice.Model'
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
	//@class Invoice.Collection @extends Backbone.Collection
	return Backbone.Collection.extend({
		//@property {Invoice.Model} model
		model: Model
		//@property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
	,	cacheSupport: true
		//@property {String} url
	,	url: 'services/Invoice.Service.ss'
		//@method initialize
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
		//@method getOpenInvoices
	,	getOpenInvoices: function ()
		{
			return this.filter(function (invoice)
			{
				// status might not be an obj
				var status = invoice.get('status');
				return _.isObject(status) ? status.internalid === 'open' : status === 'open';
			});
		}
		//@method getPaidInvoices
	,	getPaidInvoices: function ()
		{
			return this.filter(function (invoice)
			{
				// status might not be an obj
				var status = invoice.get('status');
				return _.isObject(status) ? status.internalid !== 'open' : status !== 'open';
			});
		}

		//@method clearFilters Unset any filter, sorting and order options previously set in the collection
	,	clearFilters: function ()
		{
			this.selectedFilter = null;
			this.selectedSort = null;
			this.order = null;
			this.range = null;
		}
		//@method update
		// custom method called by ListHeader view
		// it receives the currently applied filter,
		// currently applied sort and currently applied order
	,	update: function (options)
		{
			var filter_changed = this.selectedFilter !== options.filter
			,	sort_changed = this.selectedSort !== options.sort
			,	order_changed = this.order !== options.order
			,	range_changed = !_.isEqual(options.range, this.range) && (this.range || options.range);

			this.selectedFilter = options.filter;
			this.selectedSort = options.sort;
			this.order = options.order;
			this.range = options.range;

			if (filter_changed)
			{
				this.applyFilter().applySort();
			}
			else if (range_changed)
			{
				this.applyRangeFilter().applySort();
			}
			else if (sort_changed)
			{
				this.applySort();
			}
			else if (order_changed)
			{
				this.reverseOrder();
			}

			// All of the previous methods where silent
			// so if anything changed, we trigger the event
			// after everything was done
			if (filter_changed || sort_changed || order_changed || range_changed)
			{
				this.trigger('reset');
			}
		}

		//@method applyFilter Resets the collection based on the applied filter
	,	applyFilter: function ()
		{
			this.reset(this.selectedFilter.filter.call(this), {silent: true});

			return this;
		}
		//@method fixDateRangeWithTimeZoneOffset
	,	fixDateRangeWithTimeZoneOffset: function (selected_range)
		{
			if (selected_range)
			{
				var offset = new Date().getTimezoneOffset() * 60 * 1000
				,	from = _.stringToDate(selected_range.from)
				,	to = _.stringToDate(selected_range.to);

				if (_.isDateValid(from) && _.isDateValid(to))
				{
					var toAux = new Date(to.getTime() + offset)
					,	fromAux = new Date(from.getTime() + offset);

					toAux.setHours(23, 59, 59);
					fromAux.setHours(0, 0, 0);

					return {
						from: fromAux
					,	to: toAux
					};
				}
			}
		}
		//@method applyRangeFilter
	,	applyRangeFilter: function ()
		{
			var range = this.fixDateRangeWithTimeZoneOffset(this.range) || {}
			,	from = range.from && new Date(range.from).getTime()
			,	to = range.to && new Date(range.to).getTime();

			this.reset(this.original.filter(function (invoice)
			{
				var when = new Date(invoice.get('tranDateInMilliseconds')).getTime();

				if (from && !to)
				{
					return when >= from;
				}

				if (!from && to)
				{
					return when <= to;
				}

				if (from && to)
				{
					return when >= from && when <= to;
				}

				return true;

			}), {silent: true});

			return this;
		}

		//@method applySort Resets the collection based on the applied sort
	,	applySort: function ()
		{
			this.reset(this.selectedSort.sort.call(this), {silent: true});

			// if the current order is inverse
			if (this.order === -1)
			{
				// we need to reverse the order
				this.reverseOrder();
			}

			return this;
		}

		//@method reverseOrder Reverses the collection
	,	reverseOrder: function ()
		{
			this.reset(this.models.reverse(), {silent: true});

			return this;
		}
	});
});
