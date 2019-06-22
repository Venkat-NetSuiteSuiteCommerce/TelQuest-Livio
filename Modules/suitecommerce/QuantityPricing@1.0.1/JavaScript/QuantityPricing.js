/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module QuantityPricing
define(
	'QuantityPricing'
,   [
		'QuantityPricing.View'

	,   'ProductDetails.Full.View'
	,	'RequestQuoteWizard.Module.Items.Line.Quantity.View'
	,	'ReorderItems.Actions.Quantity.View'
	,	'ProductDetails.QuickView.View'
	,	'Cart.Item.Summary.View'
	]
,   function (
		QuantityPricingView

	,   ProductDetailsFullView
	,	RequestQuoteWizardModuleItemsLineQuantityView
	,	ReorderItemsActionsQuantityView
	,	ProductDetailsQuickViewView
	,	CartItemSummaryView
	)
{
	'use strict';

	//@class QuantityPricing @extend ApplicationModule
	return  {

		//@method mountToApp
		//@param {ApplicationSkeleton} application
		//@return {Void}
		mountToApp: function ()
		{
			if (SC.ENVIRONMENT.siteSettings.quantitypricing)
			{
				//Set the quantity pricing on PDP
				ProductDetailsFullView.addChildViews && ProductDetailsFullView.addChildViews({
					'Quantity.Pricing': function wrapperFunction (options)
					{
						return function ()
						{
							return new QuantityPricingView({
								notUseAccordion: false
							,	model: options.model
							});
						};
					}
				});

				//Set the quantity pricing on Request Quote Wizard Module Items Line Quantity
				RequestQuoteWizardModuleItemsLineQuantityView.addChildViews && RequestQuoteWizardModuleItemsLineQuantityView.addChildViews({
					'Quantity.Pricing': function wrapperFunction (options)
					{
						return function ()
						{
							return new QuantityPricingView({
								notUseAccordion: true
							,	model: options.model
							});
						};
					}
				});

				//Set the quantity pricing on Reorder Item Action Quantity
				ReorderItemsActionsQuantityView.addChildViews && ReorderItemsActionsQuantityView.addChildViews({
					'Quantity.Pricing': function wrapperFunction (options)
					{
						return function ()
						{
							return new QuantityPricingView({
								notUseAccordion: true
							,	model: options.model
							});
						};
					}
				});

				//Set the quantity pricing on QuickView
				ProductDetailsQuickViewView.addChildViews && ProductDetailsQuickViewView.addChildViews({
					'Quantity.Pricing': function wrapperFunction (options)
					{
						return function ()
						{
							return new QuantityPricingView({
								notUseAccordion: false
							,	model: options.model
							});
						};
					}
				});

				//Set the quantity pricing on Cart transaction line
				CartItemSummaryView.addChildViews && CartItemSummaryView.addChildViews({
					'Quantity.Pricing': function wrapperFunction (options)
					{
						return function ()
						{
							return new QuantityPricingView({
								notUseAccordion: false
							,	model: options.model
							});
						};
					}
				});
			}
		}
	};
});