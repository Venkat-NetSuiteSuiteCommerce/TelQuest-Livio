/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Merchandising
define('Merchandising.Zone'
,	[	'Merchandising.Item.Collection'
	,	'Merchandising.Rule'
	,	'Merchandising.Context'
	,	'Merchandising.View'
	,	'LiveOrder.Model'

	,	'underscore'
	,	'jQuery'
	]
,	function (
		MerchandisingItemCollection
	,	MerchandisingRule
	,	MerchandisingContext
	,	MerchandisingView
	,	LiveOrderModel

	,	_
	,	jQuery
	)
{
	'use strict';

	// @class Merchandising.Zone
	// we declare a new version of the ItemCollection
	// to make sure the urlRoot doesn't get overridden
	// @constructor @param {HTMLElement|jQuery} element @param {Object} options
	var MerchandisingZone = function MerchandisingZone (element, options)
	{
		var application = options && options.application
		,	layout = application && application.getLayout && application.getLayout();

		if (!element || !layout)
		{
			return;
		}

		this.$element = jQuery(element).empty();
		// we try to get the model based on option.id (if passed) or the elements data id
		this.model = MerchandisingRule.Collection.getInstance().get(
			options.id || this.$element.data('id')
		);

		if (this.model && this.$element.length && !this.$element.hasClass(this.loadingClassNames))
		{
			this.options = options;
			this.application = application;
			this.items = new MerchandisingItemCollection();

			this.context = new MerchandisingContext(layout.modalCurrentView || layout.currentView || layout);

			this.initialize();
		}
	};

	_.extend(MerchandisingZone.prototype, {

		// @method initialize
		// @return {Void}
		initialize: function ()
		{
			this.addLoadingClass();
			// the listeners MUST be added before the fetch ocurrs
			this.addListeners();

			// fetch the items
			this.items.fetch({
				cache: true
			,	data: this.getApiParams()
			});
		}

		// @method addListeners install the listeners
		// @return {Void}
	,	addListeners: function ()
		{
			var proxy = jQuery.proxy;

			this.items.on({
				sync: proxy(this.excludeItems, this)
			,	excluded: proxy(this.appendItems, this)
			,	appended: proxy(this.removeLoadingClass, this)
			,	error: proxy(this.handleRequestError, this)
			});
		}

		// @method getApiParams precondition: this.model and this.options must be defined
		// @return {Object}
	,	getApiParams: function ()
		{
			var filters = this.parseApiFilterOptions()
			,	sorting = this.parseApiSortingOptions();

			if (sorting.length)
			{
				filters.sort = sorting.join(',');
			}

			// # Response
			// parameters to be passed to the item's fetch query
			return _.extend({
				limit: this.getLimit()
			,	fieldset: this.model.get('fieldset')
			}, filters);
		}

		// @method parseApiFilterOptions @return {Object}
	,	parseApiFilterOptions: function ()
		{
			var	filters = {};

			// parses the merchandising rule filters into the filters obj
			_.each(this.model.get('filter'), function (rule_filter)
			{
				filters[rule_filter.field_id] = rule_filter.field_value;
			});

			return this.context.getFilters(filters, this.model.get('within'));
		}

		// @method parseApiSortingOptions turn sorting obj into a string for the query @return {Array}
	,	parseApiSortingOptions: function ()
		{
			return _.map(this.model.get('sort'), function (value)
			{
				return value.field_id + ':' + value.dir;
			});
		}

		// @method getLimit if there are items to get excluded from the collection.
		// We need to ask for more items from the api because the filtering gets done after the request.
		// @return {Number}
	,	getLimit: function ()
		{
			var model = this.model
			,	limit = model.get('show')
			,	exclude = model.get('exclude');

			if (exclude.length)
			{
				if (_.contains(exclude, '$cart'))
				{
					limit += LiveOrderModel.getInstance().get('lines').length;
				}

				if (_.contains(exclude, '$current'))
				{
					limit += this.context.getIdItemsToExclude().length;
				}
			}

			return limit <= 100 ? limit : 100;
		}

		// @method excludeItems
	,	excludeItems: function ()
		{
			var self = this;

			_.each(this.model.get('exclude'), function (filter)
			{
				self.applyFilterToItems(filter);
			});

			this.items.trigger('excluded');

			return this;
		}

		// @method applyFilterToItems narrows down the collection if excludes set up on the merchandising rule
		// @param {String} filter the type of item filtering, currently supported values are: ```'@cart'``` and ```'@current'```
	,	applyFilterToItems: function (filter)
		{
			var items = this.items;

			switch (filter)
			{
				case '$cart':

					var item = null;

					LiveOrderModel.getInstance().get('lines').each(function (line)
					{
						item = line.get('item');

						items.remove(
							items.get(
								item.get('_matrixParent').get('_id') || item.get('_id')
							)
						);
					});
				break;

				case '$current':

					_.each(this.context.getIdItemsToExclude(), function (id)
					{
						items.remove(items.get(id));
					});
				break;
			}

			return this;
		}

		// @method appendItems
	,	appendItems: function ()
		{
			var items = this.items;

			if (items.length)
			{
				if (this.model.get('template'))
				{
					// we try to get the 'template' from the merchandising rule
					var amd_optimize_trick_for_require = require;
					MerchandisingView.prototype.template = amd_optimize_trick_for_require(this.model.get('template'));
				}

				var view = new MerchandisingView({
						model: this.model
					,	items: items
					,	application: this.application
					});

				view.render();

				this.$element.append(view.$el);

				view.trigger('afterMerchandAppendToDOM');
			}

			items.trigger('appended');

			// notify the layout that the content might have changed
			this.options && this.options.application && this.options.application.getLayout().trigger('afterRender');

			return this;
		}

		// @property {String} loadingClassNames
	,	loadingClassNames: 'loading loading-merchandising-zone'

		// @method addLoadingClass
	,	addLoadingClass: function ()
		{
			this.$element.addClass(this.loadingClassNames);
		}

		// @method removeLoadingClass
	,	removeLoadingClass: function ()
		{
			this.$element.removeClass(this.loadingClassNames);
		}

		// @method handleRequestError
	,	handleRequestError: function ()
		{
			this.removeLoadingClass();
			console.error('Merchandising Zone - Request Error', arguments);
		}
	});

	return MerchandisingZone;
});
