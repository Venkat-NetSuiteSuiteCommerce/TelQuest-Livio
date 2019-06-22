define(
	'MyExamplePDPExtension2'
,   [
		'MyExtension2.View'
	]
,   function (
		MyExtension2View
	)
{
	'use strict';

	return  {
		mountToApp: function mountToApp (application)
		{
			// We show the MyExtension2 only if is not the SEO
			if (!SC.isPageGenerator())
			{
				//Get the pdp component
				var pdp = application.getComponent('PDP');


				// We will add 2 more buttons before and after the 'addToCart' button, in the same container
				// By default, if is not specified, the 'addToCart' button will have the 'childViewIndex' equalt to 10
				// So in this case, we will add a button before and after the 'addToCart' button
				pdp.addChildViews(
					'ProductDetails.Full.View'
				,	{
						'MainActionView':
						{
							'BeforeMyExtension2':
							{
								childViewIndex: 5
							,	childViewConstructor: function()
								{
									return new MyExtension2View({
										'message': 'Full View Before AddToCart'
									,	'text': 'Before AddToCart'
									});
								}
							}
						,	'AfterMyExtension2':
							{
								childViewIndex: 20
							,	childViewConstructor: function()
								{
									return new MyExtension2View({
										'message': 'Full View After AddToCart'
									,	'text': 'After AddToCart'
									});
								}
							}
						}
					}
				);

				// Now suppose that we have these buttons in the same container, 'Before AddTocart', 'Add To Cart' and 'After AddToCart'
				// If we want to change the position of one of the buttons in the container, we can call the 'setChildViewIndex' method
				// So before we will have (position - View): 5 - 'Before AddToCart', 10 - 'Add To Cart', 20 - 'After AddToCart'
				// And after setting the index: 5 - 'Before AddToCart', 20 - 'After AddToCart', 30 - 'Add To Cart'
				pdp.setChildViewIndex('ProductDetails.Full.View', 'MainActionView', 'MainActionView', 30);

				//Set the extra children of the ProductDetailsQuickViewView
				pdp.addChildViews(
					'ProductDetails.QuickView.View'
				,	{
						'MainActionView':
						{
							'BeforeMyExtension2':
							{
								childViewIndex: 5
							,	childViewConstructor: function()
								{
									return new MyExtension2View({
										'message': 'Quick View Before AddToCart'
									,	'text': 'Before AddToCart'
									});
								}
							}
						,	'AfterMyExtension2':
							{
								childViewIndex: 20
							,	childViewConstructor: function()
								{
									return new MyExtension2View({
										'message': 'Quick View After AddToCart'
									,	'text': 'After AddToCart'
									});
								}
							}
						}
					}
				);
			}
		}
	};
});
