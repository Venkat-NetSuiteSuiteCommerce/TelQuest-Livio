/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Content
define(
	'Content.DataModels'
,	[	'Singleton'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Utils'
	,	'AjaxRequestsKiller'
	,	'Backbone.CachedModel'
	,	'Backbone.CachedCollection'
	]
,	function (
		Singleton
	,	Backbone
	,	_
	,	jQuery
	,	Utils
	,	AjaxRequestsKiller
	)
{
	'use strict';

	var Pages = {};

	// @class Pages.Model Represents the definition of a page. Interact with the Content Delivery Service
	// BEWARE: If you change the URL Root of your "Content Delivery Service" SSP Application
	// you need to update the urlRoot of this model @extends Backbone.CachedModel
	Pages.Model = Backbone.CachedModel.extend({
		urlRoot: Utils.getAbsoluteUrl('../cds/services/page.ss')
	});

	// @class Pages.Collection Singleton containing a reference of all pages already loaded
	// Interact with the Content Delivery Service. BEWARE: If you change the URL Root of your "Content Delivery Service" SSP Application
	// you need to update the urlRoot of this model @extends Backbone.CachedCollection
	Pages.Collection = Backbone.CachedCollection.extend({
		url: Utils.getAbsoluteUrl('../cds/services/page.ss')

		//@property {Class<Pages.Model>} model
	,	model: Pages.Model
	}, Singleton);

	var Urls = {};

	// @class Urls.Model Represents a single url and the page definition they point to @extends Backbone.Model
	Urls.Model = Backbone.Model.extend({
		urlRoot: Utils.getAbsoluteUrl('../cds/services/url.ss')
	});

	// @class Urls.Collection Implements the url matching logic @extends Backbone.Collection
	Urls.Collection = Backbone.Collection.extend({

		url: Utils.getAbsoluteUrl('../cds/services/url.ss')

		//@property {Class<Urls.Model>} model
	,	model: Urls.Model

	,	initialize: function ()
		{
			this.regExpGraphRoot = new Urls.Model({ childs: [] });
			this.regExpGraphHelper = [];
			this.landingPages = [];
			this.exactMatchHash = {};

			this.on('reset', this.reseter);
		}

		// @method reseter
		// Every-time this collection is reseted, this function generates a couple of helper structures:
		// * URLs.Collection.landingPages: Array of all url pointing to a landing page
		// * URLs.Collection.exactMatchHash: Hash table of all url that does not have in it
		// * URLs.Collection.regExpGraphRoot: Graph were URLs are farther from the root when they are more specific.
	,	reseter: function ()
		{
			this.regExpGraphRoot = new Urls.Model({ childs: [] });
			this.regExpGraphHelper = [];
			this.landingPages = [];
			this.exactMatchHash = {};

			var self = this;

			// Iterates all urls
			this.each(function (model)
			{
				// If the URL is * and its and its not a Landing page, it will be set as Urls.Collection.defaultModel
				if (model.get('query') === '*' && model.get('type') !== '1')
				{
					if (!Urls.Collection.defaultModel)
					{
						Urls.Collection.defaultModel = model;
					}
				}
				// If the url contains * and its and its not a Landing page,
				// It gets translated to a regular expression and injected into the this.regExpGraphRoot
				// By comparing one another with other regular expressions (this.insertInGraph)
				else if (~model.get('query').indexOf('*') && model.get('type') !== '1')
				{
					// Creates the Regular Expression to match urls against
					var regular_expresion = new RegExp('^' + _.map(model.get('query').split('*'), function (token)
					{
						return token.replace(/\//ig, '\\/').replace(/\?/ig, '\\?');
					}).join('(.*?)') + '$');

					// Sets the proper attributes
					model.set({
						regexp: regular_expresion,
						childs: []
					});

					// Now we insert it in the graph
					self.insertInGraph(model, self.regExpGraphRoot);

					/// We will just check if the new node is parent of a previously added node
					_.each(self.regExpGraphHelper, function (currentNode)
					{
						if (!_.contains(model.get('childs'), currentNode) && model.get('regexp').test(currentNode.get('query')))
						{
							model.get('childs').push(currentNode);
						}
					});
					self.regExpGraphHelper.push(model);
				}
				// Other way its an exact match then we add it to this.exactMatchHash
				else
				{
					self.exactMatchHash[model.get('query')] = model;

					// if it's a landing page we should add it to the collection of URL we will be adding to the router
					if (model.get('type') === '1')
					{
						self.landingPages.push(model);
					}
				}
			});
		}

		// @method insertInGraph Given a node it tries to injected into the graph
		// @param {Urls.Model} node @param {Urls.Model} root
	,	insertInGraph: function (node, root)
		{
			var isParent = true,
				self = this;

			// walks all child nodes
			_.each(root.get('childs'), function (branch)
			{
				if (branch.get('query') !== node.get('query'))
				{
					// is it covered by a more broad expression?
					if (branch.get('regexp').test(node.get('query')))
					{
						isParent = false;
						self.insertInGraph(node, branch);
					}
					// Is it broader than then current branch
					else if (node.get('regexp').test(branch.get('query')))
					{
						node.get('childs').push(branch);
						root.set('childs', _.without(root.get('childs'), branch));
					}
				}
			});

			// the node is not a child nor a parent is a brother
			if (isParent && !~_.indexOf(root.get('childs'), node))
			{
				root.get('childs').push(node);
			}
		}

		// @method findUrl For the passed in URL looks for the most appropriate Erl model to return
		// @param {String} URL @return {String|false}
	,	findUrl: function (url)
		{
			// Here we do a table hash lookup (Super fast!)
			var exact_match = this.exactMatchHash[url];

			if (exact_match)
			{
				return exact_match;
			}
			else
			{
				// lets do a lookup in our regexp graph
				this.candidates = {}; // Here we will store URL_ID : Number of edges
				this.walkRegExpGraph(url, this.regExpGraphRoot, 1);

				var result = _.max(_.pairs(this.candidates), function (candidate)
				{
					return candidate[1];
				});

				return result && typeof result === 'object' ? this.get(result[0]) : false;
			}
		}

		// @method walkRegExpGraph Recursive function used by the findUrl to traverse the url graph
		// @param {String} url @param {Urls.Model} branch @param {Number} deep
	,	walkRegExpGraph: function (url, branch, deepth)
		{
			var self = this;
			// Walks all the childs of the current branch
			_.each(branch.get('childs'), function (new_branch)
			{
				if (new_branch.get('regexp').test(url))
				{
					// if the current child (which is also a branch) passes the test it will go down the line
					// and it adds 1 edge to the candidates object
					self.candidates[new_branch.cid] = (self.candidates[new_branch.cid]) ? self.candidates[new_branch.cid] + deepth : deepth;
					self.walkRegExpGraph(url, new_branch, deepth + 1);
				}
			});
		}

	}, Singleton);

	// This is a private variable that will holds all the requests we have made, tho it's public you should try to avoid using it, and call Content.load instead
	var currentRequests = [];

	// loadPage:
	// This Function takes care of loading the content for the passed URL.
	// if a done function is passed it will be called whenever we have content,
	// if no content is provided for the current URL,
	// the done function will be called right away with false as a parameter
	function loadPage (url, donefn)
	{
		/*jshint validthis:true*/
		donefn = donefn || jQuery.noop;

		if (url)
		{
			// Looks in the array of registered urls
			var foundUrl = Urls.Collection.getInstance().findUrl(url);

			// The URL is registered in the collection
			if (foundUrl)
			{
				// Gets the page for the URL
				var page_id = foundUrl.get('pageid')
				,	page = Pages.Collection.getInstance().get(page_id);

				if (page)
				{
					donefn(page);
				}
				// We don't have it need to be fetched
				else
				{
					// Fetches the page
					new Pages.Model({internalid: page_id, id: page_id}).fetch({
							data: {
								cache: this.Application.getConfig('cache.contentPageCdn')
							,	ttl: this.Application.getConfig('cache.contentPageTtl')
							}
						,	killerId: AjaxRequestsKiller.getKillerId()
						,	reset: true
						}).done(function (loaded_page)
						{
							Pages.Collection.getInstance().add(loaded_page);
							page = Pages.Collection.getInstance().get(page_id);
							donefn(page);
						});
				}
			}
			// No URL is found
			else
			{
				donefn(false);
			}
		}
		// No URL is passed
		else
		{
			donefn(false);
		}
	}

	return {
		Urls: Urls,
		Pages: Pages,
		currentRequests: currentRequests,
		loadPage: loadPage
	};
});
