/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetailToQuote
define(
	'ProductDetailToQuote'
,   [
		'ProductDetails.Full.View'
	,	'ProductDetails.QuickView.View'
	,	'ProductDetailToQuote.View'
	]
,   function (
		ProductDetailsFullView
	,	ProductDetailsQuickViewView
	,	ProductDetailToQuoteView
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
			// We show the ProductDetailToQuote only if is not the SEO
			if (!SC.isPageGenerator())
			{
				//Set the extra children of the ProductDetailsFullView
				ProductDetailsFullView.addChildViews({
					'ProductDetails.AddToQuote': function wrapperFunction (options)
					{
						return function ()
						{
							return new ProductDetailToQuoteView(
							{
								'model': options.model
							,	'application': application
							});
						};
					}
				});

				//Set the extra children of the ProductDetailsQuickViewView
				ProductDetailsQuickViewView.addChildViews({
					'ProductDetails.AddToQuote': function wrapperFunction (options)
					{
						return function ()
						{
							return new ProductDetailToQuoteView(
							{
								'model': options.model
							,	'application': application
							});
						};
					}
				});
			}
		}
	};
});
