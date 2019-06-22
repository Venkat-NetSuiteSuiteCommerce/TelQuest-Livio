/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module PickupInStore
define('PickupInStore'
,	[
		'Location'
	,	'ProductDetails.Full.View'
	,	'Cart.Lines.View'
	,	'Facets.ItemCell.View'
	,	'PickupInStore.View'
	,	'PickupInStore.FulfillmentOptions.View'
	,	'ProductLine.Common.Url'
	,	'ProductLine.Stock.View'
	,	'SC.Configuration'
	,	'underscore'
	,	'jQuery'
	
	,	'jquery.cookie'
	,	'PickupInStore.AddToCart.Button'
	]
,	function (
		Location
	,	ProductDetailsFullView
	,	CartLinesView
	,	FacetsItemCellView
	,	PickupInStoreView
	,	PickupInStoreFulfillmentOptionsView
	,	ProductLineCommonUrl
	,	ProductLineStockView
	,	Configuration
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class ProductDetailToQuote @extend ApplicationModule
	return  {
			//@method mountToApp
			//@param {ApplicationSkeleton} application
			//@return {Void}
			mountToApp: function mountToApp (application)
			{

				if (!Configuration.get('siteSettings.isPickupInStoreEnabled'))
				{
					return;
				}

				ProductLineCommonUrl.attributesReflectedInURL.push('location');

				ProductLineCommonUrl.attributesReflectedInURL.push('fulfillmentChoice');

				// Set the extra children of the ProductDetailsFullView
				// We show the pickup in store view only if the item is purchasable.
				// If it is not, we show the Out of Stock message.
				ProductDetailsFullView.addChildViews({
					'Product.Stock.Info': function wrapperFunction (options)
					{
						return function ()
						{
							if (options.model.getItem().get('ispurchasable'))
							{
								return new PickupInStoreView(
								{
									model: options.model
								,	application: application
								});
							}
							else
							{
								return new ProductLineStockView({
									model: options.model
								});

							}
						};
					}
				});

				//Set the extra children of the CartLinesView
				CartLinesView.addChildViews({
					'Product.Stock.Info': function wrapperFunction (options)
					{
						return function ()
						{
							return new PickupInStoreView(
							{
								model: options.model
							,	application: application
							,	source: 'cart'
							});
						};
					}
				});

				//Set the extra children of the FacetsItemCellView
				FacetsItemCellView.addChildViews({
					'ItemViews.Stock': function wrapperFunction (options)
					{
						return function ()
						{
							if (options.model.get('ispurchasable') && options.model.get('_isfulfillable'))
							{
								return new PickupInStoreFulfillmentOptionsView(
								{
									model: options.model
								,   application: application
								});
							}
							else
							{
								return new ProductLineStockView({
									model: options.model
								});
							}
						};
					}
				});

				application.getLayout().on('beforeAppendView', function (view)
				{
					if (view instanceof ProductDetailsFullView)
					{
						var location_id = view.model.get('location').get('internalid') || jQuery.cookie('myStore');

						if (location_id)
						{
							Location.fetchLocations(location_id).done(function ()
							{
								view.model.set('location',	Location.get(location_id));
							});
						}
					}
				});
			}
	};
});
