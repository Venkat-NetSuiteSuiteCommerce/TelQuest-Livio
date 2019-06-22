define('UnitTest.Cart.Preconditions', function()
{
	'use strict';

	window.SC = window.SC || {};

	SC.ENVIRONMENT = {
			baseUrl: ''
		,	siteSettings: {}
	};

	SC.isPageGenerator = function()
	{
		return true;
	}
});
