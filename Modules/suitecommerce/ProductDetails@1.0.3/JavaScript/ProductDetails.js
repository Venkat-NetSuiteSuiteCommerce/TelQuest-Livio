/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetails Implements the full experience of the Product Details Page (PDP)
// Consists on a router, a model and the DetailsView with an image gallery view to show the product images
define(
	'ProductDetails'
,	[
		'ProductDetails.Router'
	,	'SC.Configuration'
	,	'ProductDetails.Component'

	]
,	function (
		ProductDetailsRouter
	,	Configuration
	,	ProductDetailsComponent
	)
{
	'use strict';

	//@class ProductDetails instantiate the router and publicly expose the PDP Component @extends ApplicationModule
	return {
		//@method mountToApp
		//@return {ProductDetails.Component}
		mountToApp: function (application)
		{
			if (Configuration.get('modulesConfig.ProductDetails.startRouter', false))
			{
				new ProductDetailsRouter({application: application});
			}

			return ProductDetailsComponent(application);
		}
	};
});
