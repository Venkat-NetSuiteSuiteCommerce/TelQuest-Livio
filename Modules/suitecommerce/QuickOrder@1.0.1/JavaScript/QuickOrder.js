/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module QuickOrder
define(
	'QuickOrder'
,   [
		'QuickOrder.View'

	,   'Cart.Detailed.View'
	,	'QuickOrder.EmptyCart.View'
	]
,   function (
		QuickOrderView

	,   CartDetailedView
	,	QuickOrderEmptyCartView
	)
{
	'use strict';

	//@class QuickOrder @extend ApplicationModule
	return  {

		//@method mountToApp
		//@param {ApplicationSkeleton} application
		//@return {Void}
		mountToApp: function ()
		{
			//Show Quick Order in Cart
			CartDetailedView.addChildViews && CartDetailedView.addChildViews({
				'Quick.Order': function wrapperFunction (options)
				{
					options = options || {};
					options.urlOptions = options.urlOptions || {};
					
					return function ()
					{
						return new QuickOrderView({
							openQuickOrder: options.urlOptions.openQuickOrder === 'true'
						});
					};
				}
			});

			//Show Quick Order Empty Cart Message in Cart
			CartDetailedView.addChildViews && CartDetailedView.addChildViews({
				'Quick.Order.EmptyCart': function wrapperFunction ()
				{
					
					return function ()
					{
						return new QuickOrderEmptyCartView({});
					};
				}
			});
		}
	};
  }
);