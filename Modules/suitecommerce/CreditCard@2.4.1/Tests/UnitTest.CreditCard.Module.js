/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'CreditCard'
	,	'CreditCard.Router'
	,	'jasmine2-typechecking-matchers'
	,	'Application'
	]
,	function (
		CreditCard
	,	CreditCardRouter
	)
{
	'use strict';
	return describe('Credit Card Module', function () 
	{
		describe('definition', function ()
		{
			it ('should define initial module properties', function ()
			{
				expect(CreditCard.MenuItems).toBeDefined();
				expect(CreditCard.mountToApp).toBeA(Function);
			});

			// it ('and mount to app should initalize the router', function ()
			// {
			// 	var application = SC.Application('Test')
			// 	,	result_to_mount_app = CreditCard.mountToApp(application,{startRouter: true});

			// 	expect(result_to_mount_app).toBeA(CreditCardRouter);
			// });
		});
	});
});