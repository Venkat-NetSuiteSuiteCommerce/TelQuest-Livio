/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.ControlNewItem.View'
	,
		[
			'ProductList.Item.Collection'
		,	'product_list_control_new_item.tpl'

		,	'jQuery'
		,	'Backbone'
		,	'Backbone.FormView'
		]
	,	function(
			ProductListItemCollection
		,	product_list_control_new_item_tpl

		,	jQuery
		,	Backbone
		,	BackboneFormView
		)
{
	'use strict';

	// @class ProductList.ControlNewItem.View @extends Backbone.View
	return Backbone.View.extend({

		tagName: 'div'

	,	template: product_list_control_new_item_tpl

	,	events: {
			'submit [data-action="create-and-move"]': 'createMoveList'
		,	'click [data-action="show-add-new-list-form"]' : 'showNewListForm'
		}

	,	bindings: {
			'[name="name"]': 'name'
		}

	,	initialize : function (options)
		{
			this.application = options.application;
			this.model = options.model;
			this.parentView = options.parentView;

			BackboneFormView.add(this);
		}

		// Handle save new product list form postback
	,	createMoveList: function (event)
		{
			if (!this.parentView.validateGiftCertificate(this.parentView.product))
			{
				return;
			}
			var self = this
			,	save_promise = this.saveForm(event);

			if (!save_promise)
			{
				return;
			}

			save_promise.done(function()
			{
				var new_product_list = self.model
				,	parent_view = self.parentView;

				new_product_list.set('items', new ProductListItemCollection(new_product_list.get('items').toJSON()));

				// add the product list item
				if (parent_view.mode === 'move')
				{
					// create new list
					parent_view.moveProductHandler(new_product_list);
					parent_view.collection.add(self.model, {merge: true});
				}
				else
				{
					parent_view.collection.add(new_product_list);
					parent_view.addNewProductToList(new_product_list);
				}
			});
		}

		// @method showNewListForm Shows the create new list form
	,	showNewListForm: function (e)
		{
			e && e.stopPropagation();
			var $el = jQuery(this.el);
			var new_list_form = $el.find('form[data-type="product-list-control-add-new-list-form"]');

			if (new_list_form)
			{
				new_list_form.show();
				this.$('[data-type="new-product-list-name"]').focus();
				$el.find(e.target).hide();
			}
		}

		// @method getContext @return {ProductList.ControlNewItem.View.Context}
	,	getContext: function()
		{
			return {
				// @class ProductList.ControlNewItem.View.Context
				// @property {Boolean} isMoving
				isMoving: this.parentView.mode === 'move'
			};
		}
	});
});