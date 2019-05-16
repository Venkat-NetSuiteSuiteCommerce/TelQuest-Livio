/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ProductDetails
define('ProductDetails.Component'
,	[
		'ProductDetails.Base.View'
	,	'Product.Model'
	,	'SC.BaseComponent'

	,	'Utils'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		ProductDetailsBaseView
	,	ProductModel
	,	SCBaseComponent

	,	Utils
	,	_
	,	jQuery
	)
{
	'use strict';

	return function ProductDetailsComponentGenerator (application)
	{
		//@class ProductDetails.Component @extend SC.Component
		var privateComponent = SCBaseComponent.extend({

				componentName: 'PDP'

			,	application: application

				//@method _isViewFromComponent Indicate if the passed-in the View is a PDP of the current component
				//@private
				//@param {Backbone.View} view Any view of the system
				//@return {Boolean} True in case the passed in View is a PDP of the current Component, false otherwise
			,	_isViewFromComponent: function _isViewFromComponent (view)
				{
					return (view && (view instanceof ProductDetailsBaseView || view.prototype instanceof ProductDetailsBaseView));
				}

				//@method _getViewIdentifier Given a view that belongs to the current component, returns the "type"/"kind" of view. This is used to determine what view among all the view of the current component is being shown
				//@param {Backbone.View} view
				//@return {String}
			,	_getViewIdentifier: function _getViewIdentifier (view)
				{

					return view.attributes.id;
				}


				//@method setOption Set an option of the current PDP. If the current view is a PDP
				//@public
				//@param {String} cart_option_id Identifier of the option
				//@param {String?} value Optional value. In case of invalid or not specified value the option selected will be cleaned
				//@return {jQuery.Deferred<Boolean>} Indicate if the action was successful or not
			,	setOption: function setOption (cart_option_id, value)
				{
					if (!cart_option_id || !_.isString(cart_option_id))
					{
						return this._reportError('INVALID_PARAM', 'Invalid parameter "cart_option_id". It must be a valid string');
					}

					var current_view = this.viewToBeRendered || application.getLayout().getCurrentView();

					if (this._isViewFromComponent(current_view, true))
					{
						return current_view.model.setOption(cart_option_id, value).then(function (operation_result)
							{
								return jQuery.Deferred().resolve(!!operation_result);
							}
						,	function ()
							{
								return jQuery.Deferred().resolve(false);

							});
					}

					return jQuery.Deferred().resolve(false);
				}

				//@method setQuantity Set the quantity of the current PDP. If the current View is a PDP
				//@public
				//@param {Number} quantity
				//@return {jQuery.Deferred<Boolean>} Indicate if the operation ended successfully
			,	setQuantity: function setQuantity (quantity)
				{
					var current_view;

					if (!_.isNumber(quantity))
					{
						return this._reportError('INVALID_PARAM', 'Invalid parameter "quantity". It must be a valid number');
					}
					else if (quantity <= 0)
					{
						return this._reportError('INVALID_PARAM', 'Parameter "quantity" must be greater than 0');
					}

					current_view = this.viewToBeRendered || application.getLayout().getCurrentView();

					if (this._isViewFromComponent(current_view, true))
					{
						return current_view.model.set('quantity', quantity)
							.then(function ()
								{
									return jQuery.Deferred().resolve(true);
								}
							,	function ()
								{
									return jQuery.Deferred().resolve(false);
								});
					}

					return jQuery.Deferred().resolve(false);
				}

				//@method getItemInfo Get a JSON representation of the current Model. If the current View is a PDP, null otherwise
				//@public
				//@return {Transaction.Line.Model.JSON|null}
			,	getItemInfo: function getItemInfo ()
				{
					var result = null
					,	current_view = this.viewToBeRendered || application.getLayout().getCurrentView();

					if (this._isViewFromComponent(current_view, true))
					{
						result = Utils.deepCopy(current_view.model);
					}

					//@class ProductDetails.Component
					return result;
				}
			});

		var beforeChangeOptionHandler = function beforeChangeOptionHandler (option_cart_id, value)
			{
				//@event {ProductDetails.Component.BeforeOptionSelection.Data} beforeOptionSelection This event is triggered before the selection is impacted into the current
				//Product model. It pass the specified cart option id and its value.
				//@public
				return privateComponent.cancelableTrigger('beforeOptionSelection', {optionCartId: option_cart_id, value:value});
				//@class ProductDetails.Component.BeforeOptionSelection.Data
				//@property {String} optionCartId
				//@property {String?} value

				//@class ProductDetails.Component
			}
		,	afterChangeOptionHandler = function afterChangeOptionHandler ()
			{
				//@event {Void} afterOptionSelection This event is triggered after an option was selected in the PDP.
				//@public
				return privateComponent.cancelableTrigger('afterOptionSelection');
			}

		,	beforeChangeQuantityHandler = function beforeChangeQuantityHandler (quantity)
			{
				//@event {Number} beforeQuantityChange This event is triggered when the PDP's quantity change. It pass the new quantity.
				//@public
				return privateComponent.cancelableTrigger('beforeQuantityChange', quantity);
			}
		,	afterChangeQuantityHandler = function afterChangeQuantityHandler ()
			{
				//@event {Void} afterQuantityChange This event is triggered after the PDP's quantity change.
				//@public
				return privateComponent.cancelableTrigger('afterQuantityChange');
			}

		,	beforeChangeImageHandler = function beforeChangeImageHandler (image_change)
			{
				//@event {ProductDetails.ImageGallery.ChangeEvent} beforeImageChange This event is triggered when the PDP's main image pre-change.
				//@public
				return privateComponent.cancelableTrigger('beforeImageChange', image_change);
			}
		,	afterChangeImageHandler = function afterChangeImageHandler ()
			{
				//@event {Void} afterImageChange This event is triggered after the PDP's main image changed
				//@public
				return privateComponent.cancelableTrigger('afterImageChange');
			}
			;

		application.getLayout().on('beforeAppendView', function onApplicationBeforeAppendView (view)
		{
			if (privateComponent._isViewFromComponent(view, true))
			{
				view.model.cancelableOn('beforeChangeOption', beforeChangeOptionHandler);
				view.model.cancelableOn('afterChangeOption', afterChangeOptionHandler);

				view.model.cancelableOn('beforeChangeQuantity', beforeChangeQuantityHandler);
				view.model.cancelableOn('afterChangeQuantity', afterChangeQuantityHandler);

				view.model.cancelableOn('beforeChangeImage', beforeChangeImageHandler);
				view.model.cancelableOn('afterChangeImage', afterChangeImageHandler);

				view.on('destroy', function ()
				{
					view.model.cancelableOff('beforeChangeOption', beforeChangeOptionHandler);
					view.model.cancelableOff('afterChangeOption', afterChangeOptionHandler);

					view.model.cancelableOff('beforeChangeQuantity', beforeChangeQuantityHandler);
					view.model.cancelableOff('afterChangeQuantity', afterChangeQuantityHandler);

					view.model.cancelableOff('beforeChangeImage', beforeChangeImageHandler);
					view.model.cancelableOff('afterChangeImage', afterChangeImageHandler);
				});
			}
		});

		return privateComponent;
	};
});