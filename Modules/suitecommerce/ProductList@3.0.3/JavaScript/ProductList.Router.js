/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.Router'
,	[	'ProductList.Model'
	,	'ProductList.Details.View'
	,	'ProductList.Lists.View'
	,	'ProductList.Item.Collection'

	,	'underscore'
	,	'Backbone'
	,	'Utils'
	]
,	function (
		ProductListModel
	,	ProductListDetailsView
	,	ProductListListsView
	,	ProductListItemCollection

	,	_
	,	Backbone
	)
{
	'use strict';

	// @class ProductList.Router Router for handling Product lists @extends Backbone.Router
	return Backbone.Router.extend({

		routes:
		{
			'wishlist': 'showProductListsList'
		,	'wishlist/?*options': 'showProductListsList'
		,	'wishlist/:id': 'showProductListDetails'
		,	'wishlist/:id/?*options': 'showProductListDetails'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

		// @method showProductListDetails resolve the Product list details routes that can be of form /wishlist/$(internalid) or
		// /wishlist/tmpl_$(templateid) in the case the record doesn't exist yet (predefined lists)
		// @param  {String} id @param {Object} options
	,	showProductListDetails: function (id, options)
		{
			var prefix = 'tmpl_'
			,	self = this
			,	index_of_question = id.indexOf('?')
			,	internalid;

			if (index_of_question !== -1)
			{
				options = id.substring(index_of_question);
				internalid = parseInt(id, 10);

				if (!isNaN(internalid))
				{
					id = internalid + '';
				}
			}

			var utils = self.application.ProductListModule.Utils;

			if (id.indexOf(prefix) === 0)
			{
				// then this is a predefined template that doesn't exist yet (without internalid)
				var template_id = id.substring(prefix.length, index_of_question !== -1 ? index_of_question : id.length)
				,	product_lists_promise = utils.getProductLists().fetch();

				product_lists_promise.done(function()
				{
					var template_product_list = utils.getProductLists().findWhere({templateId: template_id})
					,	items = template_product_list.get('items');

					if (_.isArray(items))
					{
						template_product_list.set('items', new ProductListItemCollection(items));
					}

					self.doShowProductListDetails(template_product_list, options);
				});
			}
			else
			{
				utils.getProductList(id).done(function(model)
				{
					self.doShowProductListDetails(new ProductListModel(model), options);
				});
			}
		}

		// @method doShowProductListDetails Render the product list details view @param {ProductList.Model} model @param {Object} options
	,	doShowProductListDetails: function (model, options)
		{
			var params_options = _.parseUrlOptions(options)
			,	view = new ProductListDetailsView({
				application: this.application
			,	params: params_options
			,	model: model
			,	includeSortingFilteringHeader: true
			});

			view.showContent();
		}

		// @method showProductListsList Render the product lists landing page @param {Object} options
	,	showProductListsList: function (options)
		{
			var self = this;
			this.application.ProductListModule.Utils.getProductListsPromise().done(function ()
			{
				var params_options = _.parseUrlOptions(options)
				,	view = new ProductListListsView({
						application: self.application
					,	params: params_options
					,	collection: self.application.ProductListModule.Utils.getProductLists()
					});

				view.showContent();
			});
		}
	});
});
