/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Tracker
define('Tracker'
,	[	'Singleton'
	,	'underscore'
	,	'Backbone'
	]
,	function (
		Singleton
	,	_
	,	Backbone
	)
{
	'use strict';


	var Tracker = function ()
	{
		// Place holder for tracking modules.
		// When creating your own tracker module, be sure to push it to this array.
		this.trackers = [];

		this.trackOnce = {};
	};

	Tracker.prototype.track = function (method)
	{
			// Each method could be called with different type of parameters.
			// So we pass them all what ever they are.
		var parameters = Array.prototype.slice.call(arguments, 1);

		_.each(this.trackers, function (tracker)
		{
			// Only call the method if it exists, the context is the original tracker.
			tracker[method] && tracker[method].apply(tracker, parameters);
		});

		return this;
	};

	Tracker.prototype.trackPageview = function (url)
	{
		if (this.trackOnce.pageView !== url)
		{
			this.trackOnce = { 'pageView': url };

			return this.track('trackPageview', url);
		}

		return this;
	};

	Tracker.prototype.trackAddToCart = function (line, event)
	{
		return this.track('trackEvent', event || {
			category: 'add-to-cart'
		,	action: 'button'
		,	label: line.generateURL()
		,	value: 1
		}).track('trackAddToCart', line);
	};

	Tracker.prototype.trackGenericEvent = function ()
	{
		return this.track('trackGenericEvent', arguments);
	};

	Tracker.prototype.trackEvent = function (event)
	{
		this.track('trackEvent', event);

		if (event.callback)
		{
			var doCallback = _.find(this.trackers, function (tracker)
			{
				return tracker.doCallback();
			});

			!doCallback && event.callback();
		}

		return this;
	};

	Tracker.prototype.trackTransaction = function (transaction, event)
	{
		return this.track('trackEvent', event || {
				category: 'place-order'
			,	action: 'button'
			,	label: ''
			,	value: 1
			}).track('trackTransaction', transaction);
	};

	Tracker.prototype.trackViewCart = function (cart)
	{
		return this.track('trackViewCart', cart);
	};

	Tracker.prototype.trackProductList = function (items, listName)
	{
		var options = _.parseUrlOptions(Backbone.history.fragment)
		,	key = options.keywords || '';

		listName = listName || (key ? 'Search Results' : 'Category');

		if (!this.trackOnce[listName])
		{
			this.trackOnce[listName] = true;

			return this.track('trackProductList', items, listName);
		}

		return this;
	};

	Tracker.prototype.trackProductClick = function (item)
	{
		if (!this.trackOnce['click_' + item.get('name')])
		{
			this.trackOnce['click_' + item.get('name')] = true;

			return this.track('trackProductClick', item);
		}

		return this;
	};

	Tracker.prototype.trackProductView = function (product)
	{
		if (!this.trackOnce['view_' + product.getSku()])
		{
			this.trackOnce['view_' + product.getSku()] = true;

			return this.track('trackProductView', product);
		}

		return this;
	};

	Tracker.prototype.addCrossDomainParameters = function (url)
	{
		_.each(this.trackers, function (tracker)
		{
			if (tracker.addCrossDomainParameters)
			{
				url = tracker.addCrossDomainParameters(url);
			}
		});

		return url;
	};

	return _.extend(Tracker, Singleton, Backbone.Events);
});

//@class TrackEvent
//@property {String} category
//@property {String} action
//@property {String} label
//@property {Number} value
//@property {Function} callback
//@property {String?} page
