/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetails
define(
	'ProductDetails.AddToProductList.View'
,	[
		'ProductList.Control.View'
	,	'ProductList.ControlSingle.View'
	,	'Profile.Model'

	,	'product_details_add_to_product_list.tpl'

	,	'Backbone'
	,	'Backbone.CompositeView'
	,	'underscore'
	]
,	function (
		ProductListControlView
	,	ProductListControlSingleView
	,	ProfileModel

	,	product_details_add_to_product_list_tpl

	,	Backbone
	,	BackboneCompositeView
	,	_
	)
{
	'use strict';

	return Backbone.View.extend({

			template: product_details_add_to_product_list_tpl

		,	initialize: function ()
			{
				Backbone.View.prototype.initialize.apply(this, arguments);
				this.application = this.options.application;

				this.utils = this.application.ProductListModule && this.application.ProductListModule.Utils;

				this.countedClicks = {};

				BackboneCompositeView.add(this);

				var self = this;

				this.first_time_render = true;

				ProfileModel.getPromise().done(function(){
					self.loaded_site_settings = true;
					self.render();
				});


			}

		,	childViews: {
				'ProductListControl': function ()
				{
					if (this.utils.isSingleList())
					{
						return new ProductListControlSingleView({
							collection: this.utils.getProductLists()
						,	product: this.model
						,	application: this.application
						});
					}
					else
					{
						return new ProductListControlView({
							collection: this.utils.getProductLists()
						,	product: this.model
						,	application: this.application
						,	countedClicks: this.countedClicks
						});
					}
				}
			}
		,	render: function ()
			{
				if (this.loaded_site_settings && this.utils && this.utils.isProductListEnabled()){
					if(this.first_time_render){
						this.utils.getProductListsPromise().done(_.bind(this.render, this));
						this.first_time_render = false;
						return this.$el.empty();
					}
				}
				else
				{
					return this.$el.empty();
				}

				this._render();
			}

			//@method getContext
			//@return {ProductDetails.AddToProductList.View.Context}
		,	getContext: function ()
			{
				//@class ProductDetails.AddToProductList.View.Context
				return {
					//@property {Boolean} isLoading
					isLoading: this.utils.getProductListsPromise().state() === 'pending'
				};
				//@class ProductDetails.AddToProductList.View
			}
		}
	,	{
			attributesToValidate: ['options', 'quantity']
		}
	);
});
