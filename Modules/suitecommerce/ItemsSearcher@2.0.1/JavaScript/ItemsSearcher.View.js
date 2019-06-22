/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ItemsSearcher
define(
	'ItemsSearcher.View'
,	[
		'ItemsSearcher.Utils'
	,	'ItemsSearcher.Collection'
	,	'ItemsSearcher.Item.View'
	,	'PluginContainer'

	,	'itemssearcher.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	]
,	function (
		ItemsSearcherUtils
	,	ItemsSearcherCollection
	,	ItemsSearcherItemView
	,	PluginContainer

	,	itemssearcher_tpl

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class ItemsSearcher.View @extends Backbone.View
	var ItemsSearcherView = Backbone.View.extend({

		//@property {Function} template
		template: function () {}

		//@property {ItemsSearcher.View.Options} defaultOptions
		//@class ItemsSearcher.View.Options
	,	defaultOptions: {
            //@property {String} placeholderLabel
            placeholderLabel: _('Search for products').translate()
			//@property {Number} minLength
		,	minLength: 3
			//@property {Number} maxLength
		,	maxLength: 10
			//@property {Number} limit
		,	limit: 10
			//@property {String} sort
		,	sort: 'relevance:asc'
			//@property {Array} labels
		,	labels: []
			//@property {ItemsSearcher.Collection} collection
		,	collection: ItemsSearcherCollection
			//@property {String} query
		,	query: ''
			//@property {Boolean} ajaxDone
		,	ajaxDone: false
			//@property {Boolean} showMenuOnClick
		,	showMenuOnClick: false
			//@property {ItemsSearcher.Item.View} itemView
		,	itemView: ItemsSearcherItemView
			//@property {Boolean} highlight
		,	highlight: true
			//@property {Function} template
		,	template: itemssearcher_tpl
			//@property {Void} componentId
		,	componentId: void 0
			//@property {Void} componentName
		,	componentName: void 0
			//@property {Boolean} showSeeAll Indicate if the first result should be the "See All" option
		,	showSeeAll: true
			//@property {Boolean} highlightFirst
		,	highlightFirst: true
			//@property {ItemsSearcher.View.Options.Item.View.Option} itemViewOptions
		,	itemViewOptions: {
			}
			//@property {ItemsSearcher.View.Options.Collection.Option} collectionOptions
		,	collectionOptions: {
			}
			//@property {Function<Item.Model, String, String>} getItemDisplayName This function give the chance to
			//change the way items display name is returned
		,	getItemDisplayName: null
		}
		// @class SiteSearch.View

		//@property {Object} events
	,	events: {
			'keyup [data-type="search-input"]': 'onKeyUp'
		,	'keydown [data-type="search-input"]': 'onKeyDown'
		}

		//@method initialize
		//@param {ItemsSearcher.View.Options?} options
		//@return {Void}
	,	initialize: function (options)
		{
			this.options = _.defaults(options || {}, this.defaultOptions);

			this.collection = new this.options.collection([],this.options.collectionOptions);
			this.template = this.options.template ;

			this.on('afterViewRender', this.configureTypeahead, this);

			this.installPlugins();
		}

		//@method installPlugins Internal method used to define the plugins this component expose
		//@return {Void}
	,	installPlugins: function ()
		{
			//@property {PluginContainer} postItemsSuggestionObtained This hook is executed after the fetch of item of retrieved
			//Allows apply any extra transformation over the result from the Search API before those are displayed by the type ahead
			//Each execute method on this hook will receive:
			//the collection {ItemsSearcher.Collection} of items
			//the current string query
			//and it's expected to return another {ItemsSearcher.Collection} collection.
			this.postItemsSuggestionObtained = new PluginContainer();
		}

		//@method getTypeAheadConfiguration Generates the type ahead configuration
		//@return {ItemsSearcher.View.TypeAheadConfiguration}
	,	getTypeAheadConfiguration: function ()
		{
			var self = this;

			//@class ItemsSearcher.View.TypeAheadConfiguration
			return {
				//@property {Function<String,Function>} source
				source: _.debounce(_.bind(self.loadSuggestionItemsSource, self), 500)
				//@property {Function<String>} displayKey Function used to return the string to be displayed on the main input after an item is selected
			,	displayKey: _.bind(self.getSelectedItemDisplayText, self)
				//@property {Object<suggestion:Function>} templates
			,	templates: {
					suggestion: _.bind(self.getSuggestionItemTemplate, self)
				}
			};
			// @class ItemsSearcher.View
		}

		//@method configureTypeahead Configures the type ahead and loads the $searchElement attribute
		//@return {Void}
	,	configureTypeahead: function ()
		{
			var self = this
			,	typeaheadOptions = {
					highlight: this.options.highlight
				,	minLength: this.options.minLength
				};

			//@property {jQuery} $searchElement
			self.$searchElement = self.$('[data-type="search-input"]');

			// after the layout has be rendered, we initialize the plugin
			if (SC.ENVIRONMENT.jsEnvironment !== 'server')
			{
				self.$searchElement.typeahead(typeaheadOptions,this.getTypeAheadConfiguration())
					.on('typeahead:selected', _.bind(self.onItemSelected, self));

					self.$searchElement.on('focus', _.bind(self.selectFirstIfRequire, self));

				//TYPE AHEAD HACKS
				var drop = self.$searchElement.data('ttTypeahead').dropdown;
				drop.$menu
				.off('click.tt', '.tt-suggestion')
				.on('click.tt', '.tt-suggestion', _.bind(function ($e)
					{
						$e.preventDefault();
						$e.stopPropagation();
						drop.trigger('suggestionClicked', jQuery($e.currentTarget));
					}, drop));

				//Display menu when selected the input hack
				if (self.options.showMenuOnClick)
				{
					self.$searchElement.focus(function ()
					{
						var ev = jQuery.Event('keydown');

						ev.keyCode = ev.which = 40;
						jQuery(this).trigger(ev);
						return true;
					});
				}
			}
		}

		//@method getCurrentQuery Get the current search. Use when triggering events
		//@return {String}
	,	getCurrentQuery: function getCurrentQuery ()
		{
			return jQuery.trim(this.$searchElement.val());
		}

		//@method cleanSearch Clean the current search and close the dropdown
		//@param {Boolean} stop_triggering_event Indicate if NOT trigger the event itemSelect indicating the unselected item
		//@return {Void}
	,	cleanSearch: function cleanSearch (stop_triggering_event)
		{

			this.$searchElement.data('ttTypeahead') && this.$searchElement.data('ttTypeahead').close();

			this.$searchElement.typeahead('val', '');

			this.options.query = '';
			this.options.selectedItem = null;

			if (!stop_triggering_event)
			{
				this.trigger('itemSelected'
				,	{
						selectedItem: null
					,	collection: this.collection.models
					,	currentQuery: this.options.query
					});
			}
		}

		//@method onItemSelected Handle the selection of an item of the type-ahead result
		//@param {HTMLEvent} e
		//@param {String} item_id
		//@return {Void}
	,	onItemSelected: function onItemSelected (e, item_id)
		{
			this.options.selectedItem = this.collection.get(item_id);

			// @event itemSelected
			this.trigger('itemSelected'
			//@class ItemsSearcher.View.itemSelected.Properties
			,	{
					//@property {Item.Model?} selectedItem
					selectedItem: this.collection.get(item_id)
					//@property {Array<Item.Model>} collection
				,	collection: this.collection.models
					//@property {String} currentQuery
				,	currentQuery: this.options.query
					//@property {Boolean} isResultCompleted
				,	isResultCompleted: this.options.ajaxDone
				});
			// @class ItemsSearcher.View
		}

		//@method setFocus Set the focus to the input searcher
		//@return {Void}
	,	setFocus: function setFocus ()
		{
			this.$searchElement.focus();
		}

		//@method selectFirstIfRequire Highlights the first item of the suggest if the highlightFirst options is specified
		//@return {Void}
	,	selectFirstIfRequire: function selectFirstIfRequire ()
		{
			if (this.options.highlightFirst)
			{
				var $menu_container = this.$searchElement.data('ttTypeahead').dropdown.$menu
				,	current_cursor_index = $menu_container.find('.tt-suggestion.tt-cursor').index();

				if (current_cursor_index === -1)
		{
					$menu_container.find('.tt-suggestion').first().addClass('tt-cursor');
				}
			}
		}

		// @method loadSuggestionItemsSource Implements the search logic by fetching the collection of items
		// @param {String} query To string to search for
		// @param {Function<Array<String>, Void>} callback IMPORTANT Based on the values passed in to this callback the typeAhead plugin will invoke
		// the methd getSelectedItemDisplayText asking for the string of each item
		// @return {Void}
	,	loadSuggestionItemsSource: function loadSuggestionItemsSource (query, callback)
		{
			var self = this;

			self.options.ajaxDone = false;
			self.options.results = {};
			self.options.query = ItemsSearcherUtils.formatKeywords(query);
			// self.collection.reset(undefined, {silent:true});
			this.collection = new this.options.collection([], this.options.collectionOptions);

			// if the character length from the query is over the min length
			if (self.options.query.length >= self.options.minLength)
			{
				self.options.labels = ['see-all-' + self.options.query];
				callback(self.options.labels);

				self.$searchElement.data('ttTypeahead').dropdown.moveCursorDown();
			}

			// silent = true makes it invisible to any listener that is waiting for the data to load
			// We can use jQuery's .done, as the fetch method returns a promise
			// http://api.jquery.com/deferred.done/
			self.collection.fetch(
				{
					data: {
						q: jQuery.trim(self.options.query)
					,	sort: self.options.sort
					,	limit: self.options.limit
					,	offset: 0
					}
				,	killerId: _.uniqueId('ajax_killer_')
				}
			,	{
					silent: true
				}
			).done(function ()
				{
					self.collection = self.postItemsSuggestionObtained.executeAll(self.collection, self.options) || self.collection;

					self.options.ajaxDone = true;
					self.options.labels = self.options.showSeeAll ? ['see-all-' + self.options.query].concat(self.getItemIds(self.collection)) : self.getItemIds(self.collection);
					// self.options.labels = self.options.showSeeAll ? ['see-all-' + self.options.query].concat(self.collection.pluck('_id')) : self.collection.pluck('_id');

					if (!self.options.labels.length)
					{
						self.options.labels = ['see-all-' + self.options.query];
					}

					callback(self.options.labels);

					self.selectFirstIfRequire();
				});
		}

		//@method getItemIds Given the collection of items it generates an array of Ids. This method is used so it is easy to use another model
		//rather than Item.Model (let say Product.Model)
		//@param {Item.Collection} collection
		//@return {Array<String>}
	,	getItemIds: function getItemIds (collection)
		{
			return collection.map(function (item)
			{
				return item.id;
			});
		}

		//@method getSelectedItemDisplayText Returns the text shown on the input text when an item is selected by using the keyboard keys
		//@param {String} item_id
		//@return {String}
	,	getSelectedItemDisplayText: function (item_id)
		{
			return this.getItemDisplayName(this.collection.get(item_id), this.options.query);
		}

		//@method getItemDisplayName Internal auxiliary method used to extract the display name of an item
		//@param {Item.Model} item
		//@param {String} query
		//@return {String}
	,	getItemDisplayName: function (item, query)
		{
			return _.isFunction(this.options.getItemDisplayName) ?
					this.options.getItemDisplayName(item, query) :
				(item ? item.get('_name') : query);
		}

		//@method getSuggestionItemTemplate
		//@param {String} item_id
		//@return {jQuery} Returns a jQuery elements with the template
	,	getSuggestionItemTemplate: function (item_id)
		{
			var item_view_options = _.extend({}
				,	this.options.itemViewOptions
				,	{
						model: this.collection.get(item_id)
					,	query: this.options.query
					,	areResults: !!this.collection.length
					,	isAjaxDone: this.options.ajaxDone
					})
			,	items_searcher_item = new this.options.itemView(item_view_options);

			items_searcher_item.render();
			return items_searcher_item.$el;
		}

		//@method onKeyUp Handle the visibility of the reset button, hide and show it
		//@param {jQuertEvent} e
		//@return {Void}
	,	onKeyUp: function (e)
		{
			// @event keyUp
			this.trigger('keyUp'
				//@class ItemsSearcher.View.KeyDown.Properties
			,	{
					//@property {Array<Item.Model>} collection
					collection: this.collection.models
					//@property {jQueryEvent} eventObject
				,	eventObject: e
					//@property {String} currentQuery
				,	currentQuery: this.getCurrentQuery()
				});

			//@class ItemsSearcher.View
		}

		//@method onKeyDown Cleans the input field and hide the reset button on enter
		//@param {jQueryEvent} e
		//@return {Void}
	,	onKeyDown: function (e)
		{
			var current_text = this.$searchElement.typeahead('val');

			if (this.options.selectedItem && current_text !== this.getItemDisplayName(this.options.selectedItem, this.options.query))
			{
				this.options.selectedItem = null;

				this.trigger('itemSelected'
				,	{
						selectedItem: null
					,	collection: this.collection.models
					,	currentQuery: this.options.query
					});
			}

			// @event keyDown
			this.trigger('keyDown'
				//@class ItemsSearcher.View.KeyDown.Properties
			,	{
					//@property {Array<Item.Model>} collection
					collection: this.collection.models
					//@property {jQueryEvent} eventObject
				,	eventObject: e
					//@property {String} currentQuery
				,	currentQuery: this.getCurrentQuery()
			});
			//@class ItemsSearcher.View
		}

		//@method destroy Override default implementation to clean up all attached events of the initialize
		//@return {Void}
	,	destroy: function ()
		{
			this.off('afterViewRender');
			this.$searchElement.off('click');

			Backbone.View.prototype.destroy.apply(this, arguments);
		}

		// @method getContext
		// @returns {ItemsSearcher.View.Context}
	,	getContext: function ()
		{
			// @class ItemsSearcher.View.Context
			return {
                //@property {String} defaultPlaceholderLabel
                placeholderLabel: this.options.placeholderLabel
				// @property {Number} maxLength
			,	maxLength: this.options.maxLength
				// @property {Boolean} showId
			,	showId: !!this.options.componentId
				// @property {String} id
			,	id: this.options.componentId
				// @property {Boolean} showName
			,	showName: !!this.options.componentName
				// @property {String?} name
			,	name: this.options.componentName
			};
			// @class ItemsSearcher.View
		}
	});

	return ItemsSearcherView;
});
