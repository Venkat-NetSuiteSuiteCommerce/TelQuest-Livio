/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductList
define('ProductList.Item.Edit.View'
,	[	'ProductList.Item.Model'
	,	'GlobalViews.StarRating.View'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'ProductViews.Price.View'
	,	'ProductDetails.Options.Selector.View'

	,	'product_list_edit_item.tpl'

	,	'underscore'
	,	'jQuery'
	,	'Backbone'
	,	'Backbone.FormView'
	,	'Utils'
	]
,	function (
		ProductListItemModel
	,	GlobalViewsStarRatingView
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	ProductViewsPriceView
	,	ProductDetailsOptionsSelectorView

	,	product_list_edit_item_tpl

	,	_
	,	jQuery
	,	Backbone
	,	BackboneFormView
	,	Utils
	)
{
	'use strict';

	// @class ProductList.Item.Edit.View View to handle Product Lists Item edition. @extends Backbone.View
	return Backbone.View.extend({

		template: product_list_edit_item_tpl

	,	title: _('Edit item').translate()

	,	page_header: _('Edit item').translate()

	,	modalClass: 'global-views-modal-large'

	,	events: {
			'submit form' : 'submitForm'
		,	'blur [data-toggle="text-option"]': 'setOption'
		,	'click [data-toggle="set-option"]': 'setOption'
		,	'change [data-toggle="select-option"]': 'setOption'

		,	'change [name="quantity"]': 'updateQuantity'
		,	'keypress [name="quantity"]': 'ignoreEnter'
		,	'click [data-ui-action="add"]' : 'addQuantity'
		,	'click [data-ui-action="minus"]' : 'subQuantity'

		,	'change [name="description"]': 'updateDescription'
		,	'keypress [name="description"]': 'ignoreEnter'

		,	'change [name="priority"]': 'updatePriority'

		,	'keydown [data-toggle="text-option"]': 'tabNavigationFix'
		,	'focus [data-toggle="text-option"]': 'tabNavigationFix'

		}

	,	bindings: {
			'[name="description"]': 'description'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.target = options.target;
			this.title = options.title;
			this.page_header = options.title;

			this.confirm_edit_method = options.confirm_edit_method;

			BackboneCompositeView.add(this);
			BackboneFormView.add(this);
		}

		// Edit the current item
	,	submitForm: function (e)
		{
			e.preventDefault();

			if (this.model.areAttributesValid(['quantity','options'], {}))
			{
				var self = this;

				this.$('[data-action="edit"]').attr('disabled', 'true');

				this.model.save(null,{validate:false}).done(function (new_attributes)
				{
					self.parentView[self.confirm_edit_method](new_attributes);

					var item_list = _.findWhere(self.application.ProductListModule.Utils.getProductLists().models, {id: self.parentView.model.id});
					item_list && item_list.get('items').get(self.model.id).set('quantity', new_attributes.quantity);

					if (self.inModal && self.$containerModal)
					{
						self.$containerModal.modal('hide');
						self.destroy();
					}
				});
			}
		}

		// Updates the quantity of the model
	,	updateQuantity: function (e)
		{
			var new_quantity = parseInt(jQuery(e.target).val(), 10)
			,	min_quantity = this.getMinimumQuantity()
			,	current_quantity = this.model.get('quantity');

			new_quantity = (new_quantity >= min_quantity) ? new_quantity : min_quantity;

			jQuery(e.target).val(new_quantity);

			if (new_quantity !== current_quantity)
			{
				this.model.set('quantity', new_quantity);
				this.storeFocus(e);
				this.render();
			}
		}

		// @method addQuantity Increase the product's Quantity by 1
		// @param {HTMLEvent} e
	,	addQuantity: function (e)
		{
			e.preventDefault();

			var $element = jQuery(e.target)
			,	oldValue = $element.parent().find('input').val()
			,	newVal = parseInt(oldValue, 10) + 1;

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
			,	newVal = parseInt(oldValue, 10) - 1;

			newVal = Math.max(1, newVal);

			var input = $element.parent().find('input');

			input.val(newVal);
			input.trigger('change');
		}

		// @method getMinimumQuantity Returns the minimum purchasable quantity of the active item
	,	getMinimumQuantity : function()
		{
			if(this.model.isMatrixChild())
			{
				var optionsSelected = this.model.get('itemDetails').itemOptions
				,	optionsAvailable = this.model.get('itemDetails').getPosibleOptions()
				,	activeItem = this.model.getMatrixItem(optionsSelected, optionsAvailable);

				return activeItem && activeItem.get('_minimumQuantity') ? activeItem.get('_minimumQuantity') : 1;
			}
			else
			{
				return this.model.get('item').get('_minimumQuantity') ? this.model.get('item').get('_minimumQuantity') : 1;
			}
		}

		// Updates the description of the model
	,	updateDescription: function (e)
		{
			var new_description = jQuery(e.target).val()
			,	current_description = this.model.get('description');

			if (new_description !== current_description)
			{
				this.model.set('description', new_description);
				this.storeFocus(e);
			}
		}

		// Updates the priority of the model
	,	updatePriority: function (e)
		{
			var new_priority = jQuery(e.target).val()
			,	current_priority = this.model.get('priority');

			if (new_priority !== current_priority)
			{
				this.model.set('priority', {id: new_priority } );
				this.storeFocus(e);
			}
		}

		// Sets an item option (matrix or custom)
	,	setOption: function (e)
		{
			var $target = jQuery(e.currentTarget)
			,	value = $target.val() || $target.data('value') || null
			,	cart_option_id = $target.closest('[data-type="option"]').data('cart-option-id');

			// Prevent from going away
			e.preventDefault();

			// if option is selected, remove the value
			if ($target.data('active'))
			{
				value = null;
			}

			this.model.setOption(cart_option_id, value);

			this.storeFocus(e);
			this.render();
		}

		// view.storeFocus
		// Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
		// This also updates the url, but it does not generates a history point
	,	storeFocus: function ()
		{
			var focused_element = this.$(':focus').get(0);

			this.focusedElement = focused_element ? Utils.getFullPathForElement(focused_element) : null;
		}

		// view.tabNavigationFix:
		// When you blur on an input field the whole page gets rendered,
		// so the function of hitting tab to navigate to the next input stops working
		// This solves that problem by storing a a ref to the current input
	,	tabNavigationFix: function (e)
		{
			this.hideError();

			// If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
			this.tabNavigation = (e.type === 'keydown' && e.which === 9);
			this.tabNavigationUpsidedown = e.shiftKey;
			this.tabNavigationCurrent = Utils.getFullPathForElement(e.target);
		}

	,	afterAppend: function ()
		{
			this.focusedElement && this.$(this.focusedElement).focus();

			if (this.tabNavigation)
			{
				var current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0))
				,	next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

				this.$(':input:eq('+ next_index +')').focus();
			}
		}

		// view.showInModal:
		// Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
		// after events because those are triggered by showContent
	,	showInModal: function (options)
		{
			this.template = 'product_list_edit_item';

			return this.application.getLayout().showInModal(this, options);
		}

		// don't want to trigger form submit when user presses enter when in the quantity input text
	,	ignoreEnter: function (e)
		{
			if (e.keyCode === 13)
			{
				e.preventDefault();
				e.stopPropagation();
			}
		}

	,	childViews:
		{
			'ItemViews.Price': function()
			{
				return new ProductViewsPriceView({
					model:this.model
				,	origin: 'PRODUCTLISTDETAILSEDIT'
				});
			}
		,	'GlobalViews.StarRating': function()
			{
				return new GlobalViewsStarRatingView({
					model:this.model.get('item')
				});
			}
		,	'ItemDetails.Options': function()
			{
				return new ProductDetailsOptionsSelectorView({
					model: this.model
				});
			}
		}

		// @method getContext
		// @return {ProductList.Item.Edit.View.Context}
	,	getContext: function()
		{
			var line = this.model
			,	item = line.get('item')
			,	min_quantity = item.get('_minimumQuantity')
			,	priority = line.get('priority');

			//@class ProductList.Item.Edit.View.Context
			return {
				//@property {Boolean} showRating
				showRating: SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled
				// @property {Integer} quantity
			,	quantity : line.get('quantity')
				//@property {Boolean} showMinimumQuantity
			,	showMinimumQuantity: min_quantity > 1
				//@property {Number} minQuantity
			,	minQuantity: min_quantity
				// @property {String} description
			,	description : line.get('description')
				// @property {String} productId
			,	productId : item.get('internalid')
				// @property {String} productName
			,	productName : item.get('_name')
				// @property {String} itemCreatedDate
			,	itemCreatedDate : line.get('created')
				// @property {Boolean} isSelectionCompleteForEdit
			,	isSelectionCompleteForEdit : line.areAttributesValid(['quantity','options'], {})
				// @property {Boolean} isPriority1
			,	isPriority1 : priority.id === '1'
				// @property {Boolean} isPriority2
			,	isPriority2 : priority.id === '2'
				// @property {Boolean} isPriority3
			,	isPriority3 : priority.id === '3'
				// @property {ImageContainer} thumbnail
			,	thumbnail: this.model.getThumbnail()
			};
		}
	});
});
