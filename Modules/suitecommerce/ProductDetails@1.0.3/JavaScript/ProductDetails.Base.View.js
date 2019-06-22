/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ProductDetails
define(
	'ProductDetails.Base.View'
,	[
		'Backbone.FormView'

	,	'GlobalViews.Message.View'

	,	'Cart.AddToCart.Button.View'

	,	'ProductLine.Stock.View'
	,	'ProductViews.Price.View'
	,	'ProductLine.Sku.View'

	,	'ProductDetails.Options.Selector.View'
	,	'ProductDetails.Information.View'
	,	'ProductDetails.Quantity.View'
	,	'ProductDetails.ImageGallery.View'
	,	'ProductDetails.AddToProductList.View'
	,	'ProductLine.StockDescription.View'

	,	'Profile.Model'
	,	'Tracker'

	,	'SC.Configuration'
	,	'Backbone.CompositeView'
	,	'Backbone.Validation.callbacks'
	,	'RecentlyViewedItems.Collection'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'

	,	'UrlHelper'
	,	'jQuery.scPush'
	]
,	function (
		BackboneFormView

	,	GlobalViewsMessageView

	,	CartAddToCartButtonView

	,	ProductLineStockView
	,	ProductViewsPriceView
	,	ProductLineSkuView

	,	ProductDetailsOptionsSelectorView
	,	ProductDetailsInformationView
	,	ProductDetailsQuantityView
	,	ProductDetailsImageGalleryView
	,	ProductDetailsAddToProductListView
	,	ProductLineStockDescriptionView

	,	ProfileModel
	,	Tracker

	,	Configuration
	,	BackboneCompositeView
	,	BackboneValidationCallbacks
	,	RecentlyViewedItemsCollection

	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	//@class ProductDetails.Base.View Handles the PDP and quick view @extend Backbone.View
	var ProductDetailsBaseView = Backbone.View.extend(
		{
			//@property {String} title
			title: ''

			//@property {String} page_header
		,	page_header: ''

			//@property {String} modalClass
		,	modalClass: 'global-views-modal-large'

			//@property {Boolean} showModalPageHeader
		,	showModalPageHeader: false

			//@property {Object} baseEvents
		,	baseEvents: {
				'submit [data-action="submit-form"]': 'mainActionHandler'
			}

		,	bindings: {
				//set quantity
				'[name="quantity"]': {
					observe: 'quantity'
				,	setOptions: {
						validate: true
					,	silent: false
					}
				,	onSet: function (quantity_str)
					{
						return parseInt(quantity_str, 10);
					}
				,	events: ['blur', 'change']
				}
				//enable/disable minus mobile quantity button
			,	'[data-type="product-details-quantity-remove"]': {
					observe: 'quantity'
				,	update: function ($el, value)
					{
						return $el.attr('disabled', value <= 1);
					}
				}
			}

			//@method initialize
			//@param {ProductDetails.Base.View.Initialize.Options} options
			//@return {Void}
		,	initialize: function initialize (options)
			{
				this.events = _.extend(this.events || {}, this.baseEvents);
				Backbone.View.prototype.initialize.apply(this, arguments);

				this.application = options.application;

				this.generateViewBindings();

				BackboneCompositeView.add(this);

				BackboneFormView.add(this, {
					noCloneModel: true
				});

				var self = this;

				//Here we wrap the areAttributesValid method of the transaction line so when child views or injected views validate the model using this method
				//this view is notified and can show the error messages.
				//This is thanks to the poor "API" Backbone.validation offer.
				this.model.areAttributesValid = _.wrap(this.model.areAttributesValid, function (fn, attributes, validators)
				{
					var are_attr_valid = fn.apply(self.model, [attributes, validators])
					,	current_validation = _.extend({}, self.model.validation)
					,	attribute_validation_result;

					_.extend(self.model.validation, validators);

					//In order to properly show the validation on message in the UI we need to validate against the temporal properties on the model
					//that are those binded to the template! (See method generateViewBindings)
					if (~_.indexOf(attributes, 'options'))
					{
						self.model.get('options').map(function (option)
						{
							attributes.push(option.get('cartOptionId'));
						});
					}

					_.each(attributes, function (attribute)
					{
						attribute_validation_result = self.model.preValidate(attribute, self.model.get(attribute));

						if (attribute_validation_result)
						{
							//Here we assume that the default selector 'name' is being used
							BackboneValidationCallbacks.invalid(self, attribute, attribute_validation_result, 'name');
						}
						else
						{
							BackboneValidationCallbacks.valid(self, attribute, 'name');
						}
					});

					self.model.validation = current_validation;

					return are_attr_valid;
				});

				if (ProductDetailsBaseView.mainActionView)
				{
					this.mainActionViewInstance = new ProductDetailsBaseView.mainActionView({
						application: this.options.application
					,	model: this.model
					});
				}
			}

			//@method mainActionHandler Handle the submit action
			//@param {jQuery.Event} e
			//@return {Boolean}
		,	mainActionHandler: function mainActionHandler (e)
			{
				if (ProductDetailsBaseView.mainActionView)
				{
					return this.mainActionViewInstance.submitHandler(e);
				}
				else
				{
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			}

			//@method showContent Override default method to track current product, add product to viewed ones and start the pusher
			//@return {jQuery.Deferred}
		,	showContent: function showContent ()
			{
				var self = this;

				return Backbone.View.prototype.showContent.apply(this, arguments).done(function ()
				{
					Tracker.getInstance().trackProductView(self.model);
					RecentlyViewedItemsCollection.getInstance().addHistoryItem(self.model.get('item'));
					self.$('[data-action="pushable"]').scPush();
				});
			}

			//@method generateViewBindings Extend the bindings properties by adding all the bindings to all the temporal option properties
			//@return {Void}
		,	generateViewBindings: function generateViewBindings ()
			{
				var self = this
				,	option_bindings = self.model.get('options').reduce(function (bindings, option)
					{
						var cart_option_id = option.get('cartOptionId');

						//Bind to set options
						bindings['[name="' + cart_option_id + '"]'] = {
								observe: option.get('cartOptionId')		// << TEMP PROPERTY TO MAKE EASY VALIDATION (READ HERE)
							,	setOptions: {
									validate: true
								,	silent: true
								}
							,	onSet: function (value, options)
								{
									var view =  options.view
									,	product_model = view.model
									,	option = product_model.get('options').findWhere({cartOptionId: options.observe})
									,	current_value = option.get('value') && option.get('value').internalid;

									if (!option.get('isMandatory') && current_value === value && view.$(options.selector).attr('type') === 'radio')
									{
										// unset value.
										value = null;
									}

									product_model.setOption(options.observe, value);

									return value;
								}
							,	events: [self.getBindingEventForOption(option)]
						};

						//Binding for the label (selected value)
						bindings['[data-value="'+ cart_option_id +'"]'] = {
								observe: option.get('cartOptionId')
							,	onGet: function ()
								{
									return option.get('value') ? option.get('value').label : '';
								}
						};

						_.each(option.get('values'), function(value)
						{
							if (value.internalid) // Exclude the " - Select -" option
							{
								//Bind for mute and active options
								bindings['[data-label="label-' + cart_option_id + '"][value="' + value.internalid + '"]'] = {
									attributes: [{
										name: 'class'
									,	observe: option.get('cartOptionId')
									,	onGet: function ()
										{
											if (!_.findWhere(option.get('values'), {internalid: value.internalid}).isAvailable)
											{
												return 'muted';
											}
											else if (value.internalid === (option.get('value') && option.get('value').internalid))
											{
												return 'active';
											}
											else
											{
												return '';
											}
										}
									}]
								};
							}

						});

						return bindings;
					}, {});

				_.extend(this.bindings, option_bindings);
			}

			//@method getBindingEventForOption Auxiliary method used to allows different bindings depending on the option type
			//@param {Transaction.Line.Option.Model} option
			//@return {String} Event name used to make the binding with stickIt
		,	getBindingEventForOption: function getBindingEventForOption (option)
			{
				return ProductDetailsBaseView.optionBindEventByType[option.get('type').toLowerCase()] || 'blur';
			}

			//@method updateURL Updates the current URL based on the selected attributes of the current line
			//@return {Void} This method does not return nothing as it only update the URL without navigating
		,	updateURL: function updateURL ()
			{
				Backbone.history.navigate(this.model.generateURL(), {replace: true});

				Tracker.getInstance().trackProductView(this.model);
			}

			// @method getBreadcrumbPages Returns the breadcrumb for the current page based on the current item
			// @return {Array<BreadcrumbPage>} breadcrumb pages
		,	getBreadcrumbPages: function getBreadcrumbPages ()
			{
				return this.model.get('item').get('_breadcrumb');
			}

			//@method render Override default render method to initialize plugins and set page title and page_header
			//@return {Void}
		,	render: function render ()
			{
				this.title = this.model.get('item').get('_pageTitle');
				this.page_header = this.model.get('item').get('_pageHeader');

				this._render();
			}

			// @method getMetaKeywords
			// @return {String}
		,	getMetaKeywords: function getMetaKeywords ()
			{
				// searchkeywords is for alternative search keywords that customers might use to find this item using your Web store's internal search
				// they are not for the meta keywords
				// return this.model.get('_keywords');
				return this.getMetaTags().filter('[name="keywords"]').attr('content') || '';
			}

			// @method getMetaTags
			// @return {Array<HTMLElement>}
		,	getMetaTags: function getMetaTags ()
			{
				return jQuery('<head/>').html(
					jQuery.trim(
						this.model.get('item').get('_metaTags')
					)
				).children('meta');
			}

			// @method getMetaDescription
			// @return {String}
		,	getMetaDescription: function getMetaDescription ()
			{
				return this.getMetaTags().filter('[name="description"]').attr('content') || '';
			}

		,	showOptionsPusher: function showOptionsPusher ()
			{
				return false;
			}

		,	contextData: {
				'product': function ()
				{
					return this.model;
				}
			,	'item': function ()
				{
					return this.model.get('item');
				}
			}

			//@property {ChildViews} childViews
		,	childViews: {
				'Product.Options': function ()
				{
					return new ProductDetailsOptionsSelectorView({
						model: this.model
					,	application: this.application
					,	show_pusher: this.showOptionsPusher()
					,	show_required_label: this.model.get('item').get('itemtype') === 'GiftCert'
					});

				}
			,	'Product.Price': function ()
				{
					return new ProductViewsPriceView({
						model: this.model
					,	origin: this.inModal ? 'PDPQUICK' : 'PDPFULL'
					});
				}
			,	'MainActionView': function ()
				{
					return this.mainActionViewInstance && this.mainActionViewInstance;
				}

			,	'Product.Stock.Info': function ()
				{
					return new ProductLineStockView({
						model: this.model
					});
				}

			,	'Product.Sku': function ()
				{
					return new ProductLineSkuView({
						model: this.model
					});
				}
			,	'Quantity': function ()
				{
					return new ProductDetailsQuantityView({
						model:this.model
					});
				}
			,	'Product.ImageGallery': function ()
				{
					return new ProductDetailsImageGalleryView({
						model:this.model
					});
				}
			,	'GlobalViewsMessageView.WronglyConfigureItem': function ()
				{
					return new GlobalViewsMessageView({
						message: _.translate('<b>Warning</b>: This item is not properly configured, please contact your administrator.')
					,	type: 'warning'
					});
				}
			,	'AddToProductList': function ()
				{
					return new ProductDetailsAddToProductListView({
						model: this.model
					,	application: this.options.application
					});
				}
			,	'StockDescription': function ()
				{
					return new ProductLineStockDescriptionView({
						model: this.model
					});
				}
			}

			//@method getContext
			//@return {ProductDetails.Base.View.Context}
		,	getContext: function ()
			{
				var item_model = this.model.get('item');

				//@class ProductDetails.Base.View.Context
				return {
					//@property {Transaction.Line.Model} model
					model: this.model
					//@property {String} pageHeader
				,	pageHeader: this.page_header
					//@property {String} itemUrl
				,	itemUrl: item_model.get('_url') + this.model.getQuery()
					//@property {Boolean} isItemProperlyConfigured
				,	isItemProperlyConfigured: item_model.isProperlyConfigured()
					//@property {Boolean} isPriceEnabled
				,	isPriceEnabled: !ProfileModel.getInstance().hidePrices()

				};
				//@class ProductDetails.Base.View
			}
		}
		//Static properties
	,	{
			//@property {ProductDetails.Base.View.OptionBinding} optionBindEventByType
			//@static
			optionBindEventByType: {
				//@class ProductDetails.Base.View.OptionBinding This class associated an option type with the event used to set the option's value
				// @extend Dictionary<String, String>
				'select': 'change'
			,	'text': 'blur'
			,	'date': 'change'
			}
			//@class ProductDetails.Base.View

			//@method addMainActionView Allows to add a BackboneView constructor as the view that will perform the main action.
			//@param {Backbone.View} main_action_view
			//@return {Void}
			//@static
		,	addMainActionView: function (main_action_view)
			{
				ProductDetailsBaseView.mainActionView = main_action_view;
			}

			//@method getMainActionView Allows to retrieve the current set BackboneView constructor used as the view that will perform the main action.
			//@return {Backbone.View?}
			//@static
		,	getMainActionView: function ()
			{
				return ProductDetailsBaseView.mainActionView;
			}
		}
	);

	ProductDetailsBaseView.addMainActionView(CartAddToCartButtonView);

	return ProductDetailsBaseView;
});

//@class ProductDetails.Base.View.Initialize.Options
//@property {Product} model
//@property {String} baseUrl
//@property {ApplicationSkeleton} application
