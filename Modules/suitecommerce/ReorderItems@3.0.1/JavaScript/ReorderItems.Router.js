/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReorderItems
define('ReorderItems.Router'
,	[	'ReorderItems.List.View'
	,	'ReorderItems.Collection'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		ReorderItemsListView
	,	ReorderItemsCollection
	,	Backbone
	,	Utils
	)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'reorderItems': 'reorderItems'
		,	'reorderItems?:options': 'reorderItems'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	reorderItems: function (options)
		{
			if (options)
			{
				options = Utils.parseUrlOptions(options);
			}
			else
			{
				options = {page: 1};
			}

			var collection = new ReorderItemsCollection()
			,	view = new ReorderItemsListView({
					application: this.application
				,	sort: options.sort || 0
				,	order_id: options.order_id || 0
				,	order_number: options.order_number || 0
				,	page: options.page || 1
				,	collection: collection
				});

			if (view.order_id)
			{
				collection.set({
					order_id: view.order_id
				});
			}

			view.collection.on('reset', view.render, view);
			view.showContent();
		}
	});
});