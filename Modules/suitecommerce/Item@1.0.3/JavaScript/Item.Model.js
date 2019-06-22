/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Item
define('Item.Model'
,	[
		'Backbone.CachedModel'
	,	'Session'
	,	'Item.KeyMapping'
	,	'Item.Option.Collection'
	,	'SC.Configuration'
	,	'Profile.Model'

	,	'underscore'
	,	'Utils'
	]
,	function (
		BackboneCachedModel
	,	Session
	,	ItemKeyMapping
	,	ItemOptionCollection
	,	Configuration
	,	ProfileModel

	,	_
	,	Utils
	)
{
	'use strict';

	var ItemCollection = null

		// @class Item.Model Represents 1 single product of the web store
		// This model is enhanced with high level attributes defined in @class ItemKeyMapping
		// @extends Backbone.CachedModel
	,	ItemModel = BackboneCachedModel.extend({

			moduleName: 'Item.Model'

			//@method url
			//@return {String}
		,	url: function url ()
			{
				var profile = ProfileModel.getInstance()
				,	url = Utils.addParamsToUrl(
						profile.getSearchApiUrl()
					,	_.extend(
							{}
						,	this.searchApiMasterOptions
						,	Session.getSearchApiParams()
						)
					,	profile.isAvoidingDoubleRedirect()
					);

				return url;
			}

			//@method parse The API returns the items as an array always this takes care of returning the object
			//@return {Item.Model.Model.Attributes}
		,	parse: function parse (response)
			{
				// if we are performing a direct API call the item is response.items[0]
				// but if you are using the Item.Collection to fetch this guys
				// The item is the response
				var single_item = response.items && response.items[0];

				if (single_item)
				{
					single_item.facets = response.facets;
				}

				return single_item || response;
			}

			//@method generateURL Returns the current URL. This method is just an alias over get('_url') to provide a unified interface with the Product.Model
			//@return {String}
		,	generateURL: function generateURL ()
			{
				return this.get('_url');
			}

			//@method getFullLink Generates a String ready to be used to a link for a PDP. In difference to the method generateURL, getFullLink
			//returns a string that contains the value of href, data-hashtag and data-touchpoint.
			//output example: href="/Californium-Mtr" data-touchpoint="home" data-hashtag="#/Californium-Mtr"
			//@return {Object}
		,	getFullLink: function getFullLink ()
			{
				var url = this.generateURL()
				,	link_attributes = {
						href: url
					};

				if (SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED')
				{
					_.extend(link_attributes, {
						data: {
							touchpoint: 'home'
						,	hashtag: Configuration.get('currentTouchpoint') !== 'home' ? encodeURIComponent(url) : url
						}
					});
				}

				return Utils.objectToAtrributes(link_attributes);
			}


			//@method initialize
			//@return {Void}
		,	initialize: function initialize ()
			{
				// Wires the config options to the URL of the model
				this.searchApiMasterOptions =  Configuration.get('searchApiMasterOptions.itemDetails', {});
				this.itemOptionsConfig = Configuration.get('ItemOptions.optionsConfiguration', []);

				var self = this;
				this.set('options', this.getPosibleOptions(), {silent:true});
				this.on('change:itemoptions_detail', function ()
				{
					self.set('options', self.getPosibleOptions(), {silent:true});
				},this);
			}

			// @method getPosibleOptions
			// @returns {Item.Options.Collection} an array of all the possible options with values and information
		,	getPosibleOptions: function getPosibleOptions ()
			{
				if (this.cachedPosibleOptions)
				{
					return this.cachedPosibleOptions;
				}

				var result = new ItemOptionCollection();

				if (this.get('_optionsDetails') && this.get('_optionsDetails').fields)
				{
					var self = this
						// Prepares a simple map of the configuration
					,	options_config_map = {};

					_.each(this.itemOptionsConfig, function (option)
					{
						if (option.cartOptionId)
						{
							options_config_map[option.cartOptionId] = option;
						}
					});

					// if you are an child in the cart it then checks for the options of the parent
					var fields = this.get('_matrixParent').get('_id') ? this.get('_matrixParent').get('_optionsDetails').fields : this.get('_optionsDetails').fields;

					// Walks the _optionsDetails to generate a standard options response.
					_.each(fields, function (option_details)
					{
						//@class Item.Model.Option.Value
						//@property {String} internalid
						//@property {String} label
						//@property {String} url The url of the option to navigate to the PDP with that option selected by default

						//@class Item.Model.Option
						var option = {
							//@property {String} label Visible option name
							label: option_details.label
							//@property {Array<Item.Model.Option.Value>} values
						,	values: option_details.values
							//@property {String} type Type of the option. Possible values are: select, textarea, email, text
						,	type: option_details.type
							//@property {String} cartOptionId Value used to set options in the Commerce API
						,	cartOptionId: option_details.internalid
							//@property {String} itemOptionId Value returned from the Search API (API value 'sourcefrom')
						,	itemOptionId: option_details.sourcefrom || ''
							//@property {Boolean} isMatrixDimension
						,	isMatrixDimension: !!option_details.ismatrixdimension || false
							//@property {Boolean} isMandatory Indicate if the options is required or not
						,	isMandatory: !!option_details.ismandatory || false
							//@property {String} urlParameterName Parameter used to generate the url of this options. For example size instead or custcol12 in www.yourdomain.com/item?size=12&custcol12=3
						,	urlParameterName: option_details.internalid
							//@property {Boolean} useLabelsOnUrl Indicate if this option should show the label's value when displayed in the URL
							//or instead the internalid's value should be used (the second is the default)
						,	useLabelsOnUrl: false
							//@property {Number} index Property used to sort options. 10 by default
						,	index: 10
						};

						// Makes sure all options are availabe by defualt
						_.each(option.values, function (value)
						{
							value.isAvailable = true;
						});

						// Merges this with the configuration object
						if (options_config_map[option.cartOptionId])
						{
							option = _.extend(option, options_config_map[option.cartOptionId]);
						}

						option.values = _.map(option.values, function (value)
						{
							value.url = Utils.setUrlParameter(self.get('_url'), option.urlParameterName, option.useLabelsOnUrl ? value.label : value.internalid);
							return value;
						});

						if (option_details.ismatrixdimension && self.get('_matrixChilds').length)
						{
							var item_values = self.get('_matrixChilds').pluck(option.itemOptionId);

							option.values = _.filter(option.values, function (value)
							{
								if (value.internalid)
								{
									return _.contains(item_values, value.label);
								}

								return true;
							});
						}

						result.add(option);
					});

					// Since this is not going to change in the life of the model we can cache it
					this.cachedPosibleOptions = result;
				}

				return result;
			}

			// @method isProperlyConfigured Check in case the item has options all options have a itemOptionId property and in the item is matrix
			// check there are child matrix items
			// @returns {Boolean} true If the current item is properly configured
		,	isProperlyConfigured: function isProperlyConfigured ()
			{
				var options = this.getPosibleOptions()
				,	option = null;

				if (options && options.length)
				{
					for (var i = 0; i < options.length; i++)
					{
						option = options.at(i);

						if (option.get('isMatrixDimension') && !option.get('itemOptionId'))
						{
							return false;
						}
					}
				}
				// If you omit item options from the field set and use matrix, that's an issue.
				else if (this.get('_matrixChilds') && this.get('_matrixChilds').length)
				{
					return false;
				}

				return true;
			}

			// @method getKeyMapping
			// @return {ItemsKeyMapping}
		,	getKeyMapping: function getKeyMapping ()
			{
				if (!this._keyMapping)
				{
					this._keyMapping = _.defaults(Configuration.itemKeyMapping || {}, ItemKeyMapping.getKeyMapping(Configuration));
				}
				return this._keyMapping;
			}

			// @method get We have override the get function for this model in order to honor the ItemKeyMapping
			// It also makes sure that _matrixChilds and _relatedItems are Item.Collection and _matrixParent is an Item.Model
			// @param {String} attr
			// @param {Boolean} dont_cache if true it won't return the cached attribute value.
		,	get: function get (attr, dont_cache)
			{
				var keyMapping = this.getKeyMapping();

				// var keyMapping = this.keyMapping || (this.collection && this.collection.keyMapping); // TODO: Dev Tools migration concern...
				if (dont_cache || (keyMapping && !this.attributes[attr] && keyMapping[attr]))
				{
					var mapped_key = keyMapping[attr];

					if (_.isFunction(mapped_key))
					{
						this.attributes[attr] = mapped_key(this);
					}
					else if (_.isArray(mapped_key))
					{
						// then the value is get(arr[0]) || get(arr[1]) || ...
						for (var i = 0; i < mapped_key.length; i++)
						{
							if (this.attributes[mapped_key[i]])
							{
								this.attributes[attr] = this.attributes[mapped_key[i]];
								break;
							}
						}
					}
					else
					{
						this.attributes[attr] = this.attributes[mapped_key];
					}

					if (attr === '_matrixChilds' || attr === '_relatedItems')
					{
						ItemCollection = ItemCollection || Utils.requireModules('Item.Collection');
						if(!(this.attributes[attr] instanceof ItemCollection))
						{
							this.attributes[attr] = new ItemCollection(this.attributes[attr] || []);
						}
					}
					else if (attr === '_matrixParent')
					{
						if(!(this.attributes[attr] instanceof ItemModel))
						{
							this.attributes[attr] = new ItemModel(this.attributes[attr] || {});
						}
					}
				}

				return this.attributes[attr];
			}

			// @method  getDefaultPrice Given the price details of an item (class OnlineCustomerPriceDetail) returns the default onlinecustomerprice_formatted and onlinecustomerprice
			// @param {OnlineCustomerPriceDetail} details_object
			// @return {ItemPrice}
		,	getDefaultPrice: function getDefaultPrice (details_object)
			{
				//@class ItemPrice
				return {
					//@property {Number} price
					price: details_object.onlinecustomerprice
					//@property {String} price_formatted
				,	price_formatted: details_object.onlinecustomerprice_formatted
				};
				//@class Item.Model
			}

			//IMPORTANT: The following method are shared with Product.Model, allowing to use Products or Items interchangeably
			//If you edit them, please consider reflect the same changes in the Product.Model and potentially in the
			//Transaction.Line.Model


			// @method getPrice Gets the price based on the selection of the item and the quantity
			// @param {Number} quantity
			// @param {Array<Item.Model>?} selected_matrix_children
			// @return {ItemPrice}
		,	getPrice: function getPrice (quantity, selected_matrix_children)
			{
				selected_matrix_children = selected_matrix_children || (this.get('_matrixChilds') ? this.get('_matrixChilds').models : []);
				quantity = quantity || 1;

				var details_object = this.get('_priceDetails') || {}
				,	result =  this.getDefaultPrice(details_object);

				// Computes Quantity pricing based on the quantity specified as parameter
				if (details_object.priceschedule && details_object.priceschedule.length)
				{
					var price_schedule
					,	min
					,	max;

					for (var i = 0; i < details_object.priceschedule.length; i++)
					{
						price_schedule = details_object.priceschedule[i];

						min = parseInt(price_schedule.minimumquantity, 10);
						max = parseInt(price_schedule.maximumquantity, 10);

						if ((min <= quantity && quantity < max) || (min <= quantity && !max))
						{
							result  = {
								price: price_schedule.price
							,	price_formatted: price_schedule.price_formatted
							};
						}
					}
				}

				// if it's a matrix it will compute the matrix price
				if (selected_matrix_children.length)
				{
					// Gets the price of each child
					var children_prices = [];

					_.each(selected_matrix_children, function (child)
					{
						children_prices.push(child.getPrice(quantity));
					});

					if (children_prices.length === 1)
					{
						// If there is only one it means there is only one price to show
						result = children_prices[0];
					}
					else
					{
						// otherwise we should compute max and min to show a range in the GUI
						var children_prices_values = _.pluck(children_prices, 'price')
						,	min_value = _.min(children_prices_values)	//Minimum price from all children items
						,	max_value = _.max(children_prices_values);	//Maximum price from all children items

						if (min_value !== max_value)
						{
							// We return them alongside the result of the parent
							//@class ItemPrice
							//@property {Number?} min This value will be present only in the case the current item is Matrix, has a partial selection and its children have different range
							//of prices. When this property is present will contain the minimum price of all the children items valid to be selected.
							result.min = _.where(children_prices, {price: min_value})[0];
							//@property {Number?} max This value will be present only in the case the current item is Matrix, has a partial selection and its children have different range
							//of prices. When this property is present will contain the maximum price of all the children items valid to be selected.
							result.max = _.where(children_prices, {price: max_value})[0];
							//@class Item.Model
						}
						else
						{
							// they are all alike so we can show any of them
							result = children_prices[0];
						}
					}
				}

				// Adds the compare against price if its not set by one of the children
				if (!result.compare_price && this.get('_comparePriceAgainst'))
				{
					//@class ItemPrice
					//@property {Number} compare_price
					result.compare_price = this.get('_comparePriceAgainst');
					//@property {String} compare_price_formatted
					result.compare_price_formatted = this.get('_comparePriceAgainstFormated');
					//@class Item.Model
				}

				return result;
			}

			//@method getThumbnail Gets the thumbnail. This method acts as an alias for get('_thumbnail') which allows to use
			//Item.Model in places where Product.Model or Transaction.Line.Model is expected
			//@return {ImageContainer}
		,	getThumbnail: function getThumbnail ()
			{
				return this.get('_thumbnail');
			}

			//@method getSku Returns the sky of the current item. This method exist to complain with the Product.Model interface
			//@return {String}
		,	getSku: function getSku ()
			{
				return this.get('_sku');
			}

			//@method getImages Returns the list of the item images
			//@return {Array<ImageContainer>}
		,	getImages: function getImages ()
			{
				var result = []
				,	item_images_detail = this.get('itemimages_detail') || {};

				item_images_detail = item_images_detail.media || item_images_detail;
				result = Utils.imageFlatten(item_images_detail);

				//@class ImageContainer
				return result.length ? result : [{
					//@property {String} url
					url: Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Configuration.get('imageNotAvailable'))
					//@property {String} altimagetext
				,	altimagetext: this.get('_name')
				}];
				//@class Item.Model
			}

			// @method getOption
			// Returns an item option
			// @param {String} cart_option_id
			// @return {Item.Option.Model}
		,	getOption: function getOption (cart_option_id)
			{
				return this.get('options').findWhere({cartOptionId: cart_option_id});
			}

			// @method getStockInfo
			// Returns an standard formated object for the stock info taking in consideration current matrix option selection.
			// the login is the following: if there is an unique child selected use that. Else use the parent as default
			// values and open children properties if it has the same value for all selected children.
			// @param {Array<Item.Model>} selected_matrix_children
			// @param {OptionHelper.MatrixSelection} options_selection
			// @return {Item.StockInfo} the stock information of the current item
		,	getStockInfo: function getStockInfo (selected_matrix_children, options_selection)
			{
				options_selection = options_selection || {};
				// Standardize the result object

				selected_matrix_children = selected_matrix_children || [];

				// if we have one selected child we use that - else we use the parent as default
				var	model = selected_matrix_children.length === 1 ? selected_matrix_children[0] : this

				,	parent = this.get('_matrixParent')

				//@class Item.StockInfo
				,	stock_info = {
							//@property {Object}stock
							stock: model.get('_stock')

							//@property {Boolean} isInStock
						,	isInStock: model.get('_isInStock')

							//@property {String} outOfStockMessage
						,	outOfStockMessage: model.get('_outOfStockMessage') || this.get('_outOfStockMessage') || (parent && parent.get('_outOfStockMessage')) || _('Out of Stock').translate()

							//@property {Boolean} showOutOfStockMessage
						,	showOutOfStockMessage: model.get('_showOutOfStockMessage') || this.get('_showOutOfStockMessage')

							//@property {String} inStockMessage
						,	inStockMessage: model.get('_inStockMessage')

							//@property {Boolean} showInStockMessage
						,	showInStockMessage: model.get('_showInStockMessage')

							//@property {String} stockDescription
						,	stockDescription: model.get('_stockDescription') || this.get('_stockDescription')

							//@property {Boolean} showStockDescription
						,	showStockDescription: model.get('_showStockDescription')

							//@property {String} stockDescriptionClass
						,	stockDescriptionClass: model.get('_stockDescriptionClass')

							//@property {Boolean} isNotAvailableInStore Indicate if the item is present in the store (returned by the store item and the search API)
						,	isNotAvailableInStore: _.isUndefined(model.get('_isPurchasable'))

							//@property {Object} stockPerLocation
						,	stockPerLocation: model.get('_quantityavailableforstorepickup_detail')

							//@propery {Boolean} isAvailableForPickUp
						,	isAvailableForPickup: !!model.get('_isstorepickupallowed')

							//@propery {Boolean} showQuantityAvailable
						,	showQuantityAvailable: !!model.get('_showQuantityAvailable')
					}
				//@class Item.Model

				,	is_something_selected = _(options_selection).keys().length;

				// if this is an open selection we compute them all
				if (is_something_selected && selected_matrix_children.length > 1)
				{
					var matrix_children_stock_info = [];

					_.each(selected_matrix_children, function (child)
					{
						matrix_children_stock_info.push(child.getStockInfo());
					});

					// If all matrix children return the same value for a given attribute that becomes the output,
					// with the exception of stock that is an addition of the stocks of the children - but only if the parent has
					_.each(stock_info, function (value, key)
					{
						var children_values_for_attribute = _.pluck(matrix_children_stock_info, key);

						if (key === 'stock')
						{
							stock_info.stock = _.reduce(children_values_for_attribute, function (memo, num)
							{
								return memo + num;
							}, 0);

							if(isNaN(stock_info.stock))
							{
								delete stock_info.stock;
							}
						}
						else if (key === 'isInStock')
						{
							// the parent is in stock if any of the child items is in stock
							// so, if in the array of the values of 'isInStock' for the childs
							// there is a 'true', then the parent item is in stock
							stock_info.isInStock = _.contains(children_values_for_attribute, true);
						}
						else
						{
							children_values_for_attribute = _.uniq(children_values_for_attribute);

							if (children_values_for_attribute.length === 1)
							{
								stock_info[key] = children_values_for_attribute[0];
							}
						}
					});
				}

				return stock_info;
			}

		});

	return ItemModel;
});
