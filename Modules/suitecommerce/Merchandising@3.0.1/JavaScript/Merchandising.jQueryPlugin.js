/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module Merchandising 
#Merchandizing jQuery plugin
Implements a jQuery plugin 'merchandisingZone' to handle the Merchandising Zone's intialization. Usage example:

	jQuery('my-custom-selector').merchandisingZone(options) 

options MUST include the application its running id of the Zone to be rendered is optional IF it is on the element's data-id
*/
define('Merchandising.jQueryPlugin'
,	[	'Merchandising.Zone'
	,	'jQuery'
	]
,	function (
		MerchandisingZone
	,	jQuery
	)
{
	'use strict';
	// [jQuery.fn](http://learn.jquery.com/plugins/basic-plugin-creation/)
	jQuery.fn.merchandisingZone = function (options)
	{
		return this.each(function ()
		{
			new MerchandisingZone(this, options);
		});
	};
});