/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Product
define('Product.Model'
,	[	'Item.Model'
	,	'Product.Option.Collection'
	,	'ProductLine.Common'
	,	'PluginContainer'
	,	'SC.Configuration'

	,	'underscore'
	,	'Backbone'
	,	'Utils'
	,	'jQuery'
	]
,	function (
		ItemModel
	,	ProductOptionCollection
	,	ProductLineCommon
	,	PluginContainer
	,	Configuration

	,	_
	,	Backbone
	,	Utils
	,	jQuery
	)
{
	'use strict';

	// @class Product.Model A product is an item with state (options selection, quantity, etc) @extends Backbone.Model
	var ProductModel = Backbone.Model.extend(
		{
			//@property {Object} validation
			validation: {
				'quantity' : {
					fn: function quantityValidator (new_quantity)
					{
						var current_quantity = parseInt(new_quantity, 10);

						if (!_.isNumber(current_quantity) || _.isNaN(current_quantity) || current_quantity < 1)
						{
							return _.translate('Invalid quantity value');
						}
						else if (current_quantity < this.getItem().get('_minimumQuantity'))
						{
							return _.translate('Please add $(0) or more of this item', this.getItem().get('_minimumQuantity'));
						}
					}
				}
			,	'options': {
					fn: function optionsValidator ()
					{
						var are_options_with_error = false;

						this.get('options').each(function (option)
						{
							are_options_with_error = are_options_with_error || !!option.validate();
						});
						return are_options_with_error && _.translate('Invalid options values');
					}
				}
			}

			//@method initialize Override default initialize method to assure the correct data structure
			//@param {Object} attributes
			//@return {Void}
		,	initialize: function initialize (attributes)
			{
				//Setting options should be done with care of the possible next cases:
				//clone			self.get('options') is a collection
				//new lines		self.get('options') is undefined
				//change item	self.get('options') is a collection

				var self = this;

				Backbone.Model.prototype.initialize.apply(this, arguments);

				//We clone the validation object as we need it to be per instance instead of being a class property
				this.validation = _.extend({}, this.validation);

				this.on('change:item', function (model, item)
				{
					model.set('item', item instanceof ItemModel ? item : new ItemModel(item), {silent: true});

					self.initializeOptions(model.isNew() ? self.get('item').get('options').toJSON() : attributes.options);
				});
				this.trigger('change:item', this, attributes && attributes.item || {});

				//Take into account that as we treat the item as a read-only model, this event should only be triggered when the associated item is fetched
				//ITEM FETCHED
				this.get('item').on('change', this.onItemChangeUpdateLine, this);

				if (this.isNew())
				{
					//NEW TRANSACTION LINE
					this.initializeOptions((attributes && attributes.options) || this.get('item').get('options').toJSON() || []);
				}
				else
				{
					//TRANSACTION LINE LOADED
					this.initializeOptions(this.get('options'));
				}

				// Extend the model with Backbone.Validation.mixin to validate it without a View
				_.extend(this, Backbone.Validation.mixin);
			}

			//@method _setQuantity Set the product's quantity in a cancelable way
			//@private
			//@param {Number} quantity
			//@param {Array<Object>} args All the parameters of the original set call
			//@return {jQuery.Deferred}
		,	_setQuantity: function _setQuantity (quantity, args)
			{
				var self = this;

				return this.cancelableTrigger('beforeChangeQuantity', quantity)
						.then(function ()
							{
								Backbone.Model.prototype.set.apply(self, args);
								self.cancelableTrigger('afterChangeQuantity');
							}
						,	function ()
							{
								//Notify stickIt that the quantity was NOT changed
								self.trigger('change:quantity', self);
								return jQuery.Deferred().reject();
							});
			}

			//@method set Override default method to provide control over the setting of the quantity attribute. This allows to cancel this action and perform async operation before it.
			//@param {Object|String} attributes For documentation on this refer to @link http://backbonejs.org/#Model-set
			//@return {Product.Model|jQuery.Deferred}
		,	set: function set (attributes, value, options)
			{
				var args = Array.prototype.slice.call(arguments);

				if (_.isString(attributes) && attributes === 'quantity' && (!options || !options.silent))
				{
					return this._setQuantity(value, args);
				}
				else if (_.isObject(attributes) && _.isNumber(attributes.quantity) && (!value || !value.silent))
				{
					return this._setQuantity(attributes.quantity, args);
				}
				else
				{
					return Backbone.Model.prototype.set.apply(this, arguments);
				}
			}

		,	onItemChangeUpdateLine: function onItemChangeUpdateLine ()
			{
				if (this.isNew())
				{
					this.initializeMinimumQuantity();
				}

				this.initializeOptions(this.get('item').get('options').toJSON());
			}

			//@method initializeOptions Set the options passed in as parameter to the options property of the current model
			//@param {Array<Product.Option.Model.Attributes|Item.Option.Model.Attributes>} options
			//@return {Void}
		,	initializeOptions: function initializeOptions (options)
			{
				this.set('options', options instanceof ProductOptionCollection ? options : new ProductOptionCollection(options), {silent: true});

				this.extendOptionsFromItem(this.get('item'), this);

				this.setOptionsValidation();
			}

			//@method initializeMinimumQuantity Internal method called when the line's item is fetched, change or when the line is initialized, to set the line quantity
			//based on the item minimum quantity
			//@return {Void}
		,	initializeMinimumQuantity: function initializeMinimumQuantity ()
			{
				//Set minimum quantity
				var line_quantity = this.get('quantity')
				,	minimum_quantity = this.get('item').get('_minimumQuantity') || 1;

				if (!_.isNumber(line_quantity) || _.isNaN(line_quantity) || line_quantity < minimum_quantity)
				{
					line_quantity = minimum_quantity;
				}

				this.set('quantity', line_quantity, {silent: true});
			}

			//@method setOptionsValidation Set the validation property of the current line based on the options collection
			//@return {Void}
		,	setOptionsValidation: function setOptionsValidation ()
			{
				var self = this;

				self.get('options').each(function (option)
				{
					self.validation[option.get('cartOptionId')] = {
						fn: function optionValidationFunction (value, cartOptionId, computedState)
						{
							var selected_option = computedState.options.findWhere({cartOptionId: cartOptionId})
							,	validation = selected_option.validate();

							//We use 'value.internalid' as we are validating the complex object 'value' which is of the form {internalid,label}
							if (validation && validation['value.internalid'])
							{
								return validation['value.internalid'];
							}
						}
					};
				});
			}

			//@method areAttributesValid
			//@param {Array<String>} attributes List of attributes to be validated
			//@param {Object} validators Object containing the Backbone.Validation validators to apply for the current validation
			//@return {Boolean}
		,	areAttributesValid: function areAttributesValid (attributes, validators)
			{
				var current_validation = _.extend({}, this.validation);

				_.extend(this.validation, validators || {});

				var result = this.isValid(attributes);

				this.validation = current_validation;

				return result;
			}

			// @method setOption Takes care of setting an option to the current model. This method is needed as we use StickIt and Backbone.Validation.
			// We "need" to emulate at the line level some temporal properties to make the validation of the PDP.
			// Apart from the options collection the line has one property per option set, we use the cartOptionId as the property in the line.
			// @param {String} option_cart_id
			// @param {String} value Internalid of the selection option in case the selection is over an select type option, otherwise the string value specified
			// @return {jQuery.Deferred<Product.Option.Model|Boolean>} If the option and the value specified are valid, the selected option is returned, false otherwise
		,	setOption: function setOption (option_cart_id, value)
			{
				var self = this;

				return this.cancelableTrigger('beforeChangeOption', option_cart_id, value)
					.then(function ()
					{
						var selected_option = self.get('options').findWhere({cartOptionId: option_cart_id})
						,	selected_value = selected_option && _.findWhere(selected_option.get('values'), {internalid: value});

						if (selected_option)
						{
							if (selected_value)
							{
								selected_option.set('value', {
									internalid: selected_value.internalid
								,	label: selected_value.label
								});

								self.set(option_cart_id, value);
							}
							else if (value !== null && value !== undefined && value !== '' && selected_option.get('type') !== 'select')
							{
								selected_option.set('value',{
									internalid: value
								,	label: value
								});

								self.set(option_cart_id, value);
							}
							else
							{
								selected_option.unset('value');
								self.unset(option_cart_id);
							}

							// If it's a matrix, checks for valid combinations
							if (selected_option.get('isMatrixDimension') && value && selected_option.get('value'))
							{
								var valid_values_for_selected_option = self.getValidValuesForOption(selected_option)
								,	reset = !_.contains(valid_values_for_selected_option, selected_option.get('value').label);

								_.each(self.get('options').where({'isMatrixDimension': true}), function (option)
								{
									if (reset && option_cart_id !== option.get('cartOptionId'))
									{
										self.setOption(option.get('cartOptionId'), null);
									}
								});

								_.each(self.get('options').where({'isMatrixDimension': true}), function (option)
								{
									var valid_values_for_option = self.getValidValuesForOption(option);

									_.each(option.get('values'), function (value)
									{
										if (value.isAvailable !== _.contains(valid_values_for_option, value.label))
										{
											value.isAvailable = !value.isAvailable;

											self.trigger('change:' + option.get('cartOptionId'), self, self.get(option.get('cartOptionId')));
										}
									});
								});
							}
						}

						self.cancelableTrigger('afterChangeOption', _.isUndefined(self.get(option_cart_id)) ? false : selected_option.toJSON());

						//if the option and the value specified are valid, the selected option is returned, false otherwise
						return jQuery.Deferred().resolve(_.isUndefined(self.get(option_cart_id)) ? false : selected_option);
					});
			}

			//@method isEqual
			//@param {Product.Model|Transaction.Line.Model} other_line
			//@return {Boolean}
		,	isEqual: function isEqual (other_line)
			{
				var other_line_internalid =  _.isFunction(other_line.getItem) ? other_line.getItem().get('internalid') : other_line.get('item').get('internalid');
				if (other_line && this.getItem().get('internalid') === other_line_internalid)
				{
					var extract_options = function (option)
					{
						return {
							cartOptionId: option.cartOptionId
						,	value: option.value
						};
					};
					var options_this_line = _.map(this.get('options').toJSON(), extract_options);
					var options_other_line = _.map(other_line.get('options').toJSON(), extract_options);
					return _.isEqual(options_this_line, options_other_line);
				}
				return false;
			}

			//@method getImages Get the images of the the product taking into account the current options selection
			//@return {Array<ImageContainer>}
		,	getImages: function getImages ()
			{
				var item = this.get('item')
				,	item_images_detail = item.get('itemimages_detail') || {};

				item_images_detail = item_images_detail.media || item_images_detail;

				var image_filters = Configuration.get('productline.multiImageOption', [])
				,	images_container = this.filterImages(item_images_detail, image_filters)
				,	result = Utils.imageFlatten(images_container);

				return result.length ? result : [{
					url: Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Configuration.get('imageNotAvailable'))
				,	altimagetext: item.get('_name')
				}];
			}

			// @method isSelectionComplete
			// @returns {Boolean} true if all mandatory options are set and valid
		,	isSelectionComplete: function isSelectionComplete ()
			{
				var options = this.get('options').where({isMandatory: true});
				return _.all(options, function (option)
					{
						return option.isValid(true);
					});
			}

			// @method getSelectedOptions
			// @returns {Array<ProductLine.Option.Value>} An array of all the selected option's value
		,	getSelectedOptions: function getSelectedOptions ()
			{
				var selected_options = [];

				this.get('options').each(function (option)
				{
					if (!option.validate())
					{
						selected_options.push(option.get('value'));
					}
				});

				return selected_options;
			}

			// @method getValidValuesForOption Given an <<option ID?>> this method return  GIVEN AN OPTION IDE WHAT ARE THE AVAILABLE VALUES
			// @param {Product.Option.Model} option
			// @returns {Array<Product.Option>} The list of all valid <<<options for the option you passed in>>>
		,	getValidValuesForOption: function getValidValuesForOption (option)
			{
				var matrix_options = this.getMatrixOptionsSelection();

				//from all item matrix options selection remove the current dimension
				delete matrix_options[option.get('itemOptionId')];

				return _.uniq(_.map(this.getSelectedMatrixChilds(matrix_options), function (model)
				{
					return model.get(option.get('itemOptionId'));
				}));
			}

			// @method getMatrixOptionsSelection Get all selected option by using sourcefrom and label
			// @returns {Product.OptionHelper.MatrixSelection} an object of all the matrix options with its values set (DICTIONARY <STRING: OPTION_ID, STRING: VALUE.LABEL>)
		,	getMatrixOptionsSelection: function getMatrixOptionsSelection ()
			{
				//@class Product.OptionHelper.MatrixSelection @extend Dictionary<String,String>
				// #Description
				// This class represents the selected option in the current line.
				// IMPORTANT: When the Search API returns Matrix Items the property matrixchilditems_detail contains all valid children. These children
				// are identified by its itemid (like itemid = "Mendelevium-N-N") or by the list of properties it has. Given an Item that is a matrix child it will
				// contains one property for each dimension (option), THE KEY POINT IS THAT EACH OF THIS PROPERTIES is the sourcefrom property of each option.
				// Item Returned from the search API:
				// 	...
				// 	displayname: "Mendelevium"
				// 	featureddescription: ""
				// 	internalid: 320
				// 	itemid: "Mendelevium"
				// 	itemimages_detail: {}
				// 	itemoptions_detail: {matrixtype: "parent",…}
				// 		fields: [										<< ITEM OPTIONS
				// 			{
				// 				internalid: "custcol7"
				// 				ismandatory: true
				// 				ismatrixdimension: true
				// 				label: "Radioactive level"
				// 				sourcefrom: "custitem7"					<< OPTION sourcefrom
				// 				type: "select"
				// 				values: [{label: "- Select -"},…]
				// 			1: {…}
				// 		]
				// 	matrixtype: "parent"
				// 	itemtype: "NonInvtPart"
				// 	matrixchilditems_detail: [
				// 		{
				// 			custitem7: "None"							<<< THIS PROPERTY custitem7 is obtained from the item options. The value is the LABE of the related option
				// 			custitem8: "Healthy"
				// 			internalid: 321
				// 			isbackorderable: true
				// 			isinstock: true
				// 			ispurchasable: true
				// 			itemid: "Mendelevium-N-H"
				// 			itemtype: "NonInvtPart"
				// 			onlinecustomerprice_detail: {onlinecustomerprice_formatted: "$12.00", onlinecustomerprice: 12,…}
				// 			outofstockmessage: ""
				// 			showoutofstockmessage: false
				// 		1: {isinstock: true, itemid: "Men...
				//
				// 	#Class Properties
				// 	Key: Option sourcefrom
				// 	Value: Selected option value label

				var matrix_options = this.get('options').where({isMatrixDimension: true})
				,	result = {};

				_.each(matrix_options, function (matrix_option)
				{
					// var set_value = self.get(matrix_option.get('cartOptionId'));
					var set_value = matrix_option.get('value');

					// if this option have been set in the current line
					if (set_value)
					{
						//Remember that at each option the property itemOptionId is in fact the sourcefrom. See the class Product.Option
						//This line set the label of the selected option (based on he fact the we set option by setting its internalid)
						// result[matrix_option.itemOptionId] = _.findWhere(matrix_option.values, {internalid: set_value}).label;
						result[matrix_option.get('itemOptionId')] = set_value.label;
					}
				});

				// <OPTION:SOURCE ID, SELECTED LABEL>
				return result;
			}

			// @method getSelectedMatrixChilds Returns all child item that apply for the passed in selection
			// @param {Product.OptionHelper.MatrixSelection} matrix_options
			// @returns {Array<Item.Model>} All the children of a matrix that complies with the current or passed in selection
		,	getSelectedMatrixChilds: function getSelectedMatrixChilds (matrix_options)
			{
				var item_matrix_children = this.get('item').get('_matrixChilds'); //This is a collection of items!!
				//but these items only have a subset of the item options (only those options on the matrixchilditems_detail field set!)

				if (!item_matrix_children)
				{
					return [];
				}

				matrix_options = matrix_options || this.getMatrixOptionsSelection();
				var selection_key = JSON.stringify(matrix_options);

				this.matrixSelectionCache = this.matrixSelectionCache || {};

				// Caches the entry for the item
				if (!this.matrixSelectionCache[selection_key])
				{
					//IF there are option selected THEN get all child items that complies for the current selection ELSE get ALL child items
					this.matrixSelectionCache[selection_key] = _.values(matrix_options).length ? item_matrix_children.where(matrix_options) : item_matrix_children.models;
				}

				return this.matrixSelectionCache[selection_key];
			}

			//@method getItemId Gets the id of the current selected item
			//@return {Sting}
		,	getItemId: function getItemId ()
			{
				return this.getItem().get('_id');
			}

			//@method getItem Gets the current selected item
			//@return {Item.Model}
		,	getItem: function getItem ()
			{
				var item = this.get('item')
				,	children = this.getSelectedMatrixChilds();

				if (children && children.length === 1)
				{
					item = children[0];
				}

				return item;
			}

			//@method getStockInfo
			//@return {Item.StockInfo}
		,	getStockInfo: function getStockInfo ()
			{
				return this.get('item').getStockInfo(this.getSelectedMatrixChilds(), this.getMatrixOptionsSelection());
			}

			//@method getPrice Returns the object specifying the price of the current selection
			//@return {ItemPrice}
		,	getPrice: function getPrice ()
			{
				return this.get('item').getPrice(this.get('quantity'), this.getSelectedMatrixChilds());
			}
		}
	,	{
			//@method createFromTransactionLine Creates a new product from a transaction line
			//@param {Transaction.Line.Model} transaction_line
			//@return {Product.Model}
			//@static
			createFromTransactionLine: function  createFromTransactionLine (transaction_line)
			{
				var attributes = transaction_line.toJSON();

				delete attributes.internalid;

				_.each(attributes.options, function (option)
				{
					option.values = transaction_line.get('options').findWhere({cartOptionId: option.cartOptionId}).get('values');
				});

				return new ProductModel(attributes);
			}
		});

	ProductModel.prototype = _.extend(ProductModel.prototype, ProductLineCommon);

	return ProductModel;
});
