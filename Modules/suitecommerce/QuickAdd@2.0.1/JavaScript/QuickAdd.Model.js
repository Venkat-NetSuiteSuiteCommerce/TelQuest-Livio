/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module QuickAdd
define(
	'QuickAdd.Model'
,	[
		'SC.Configuration'

	,	'Transaction.Line.Model'

	,	'underscore'
	]
,	function (
		Configuration

	,	TransactionLineModel

	,	_
	)
{
	'use strict';

	// @class QuickAdd.Model @extends Transaction.Line.Model
	var QuickAddModel = TransactionLineModel.extend({

		// @method initialize
		// @return {Void}
		initialize: function ()
		{
			TransactionLineModel.prototype.initialize.apply(this, arguments);

			// @property {QuickAdd.Model.Initialization.Options} options
			this.options = {};
		}

		//@method setOptions
		//@param {QuickAdd.Model.Initialization.Options} options
		//@return {QuickAdd.Model} Returns itself
	,	setOptions: function (options)
		{
			this.options = options || this.options;
			return this;
		}

		//@method setItemQuantityGetter
		//@param {Function<Number, Number>} get_item_quantity_set
		//@return {Void}
	,	setItemQuantityGetter: function (get_item_quantity_set)
		{
			this.options.getItemQuantitySet = get_item_quantity_set;
		}

		//@method clone Override default clone method to pass the set options to the cloned model
		//@return {QuickAdd.Model}
	,	clone: function ()
		{
			var result = new QuickAddModel(this.toJSON());
			result.setOptions(this.options);
			return result;
		}

		//@property {Object} validation Specify the validation rules for the quantity and quickaddSearch attributes
	,	validation: {
			quickaddSearch: {
				fn: function (val)
				{
					var product = this.get('selectedProduct')
					,	item = product && product.get('item');

					if (!(product && (product.getSku() === val || item.get('_name') === val)))
					{
						return _('Begin typing SKU to select an item').translate();
					}
				}
			}
		,	quantity: {
			 	fn: function (val)
				{
					if (!val)
					{
						return _('Enter quantity').translate();
					}

					var product = this.get('selectedProduct')
					,	selectedItem = product && product.getItem();

					if (selectedItem)
					{
						var already_set_quantity = _.isFunction(this.options.getItemQuantitySet) ? this.options.getItemQuantitySet(selectedItem.id) : 0;

						if ((already_set_quantity + this.get('quantity')) < selectedItem.get('_minimumQuantity', true))
						{
							return _('The minimum quantity for this item is $(0).').translate(selectedItem.get('_minimumQuantity', true));
						}
					}
				}
			}
		}
	});

	return QuickAddModel;
});

//@class QuickAdd.Model.Initialization.Options
//@property {Function<Number,Number>} getItemQuantitySet Function that given an item id returns how many item already are present in the cart-like.
//This work to decouple this component of any other concrete implementation.
//IMPORTANT: If the passed in item id is not in the cart-like this function must return 0 (the number zero).