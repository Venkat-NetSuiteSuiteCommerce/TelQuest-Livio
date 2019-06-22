/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.Utils',
	[
		'ProductList.Collection'
	,	'ProductList.Model'
	,	'Profile.Model'
	,	'ProductList.ControlSingle.View'
	,	'ProductList.Control.View'
	,	'ProductList.Item.Model'
	,	'MenuTree.View'
	,	'underscore'
	,	'jQuery'
	,	'ProductList.CartSaveForLater.View'
	]
,	function
	(
		ProductListCollection
	,	ProductListModel
	,	ProfileModel
	,	ProductListControlSingleView
	,	ProductListControlView
	,	ProductListItemModel
	,	MenuTreeView

	,	_
	,	jQuery
	)
{
	'use strict';

	var	productListsInstancePromise
	,	productListsInstance;

	// @class ProductList.Utils an utility class to support the ProductList ApplicationModule. It will define shortcut accessors to product lists, render the controls on 'afterAppendView' and show and define the MyAccount menu items.
	return function (application)
	{
		return {
			// @method getProductListsPromise Loads Product Lists collection model singleton @return {jQuery.Deferred}
			getProductListsPromise : function ()
			{
				if (!productListsInstancePromise)
				{
					productListsInstancePromise = jQuery.Deferred();
					productListsInstance = new ProductListCollection();
					productListsInstance.application = application;

					productListsInstance.fetch({cache:false}).done(function (jsonCollection)
					{
						productListsInstance.reset(jsonCollection);
						productListsInstancePromise.resolve(productListsInstance);
					});
				}

				return productListsInstancePromise;
			}

			// @method productListsPromiseDone method to be called once the product lists are loaded to show the MyAccount's menu item
		,	productListsPromiseDone: function ()
			{
				// Replace dummy menu item from My Account
				var layout = application.getLayout()
				,	menu_tree = MenuTreeView.getInstance();

				menu_tree.replaceMenuItem(
					function (menuitem)
					{
						return menuitem && menuitem.id === 'product_list_dummy';
					}
				,	function (application)
					{
						var utils = application.ProductListModule.Utils;
						if (!utils.isProductListEnabled())
						{
							return undefined;
						}

						var product_lists = utils.getProductLists()
						,	actual_object = {

							id: function ()
							{
								// Returns the correct id of the list in the case of single list and 'productlists' otherwise.
								var is_single_list = utils.isSingleList();

								if (is_single_list)
								{
									var the_single_list = product_lists.at(0);

									// Check if it's a predefined list before return
									return 'productlist_' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateId')));
								}
								else
								{
									return 'productlists';
								}
							}
						,	name: function ()
							{
								// The name of the first list in the case of single list or generic 'Product Lists' otherwise
								return utils.isSingleList() ?
									product_lists.at(0).get('name') :
									_('Wishlist').translate();
							}
						,	url: function ()
							{
								// Returns a link to the list in the case of single list and no link otherwise.
								var is_single_list = utils.isSingleList();
								if (is_single_list)
								{
									var the_single_list = product_lists.at(0);
									return 'wishlist/' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateId')));
								}
								else
								{
									return '';
								}
							}
							// Index of the menu item for menu order
						,	index: 2
							// Sub-menu items
						,	children: function ()
							{
								// If it's single list, there is no sub-menu
								if (utils.isSingleList())
								{
									return [];
								}
								// The first item (if not single list) has to be a link to the landing page
								var items = [
									{
										id: 'productlist_all'
									,	name: _('All my lists').translate()
									,	url: 'wishlist/?'
									,	index: 1
									}
								];
								// Then add all the lists
								product_lists.each(function (productlist)
								{
									items.push({
										id: 'productlist_' + (productlist.get('internalid') || 'tmpl_' + productlist.get('templateId'))
									,	url: 'wishlist/' + (productlist.get('internalid') || 'tmpl_' + productlist.get('templateId'))
									,	name: productlist.get('name') + ' (' + productlist.get('items').length + ')'
									,	index: 2
									});
								});

								return items;
							}
						};
						return actual_object;
					}
				);

				menu_tree.updateMenuItemsUI();

				if (application.ProductListModule.Utils.isSingleList())
				{
					// Update header profile link for single product list...
					var the_single_list = application.ProductListModule.Utils.getProductLists().at(0)
					,	product_list_menu_item = layout.$('.header-profile-single-productlist');

					if (the_single_list && product_list_menu_item)
					{
						var product_list_hashtag = '#wishlist/' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateId')));

						product_list_menu_item.text(the_single_list.get('name'));
						product_list_menu_item.attr('data-hashtag', product_list_hashtag);
					}
				}
			}

			// @method profileModelPromiseDone method to be executed once the user profile has loaded. We need this to start working with product lists.
		,	profileModelPromiseDone : function ()
			{
				var utils = application.ProductListModule.Utils;
				// if Product Lists are not enabled, return...
				if (!utils.isProductListEnabled())
				{
					return;
				}

				var layout = application.getLayout();

				// rendering product lists
				utils.renderProductLists();

				layout.on('afterAppendView', function (view)
				{
					utils.renderProductLists(view);
				});

				layout.on('afterAppendToDom', function ()
				{
					utils.renderProductLists();
				});

				// Put this code block outside afterAppendView to avoid infinite loop!
				utils.getProductListsPromise().done(utils.productListsPromiseDone);

				ProductListItemModel.prototype.keyMapping = application.getConfig('itemKeyMapping', {});
				ProductListItemModel.prototype.itemOptionsConfig = application.getConfig('itemOptions', []);
			}

			// @method getProductLists @return {ProductList.Collection}
		,	getProductLists : function ()
			{
				if (!productListsInstance)
				{
					productListsInstance = new ProductListCollection();
					productListsInstance.application = application;
				}

				return productListsInstance;
			}

			// @method getProductList obtain a single ProductList with all its item's data @return {ProductList.Model}
		,	getProductList : function (id)
			{
				var productList = new ProductListModel();

				productList.set('internalid', id);

				return productList.fetch();
			}

			// @method getSavedForLaterProductList obtain a single Saved for Later ProductList with all its item's data @return {jQuery.Deferred}
		,	getSavedForLaterProductList : function ()
			{
				var productList = new ProductListModel();

				productList.set('internalid', 'later');

				return productList.fetch();
			}

		,	getRequestAQuoteProductList : function ()
			{
				var productList = new ProductListModel();

				productList.set('internalid', 'quote');

				return productList.fetch();
			}

			// @method isProductListEnabled is the Product-List functionality available for this application? @return {Boolean}
		,	isProductListEnabled: function ()
			{
				return SC.ENVIRONMENT.PRODUCTLIST_ENABLED;
			}

			// @method isSingleList are we in the single-list modality ? @return {Boolean}
		,	isSingleList: function ()
			{
				return !application.getConfig('productList.additionEnabled', false) &&
					_.filter(application.getConfig('productList.listTemplates', []), function (pl)
						{
							return !pl.typeName || (pl.typeName !== 'later' && pl.typeName !== 'quote');
						}).length === 1 ;
			}

			// @method renderProductLists render all product-lists related widgets @param {Backbone.View} view
		,	renderProductLists: function (view)
			{
				if (!application.ProductListModule.Utils.isProductListEnabled())
				{
					return;
				}

				application.ProductListModule.Utils.renderControl(view);
			}

			// @method internalGetProductId Gets the internal product id for a store item considering it could be a matrix child.
			// @param {Item.Model} product
			// @return {String}
		,	internalGetProductId: function (product)
			{
				// If its matrix its expected that only 1 item is selected, not more than one nor 0
				if (product.getPosibleOptions().length)
				{
					var selected_options = product.getSelectedMatrixChilds();

					if (selected_options.length === 1)
					{
						return selected_options[0].get('internalid') + '';
					}
				}

				return product.get('_id') + '';
			}

			// @property {control:String} placeholder this application will render some of its views in existing DOM elements (placeholders)
		,	placeholder: {control: '[data-type="product-lists-control"]'}

			// @method renderControl renders the control used in shopping pdp and quickview @param {Backbone.View} view
		,	renderControl: function (view_)
			{
				var utils = application.ProductListModule.Utils;
				jQuery(this.placeholder.control).each(function ()
				{
					var view = view_ || application.getLayout().currentView
					,	is_single_list_mode = utils.isSingleList()
					,	$container = jQuery(this)
					,	product_lists_promise = utils.getProductListsPromise();

					product_lists_promise.done(function ()
					{
						// this control needs a reference to the StoreItem model !
						if (view && view.model && view.model.getPosibleOptions)
						{
							var control = null;

							if (is_single_list_mode)
							{
								control = new ProductListControlSingleView({
									collection: utils.getProductLists()
								,	product: view.model
								,	application: application
								});
							}
							else
							{
								view.countedClicks = {};

								control = new ProductListControlView({
									collection: utils.getProductLists()
								,	product: view.model
								,	application: application
								,	isDisabledWishlistButton: !!jQuery(utils.placeholder.control).data('disabledbutton')
								,	countedClicks: view.countedClicks
								});
							}

							$container.empty().append(control.$el);
							control.render();
						}
					});

					if (product_lists_promise.state() === 'pending')
					{
						$container.empty().append('<button class="product-list-control-button-wishlist">' + (is_single_list_mode ? _('Loading List...').translate() : _('Loading Lists...').translate()) + '</button>');
					}
				});
			}
		};
	};
});
