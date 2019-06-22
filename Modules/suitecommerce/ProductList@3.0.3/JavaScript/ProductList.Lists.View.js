/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.Lists.View'
,	[
		'ProductList.Model'
	,	'ProductList.Item.Collection'
	,	'ProductList.Edit.View'
	,	'MenuTree.View'
	,	'ProductList.AddedToCart.View'
	,	'GlobalViews.Confirmation.View'

	,	'product_list_lists.tpl'

	,	'LiveOrder.Model'
	,	'ProductList.ListDetails.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'SC.Configuration'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Backbone.View'
	,	'Backbone.View.render'
	,	'Utils'
	]
,	function (
		ProductListModel
	,	ProductListItemCollection
	,	ProductListCreationView
	,	MenuTreeView
	,	ProductListAddedToCartView
	,	GlobalViewsConfirmationView

	,	product_list_lists_tpl

	,	LiveOrderModel
	,	ProductListListDetailsView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	Configuration

	,	_
	,	jQuery
	,	Backbone
	)
{
	'use strict';

	// @class ProductList.Lists.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_lists_tpl

	,	title: _('Wishlist').translate()

	,	className: 'ProductListListsView'

	,	attributes: {'class': 'ProductListListsView'}

	,	events:
		{
			'change [data-action="sort-by"]': 'sortBy'
		,	'click [data-action="add-list"]': 'createProductList'
		,	'click [data-action="delete-list"]': 'askDeleteList'
		,	'click [data-action="edit-list"]': 'editListHandler'
		,	'click [data-action="share-list"]': 'shareList'
		,	'click [data-action="add-to-cart"]': 'addListToCartHandler'
		,	'click [data-action="select"]': 'toggleProductListHandler'
		,	'click [data-action="navigate"]': 'navigateToItems'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;

			BackboneCompositeView.add(this);
		}

	,	render: function()
		{
			Backbone.View.prototype.render.apply(this, arguments);
			//if there are no list we show the list creation form
			if (!this.collection.length)
			{
				this.newProductListView = new ProductListCreationView({
					application: this.application
				,	parentView: this
				,	model: new ProductListModel() //create!
				});
				this.newProductListView.render();
				this.$('[data-type="new-product-list"]').append(this.newProductListView.$el);
			}
		}

		// @method createProductList Show create new product list modal form
	,	createProductList: function ()
		{
			this.newProductListView = new ProductListCreationView({
				application: this.application
			,	parentView: this
			,	model: new ProductListModel() //create!
			});

			this.application.getLayout().showInModal(this.newProductListView);
		}

		// @method askDeleteList starts the 'delete a list' use case
	,	askDeleteList: function (e)
		{
			this.deleteConfirmationView = new GlobalViewsConfirmationView({
				callBackParameters: {
					target: e.target
				,	context: this
				}
			,	callBack: this.deleteListHandler
			,	title: _('Delete list').translate()
			,	autohide: false
			,	body: _('Are you sure you want to remove this list?').translate()
			});
			this.application.getLayout().showInModal(this.deleteConfirmationView);
		}

		// @method deleteListHandler called from the sub view when the user confirms he wants to delete the product list.
	,	deleteListHandler: function (options)
		{
			var self = options.context
			,	target = options.target
			,	list = self.getListFromDom(jQuery(target));

			self.collection.remove(list);
			list.url = ProductListModel.prototype.url;

			list.destroy().done(function ()
			{
				MenuTreeView.getInstance().updateMenuItemsUI();
				self.render();
				self.showConfirmationMessage(
					_('Your <span class="product-list-name">$(0)</span> list was removed').
						translate(list.get('name'))
				);
				self.deleteConfirmationView.$containerModal.modal('hide');
			});
		}

		// @method highlightList temporarily highlights a list that has been recently added or edited
	,	highlightList: function (internalid)
		{
			var $list_dom = jQuery(this.el).find('article[data-product-list-id='+ internalid +']');
			if ($list_dom)
			{
				$list_dom.addClass('new-list');

				setTimeout( function ()
				{
					$list_dom.removeClass('new-list');
				},3000);
			}
		}

		// @method addListToCartHandler Add list to cart click handler
	,	addListToCartHandler: function (e)
		{
			var list = this.getCurrentList(e);
			this.addListToCart(list);
		}

		// @method Adds an entire list to the cart @param {ProductList.Model} list
	,	addListToCart: function (list)
		{
			// collect the items data to add to cart
			var lines_to_add = []
			,	self = this
			,	not_purchasable_items_count = 0;

			list.get('items').each(function (pli)
			{
				if (pli.get('item').get('_isPurchasable'))
				{
					lines_to_add.push(pli);
				}
				else
				{
					not_purchasable_items_count++;
				}
			});

			if (lines_to_add.length === 0)
			{
				var errorMessage = _('All items in the list are not available for purchase.').translate();

				self.showWarningMessage(errorMessage);

				return;
			}

			// add the items to the cart and when its done show the confirmation view
			LiveOrderModel.getInstance().addProducts(lines_to_add).done(function ()
			{
				// before showing the confirmation view we need to fetch the items of the list with all the data.
				self.application.ProductListModule.Utils.getProductList(list.get('internalid')).done(function(model)
				{
					self.addedToCartView = new ProductListAddedToCartView({
						application: self.application
					,	parentView: self
					,	list: new ProductListModel(model) //pass the model with all the data
					,	not_purchasable_items_count: not_purchasable_items_count
					});

					// also show a confirmation message
					var confirmMessage;

					if (list.get('items').length > 1)
					{
						confirmMessage =  _('Good! $(0) items from your <a class="product-list-name" href="/wishlist/$(1)">$(2)</a> list were successfully added to your cart. You can continue to <a href="">view your cart and checkout</a>')
							.translate(list.get('items').length, list.get('internalid'), list.get('name'));
					}
					else
					{
						confirmMessage =  _('Good! $(0) item from your <a class="product-list-name" href="/wishlist/$(1)">$(2)</a> list was successfully added to your cart. You can continue to <a href="" data-touchpoint="viewcart">view your cart and checkout</a>')
							.translate(list.get('items').length, list.get('internalid'), list.get('name'));
					}

					self.showConfirmationMessage(confirmMessage);
					self.application.getLayout().showInModal(self.addedToCartView);
				});
			});
		}

		// @method editListHandler Edit list click handler
	,	editListHandler: function (e)
		{
			var list = this.getListFromDom(jQuery(e.target));
			this.editList(list);
		}

		// @method getListFromDom Get the list (collection) from DOM @return {ProductList.Model}
	,	getListFromDom: function ($target)
		{
			var list_id = $target.closest('[data-product-list-id]').data('product-list-id') + '';

			return this.options.collection.where({internalid: list_id})[0];
		}

		// @method editList Edit list click handler (displays edit list modal view) @param {ProductList.Model} list
	,	editList: function (list)
		{
			this.newProductListView = new ProductListCreationView({
				application: this.application
			,	parentView: this
			,	model: list
			,	inModal: true
			});

			this.application.getLayout().showInModal(this.newProductListView);
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'productlist_all';
		}

		// @method getBreadcrumbPages
	,	getBreadcrumbPages: function()
		{
			return {
				text: _('Wishlist').translate()
			,	href: '/wishlist'
			};
		}

		// @method toggleProductListItemHandler
	,	toggleProductListItemHandler: function (e)
		{
			this.toggleProductListItem(jQuery(e.target).closest('article').data('id'));
		}

		// @method toggleProductListHandler
	,	toggleProductListHandler: function (e)
		{
			this.toggleProductList(jQuery(e.target).closest('article').data('id'));
		}

		// @method toggleProductList @param {String} pl_internalid
	,	toggleProductList: function (pl_internalid)
		{
			var pl = this.collection.get(pl_internalid);

			if (pl)
			{
				this[pl.get('checked') ? 'unselectProductList' : 'selectProductList'](pl);
				this.render();
			}
		}

		// @method selectProductList @param {ProductList.Model} pl
	,	selectProductList: function (pl)
		{
			if (pl)
			{
				pl.set('checked', true);
			}
		}

		// @method unselectProductList @param {ProductList.Model} pl
	,	unselectProductList: function (pl)
		{
			if (pl)
			{
				pl.set('checked', false);
			}
		}

		// @method getCurrentList @returns {ProductList.Model}
	,	getCurrentList: function (e)
		{
			var list_id = jQuery(e.target).closest('[data-product-list-id]').data('product-list-id') + ''
			,	list = this.options.collection.findWhere({
					internalid: list_id
				});

			return list;
		}

		// @method navigateToItems
	,	navigateToItems: function (e)
		{
			//ignore clicks on anchors and buttons
			if (_.isTargetActionable(e))
			{
				return;
			}

			var list = this.getCurrentList(e)
			,	internalid = list.get('internalid')
			,	url = '/wishlist/' + (internalid ? internalid : 'tmpl_' + list.get('templateid'));

			Backbone.history.navigate(url, {trigger: true});
		}

	,	childViews:
		{
			'ProductList.ListDetails': function ()
			{
				return new BackboneCollectionView({
					childView: ProductListListDetailsView
				,	viewsPerRow: 1
				,	collection: this.collection
				});
			}
		}

		// @method getContext @return {ProductList.Lists.View.Context}
	,	getContext: function()
		{
			// @class ProductList.Lists.View.Context
			return {
				// @property {Boolean} hasLists
				hasLists: this.collection.length
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
				//@property {Boolean} isSingleList
			,	isSingleList: this.application.ProductListModule.Utils.isSingleList()
			};
		}
	});
});
