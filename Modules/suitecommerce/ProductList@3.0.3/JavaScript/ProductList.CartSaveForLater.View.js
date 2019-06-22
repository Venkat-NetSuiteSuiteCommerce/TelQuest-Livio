/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.CartSaveForLater.View'
,	[
		'SC.Configuration'
	,	'ErrorManagement'
	,	'ProductList.DetailsLater.View'
	,	'ProductList.Model'
	,	'ProductList.Item.Model'
	,	'Cart.Detailed.View'
	,	'Session'
	,	'Profile.Model'

	,	'product_list_details_later.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Utils'

	,	'jQuery.scPush'
	]
,	function (
		Configuration
	,	ErrorManagement
	,	ProductListDetailsLaterView
	,	ProductListModel
	,	ProductListItemModel
	,	CartDetailedView
	,	Session
	,	ProfileModel

	,	product_list_details_later_tpl

	,	_
	,	jQuery
	,	Backbone
	,	Utils
	)
{
	'use strict';

	// @class ProductList.SaveForLater.View extends the cart Detailed.View for adding save-for-later product list experience.
	// @extends Cart.Detailed.View

	var original_initialize = CartDetailedView.prototype.initialize
	,	product_list_model = new ProductListModel();

	_.extend(CartDetailedView.prototype, {

		initialize: function ()
		{
			var self = this;

			original_initialize.apply(this, arguments);

			this.productListModel = product_list_model;

			this.utils = this.application.ProductListModule && this.application.ProductListModule.Utils;

			ProfileModel.getPromise().done(function(){
				self.render();
			});
		}

	,	childViews: _.extend({}, CartDetailedView.prototype.childViews, {
			'SavedForLater': function ()
			{
				if (this.utils && this.utils.isProductListEnabled())
				{
					return new ProductListDetailsLaterView({
						application: this.options.application
					,	model: this.productListModel
					});
				}

				return null;
			}
		})

		// save for later:
		// handles the click event of the save for later button
		// removes the item from the cart and adds it to the saved for later list
	,	saveForLaterItem: function (e)
		{
			e.preventDefault();

			if (!this.validateLogin())
			{
				return;
			}

			var cart_line = this.model.get('lines').get(jQuery(e.target).data('internalid'))
			,	internalid = cart_line.get('internalid')
			,	whole_promise = jQuery.Deferred()
			,	self = this;

			jQuery.when(this.model.removeLine(cart_line), self.addItemToList(cart_line)).then(function()
			{
				self.showConfirmationMessage(_('Good! You saved the item for later. If you want to add it back to your cart, see below in <b>"Saved for later"</b>').translate());

				whole_promise.resolve();
			});

			this.disableElementsOnPromise(whole_promise, '#' + internalid + ' button');
		}

		// Add a new product list item into a product list
	,	addItemToList: function (cart_line)
		{
			var defer = jQuery.Deferred()
			,	self = this;

			if (this.productListModel.isNew())
			{
				this.productListModel.save().done(function ()
				{
					self.doAddItemToList(self.productListModel.get('internalid'), cart_line, defer);
				});
			}
			else
			{
				self.doAddItemToList(self.productListModel.get('internalid'), cart_line, defer);
			}

			return defer.promise();
		}
		// Adds the new item to the collection
	,	doAddItemToList: function (product_list_id, cart_line, internal_promise)
		{
			var self = this
			,	product_list_item_model = ProductListItemModel.createFromTransactionLine(cart_line);

			product_list_item_model.set('productList', {id: product_list_id});

			product_list_item_model.set('description', '');

			product_list_item_model.set('item', cart_line.get('item'), {silent:true});

			product_list_item_model.save(null, {validate: false}).done(function ()
			{
				product_list_item_model.set('item', cart_line.get('item'), {silent: true});
				self.productListModel.get('items').add(product_list_item_model, {at:0});
				internal_promise.resolve();
			});
		}
	,	validateLogin: function ()
		{
			if (ProfileModel.getInstance().get('isLoggedIn') === 'F')
			{
				var parameters = {
					'origin': this.application.getConfig('currentTouchpoint')
				,	'origin_hash': encodeURIComponent(Backbone.history.fragment)
				};

				window.location.href = Utils.addParamsToUrl(Session.get('touchpoints.login'), parameters);

				return false;
			}

			return true;
		}
	});

	CartDetailedView.prototype.events = _.extend({}, CartDetailedView.prototype.events, {'click [data-action="save-for-later-item"]': 'saveForLaterItem'});

	return CartDetailedView;
});
