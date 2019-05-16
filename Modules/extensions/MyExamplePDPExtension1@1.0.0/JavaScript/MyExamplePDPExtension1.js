define('MyExamplePDPExtension1'
,	[
		'MyProductPrice.View'
	,	'MyError.View'
	,	'underscore'
	]
,	function (
		MyProductPriceView
	,	MyErrorView
	,	_)
{
	'use strict';
	
	return	{
		mountToApp: function (application)
		{
			//Get the pdp component
			var pdp = application.getComponent('PDP');
			
			var view_id = 'ProductDetails.Full.View';
			
			//Add the custom view MyProductPriceView into the Product.Price placeholder of the ProductDetails.Full.View 
			pdp.addChildViews(
				view_id
			,	{
					'Product.Price':
					{
						'new_price_view':
						{
							childViewIndex: 1
						,	childViewConstructor: function ()
							{
								return new MyProductPriceView({pdp: pdp});
							}
						}
					}
				}
			);
			
			//Removes the view in the Global.StarRating placeholder
			pdp.removeChildView(view_id, 'Global.StarRating');
			
			//Subscribe to the beforeShowContentEvent
			pdp.on('beforeShowContent', function(){
				//Get the pdp item in order to get the item's price
				var price = pdp.getItemInfo().item.onlinecustomerprice_detail;
				
				if(price.onlinecustomerprice > 100){
					//Show an error view when the price is greater than 100
					application.getLayout().showContent(
						new MyErrorView(
							{
								message: price.onlinecustomerprice_formatted+' IS TOO EXPENSIVE'
							}
						)
					);
				
					//Throw an exception in order to cancel the showContent execution
					throw new Error();
				}
			});
			
			//Subscribe to the afterShowContentEvent
			pdp.on('afterShowContent', function(){
				_.each(pdp.getItemInfo().item.options, function(option)
				{
					//For each set of item's options selects the last available option
					option.values.length && pdp.setOption(option.cartOptionId, _.last(option.values).internalid);
				});
				
			});
			
			return;
		}
	};
});