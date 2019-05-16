/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Quote
define(
		'Quote.Router'
,	[
		'Quote.Model'
	,	'Quote.Collection'
	,	'Quote.List.View'
	,	'Quote.Details.View'
	,	'AjaxRequestsKiller'

	,	'Backbone'
	,	'jQuery'
	]
,	function (
		Model
	,	Collection
	,	ListView
	,	DetailsView
	,	AjaxRequestsKiller

	,	Backbone
	,	jQuery
	)
{
	'use strict';

	// @class Quote.Router @extends Backbone.Router
	return Backbone.Router.extend({

		//@property {Object} routes
		routes: {
			'quotes': 'list'
		,	'quotes?:options': 'list'
		,	'quotes/:id': 'details'
		}

		//@method initialize
		//@param {ApplicationSkeleton} application
		//@return {Void}
	,	initialize: function (application)
		{
			this.application = application;
		}

		//@method list Handle the quotes route and show the Quote List View
		//@return {Void}
	,	list: function ()
		{
			var collection = new Collection()
			,	view = new ListView({
					application: this.application
				,	collection: collection
				});

			collection.on('reset', jQuery.proxy(view, 'showContent', 'quotes'));

			view.showContent('returns');
		}

		//@method list Handle the quotes?:options and quote/id routes and show the quotes details
		//@return {Void}
	,	details: function (id)
		{
			var model = new Model({
					internalid: id
				})

			,	view = new DetailsView({
					application: this.application
				,	model: model
				});

			model.fetch({
				killerId: AjaxRequestsKiller.getKillerId()
			}).then(jQuery.proxy(view, 'showContent', 'quotes'));
		}
	});
});
