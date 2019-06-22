/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.DetailsLater.View'
	,	[
			'product_list_details_later.tpl'
		,	'ProductList.DetailsLaterMacro.View'
		,	'ProductList.Details.View'
		,	'ProductList.Deletion.View'
		,	'LiveOrder.Model'
		,	'Profile.Model'
		
		,	'Backbone.CollectionView'
		,	'Backbone.CompositeView'

		,	'products_detail_later_cell.tpl'
		,	'backbone_collection_view_row.tpl'		

		,	'underscore'
		,	'jQuery'
		,	'Backbone'
		,	'Backbone.View'
		,	'Backbone.View.render'
		]
	,	function(
			product_list_details_later_tpl
		,	ProductListDetailsLaterMacroView
		,	ProductListDetailsView
		,	ProductListDeletionView
		,	LiveOrderModel
		,	ProfileModel

		,	BackboneCollectionView
		,	BackboneCompositeView

		,	products_detail_later_cell_tpl
		,	backbone_collection_view_row_tpl		

		,	_
		,	jQuery		
		,	Backbone
		)
{
	'use strict';

	var product_list_promise;

	// @class ProductList.DetailsLater.View @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_details_later_tpl

	,	events: {
			// items events
			'click [data-action="add-to-cart"]' : 'addItemToCartHandler'
		,	'click [data-action="delete-item"]' : 'askDeleteListItem'
		,	'change [data-action="change-quantity"]': 'updateItemQuantity'
		,	'keyup [data-action="change-quantity"]': 'updateItemQuantity'
		,	'click [data-ui-action="add"]' : 'addQuantity'
		,	'click [data-ui-action="minus"]' : 'subQuantity'
		}

	,	initialize: function(options)
		{
			//this.loadProductList();
			BackboneCompositeView.add(this);
		
			this.options = options;
			this.application = options.application;
			this.cart = LiveOrderModel.getInstance();

			this.model.on('change', this.render, this);

			this.model.get('items').on('add remove change reset', this.render, this);

			this.promise = this.loadProductList();
		}

	,	render: function ()
		{

			if (ProfileModel.getInstance().get('isLoggedIn') === 'T')
			{
				this._render();
				
				this.$('[data-action="pushable"]').scPush();
					}
			else
			{
				this.$el.empty();
			}

			return this;
		}

	,	loadProductList: function ()
		{
			var self = this;

			if (!product_list_promise)
			{
				ProfileModel.getPromise().done(function()
				{
					if(ProfileModel.getInstance().get('isLoggedIn') === 'T')
					{
						product_list_promise = self.options.application.ProductListModule.Utils.getSavedForLaterProductList().done(function (attributes)
						{
							self.model.set(attributes);
						});
					}
				});
			}

			return product_list_promise;
		}

		// @method addItemToCartHandler Add a particular item into the cart
	,	addItemToCartHandler : function (e)
		{
			e.stopPropagation();
			e.preventDefault();

			var selected_product_list_item_id = this.$(e.target).closest('article').data('id')
			,	selected_product_list_item = this.model.get('items').get(selected_product_list_item_id)
			,	add_to_cart_promise = this.cart.addLine(selected_product_list_item)
			,	whole_promise = jQuery.when(add_to_cart_promise, this.deleteListItem(selected_product_list_item));//.then(jQuery.proxy(this, 'executeAddToCartCallback'));


			this.disableElementsOnPromise(whole_promise,  this.$(e.target).closest('article').find('button'));
		}

		// @method addQuantity Increase the product's Quantity by 1
		// @param {HTMLEvent} e 
	,	addQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseFloat(oldValue) + 1;

			var input = $element.parent().find('input');

			input.val(newVal);
			input.trigger('change');
		}

		// @method subQuantity Decreases the product's Quantity by 1
		// @param {HTMLEvent} e
	,	subQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseFloat(oldValue) - 1;

			newVal = Math.max(1, newVal);

			var input = $element.parent().find('input');

			input.val(newVal);
			input.trigger('change');
		}

		// @method askDeleteListItem opens a confirmation dialog for deleting an item from the Saved for Later list.
		// @param {HTMLEvent} e
	,	askDeleteListItem : function (e)
		{
			e.stopPropagation();

			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	title: _('Delete selected items').translate()
			,	body: _('Are you sure you want to remove selected items?').translate()
			,	confirmLabel: _('Yes').translate()
			,	confirm_delete_method: 'deleteListItemHandler'
			});

			this.deleteConfirmationView.showInModal();
		}

		// @method deleteListItemHandler deletes a single item from the Saved for Later list.
		// @param {HTMLEvent} e
	,	deleteListItemHandler: function (target)
		{
			var self = this
			,	itemid = jQuery(target).closest('article').data('id')
			,	product_list_item = this.model.get('items').findWhere({
					internalid: itemid + ''
				})
			,	success = function ()
			{
				if (self.application.getLayout().updateMenuItemsUI)
				{
					self.application.getLayout().updateMenuItemsUI();
				}

				self.deleteConfirmationView.$containerModal.modal('hide');
				self.render();
				self.showConfirmationMessage(_('The item was removed from your product list').translate(), true);
			};

			self.model.get('items').remove(product_list_item);		
			self.deleteListItem(product_list_item, success);
		}

	,	deleteListItem: ProductListDetailsView.prototype.deleteListItem

	,	disableElementsOnPromise: ProductListDetailsView.prototype.disableElementsOnPromise

	,	updateItemQuantity : ProductListDetailsView.prototype.updateItemQuantity

	,	updateItemQuantityHelper: ProductListDetailsView.prototype.updateItemQuantityHelper

	,	childViews:
		{
			'ProductList.DetailsLater.Collection': function()
			{
				return new BackboneCollectionView({
					collection: this.model.get('items')
				,	childView: ProductListDetailsLaterMacroView
				,	viewsPerRow: 4
				,	cellTemplate: products_detail_later_cell_tpl
				,	rowTemplate: backbone_collection_view_row_tpl
				,	childViewOptions: {
						application: this.application
					}
				});
			}
		}

		// @method getContext @return {ProductList.DetailsLater.View.Context}
	,	getContext: function()
		{
			var items = this.model.get('items')
			,	itemsLength = items.length;
			// @class ProductList.DetailsLater.View.Context
			return {
				// @property {Integer} itemsLength
				itemsLength : itemsLength
				// @property {Boolean} hasItems
			,	hasItems : itemsLength > 0
				// @property {Boolean} isEmpty
			,	isEmpty : itemsLength === 0
				// @property {Boolean} hasMoreThanOneItem
			,	hasMoreThanOneItem : itemsLength > 1
			};
		}

	});
});