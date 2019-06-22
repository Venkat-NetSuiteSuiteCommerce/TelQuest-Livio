/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SiteSearch
define(
	'SiteSearch.View'
,	[
		'SC.Configuration'
	,	'ItemsSearcher.View'
	,	'Session'
	,	'Backbone.CompositeView'

	,	'site_search.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration
	,	ItemsSearcherView
	,	Session
	,	BackboneCompositeView

	,	site_search_tpl

	,	Backbone
	,	_
	,	Utils
	)
{
	'use strict';

	// @class SiteSearch.View @extends Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: site_search_tpl

		//@property {Object} events
	,	events: {
			'submit [data-action="search"]': 'searchEventHandler'
		,	'click [data-type="search-reset"]': 'resetHandle'
		}

		//@method initialize
		//@return {Void}
	,	initialize: function ()
		{
			this.itemsSearcherComponent = new ItemsSearcherView({
				minLength: Configuration.get('typeahead.minLength', 3)
			,	maxLength: Configuration.get('searchPrefs.maxLength', 0)
			,	limit: Configuration.get('typeahead.maxResults', 10)
			,	sort: Configuration.get('typeahead.sort','relevance:asc')
			,	highlight: Configuration.get('typeahead.highlight', true)
			});

			this.itemsSearcherComponent.on('itemSelected', this.onItemSelected, this);
			this.itemsSearcherComponent.on('keyUp', this.showReset, this);
			this.itemsSearcherComponent.on('keyDown', this.cleanSearchOnEnter, this);

			BackboneCompositeView.add(this);
		}

		//@method showReset Handle when to show or hide the reset button
		//@param {ItemsSearcher.View.KeyDown.Properties} event_properties
		//@return {Void}
	,	showReset: function (event_properties)
		{
			if (event_properties.currentQuery)
			{
				this.$('[data-type="search-reset"]').show();
			}
			else
			{
				this.$('[data-type="search-reset"]').hide();
			}
		}

		//@method cleanSearchOnEnter Cleans the current search status
		//@param {ItemsSearcher.View.KeyDown.Properties} event_properties
		//@return {Void}
	,	cleanSearchOnEnter: function (event_properties)
		{
			if (event_properties.eventObject.keyCode === 27)
			{
				this.$('[data-type="search-reset"]').hide();
				this.itemsSearcherComponent.cleanSearch();
			}
		}

		//@method resetHandle Handle the reset action by hiding it and cleaning the current search status
		//@return {Void}
	,	resetHandle: function ()
		{
			this.$('[data-type="search-reset"]').hide();
			this.itemsSearcherComponent.cleanSearch();
		}

		//@method showSiteSearch Auto-show the site search form
	,	showSiteSearch: function (dontFocus)
		{
			this.$('[data-type="search-reset"]').hide();
			this.itemsSearcherComponent.cleanSearch(true);

			if (!dontFocus)
			{
				this.itemsSearcherComponent.setFocus();
			}
		}

		// @method searchEventHandler Call on submit of the Search form
		// @param {jQueryElement} e
		// @return {Void}
	,	searchEventHandler: function (e)
		{
			e.preventDefault();

			var search_term = this.itemsSearcherComponent.getCurrentQuery();

			if (search_term.length < 1)
			{
				return;
			}

			this.itemsSearcherComponent.cleanSearch();

			this.executeSearch(search_term);
		}

		// @method search This method handle the navigation to the search result page. This happens when the user press enter or click the 'Go' button
		// @param {String} keywords
		// @return {Void}
	,	executeSearch: function (keywords)
		{
			var search_url = _.getPathFromObject(Configuration, 'defaultSearchUrl')
			,	delimiters = _.getPathFromObject(Configuration, 'facetDelimiters')
			,	keywordsDelimited = delimiters ? delimiters.betweenFacetsAndOptions + 'keywords' + delimiters.betweenOptionNameAndValue : '?keywords=';

			// If we are not in Shopping we have to redirect to it
			if (_.getPathFromObject(Configuration, 'currentTouchpoint') !== 'home')
			{
				window.location.href = Session.get('touchpoints.home') + '#' + search_url + keywordsDelimited + keywords;
			}
			// Else we stay in the same app
			else
			{
				// We navigate to the default search url passing the keywords
				Backbone.history.navigate(search_url + keywordsDelimited + keywords + this.getCurrentSearchOptions(), {trigger: true});
			}
		}

		//@method onItemSelected Handle the selection of an item of the type-ahead result
		//@param {ItemsSearcher.View.itemSelected.Properties} result
		//@return {Void}
	,	onItemSelected: function (result)
		{
			var item = result.selectedItem
			,	collection = result.collection
			,	query = result.currentQuery;

			this.$('[data-type="search-reset"]').hide();
			this.itemsSearcherComponent.cleanSearch(true);

			if (item)
			{
				var path = item.get('_url');

				if (Configuration.get('currentTouchpoint','') !== 'home')
				{
					window.location.href = Session.get('touchpoints.home') + '#' + path;
				}
				else
				{
					Backbone.history.navigate(path, {trigger: true});
				}
			}
			else
			{
				if (!collection.length && result.isResultCompleted)
				{
					return false;
				}
				else
				{
					this.executeSearch(query);
				}
			}
		}

		//@method getCurrentSearchOptions Returns current search options formatted as query params.
		//@return {String}
	,	getCurrentSearchOptions: function ()
		{
			var newOptions = []
			,	currentOptions = Utils.parseUrlOptions(window.location.href);

			_.each(currentOptions, function (value, key)
			{
				var lowerCaseKey = key.toLowerCase();

				if (lowerCaseKey === 'order' || lowerCaseKey === 'show' ||  lowerCaseKey === 'display')
				{
					newOptions.push(lowerCaseKey + '=' + value);
				}
			});

			var newOptionsStr = newOptions.join('&');

			if (newOptionsStr.length > 0)
			{
				newOptionsStr = '&' + newOptionsStr;
			}

			return newOptionsStr;
		}

		//@property {Object} childViews
	,	childViews: {
			'ItemsSeacher': function ()
			{
				return this.itemsSearcherComponent;
			}
		}

		//@method getContext
		//@return {SiteSearch.View.Context}
	,	getContext: function ()
		{
			//@class SiteSearch.View.Context
			return {};
			//@class SiteSearch.View
		}

		//@method destroy Override default implementation to clean up all attached events of the initialize
		//@return {Void}
	,	destroy: function ()
		{
			Backbone.View.prototype.destroy.apply(this, arguments);

			this.itemsSearcherComponent.off('itemSelected');
			this.itemsSearcherComponent.off('keyUp');
			this.itemsSearcherComponent.off('keyDown');
		}
	});

});
