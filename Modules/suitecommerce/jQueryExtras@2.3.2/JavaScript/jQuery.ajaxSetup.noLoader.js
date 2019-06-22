/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// jQuery.ajaxSetup.js
// -------------------
// Adds the loading icon, updates icon's placement on mousemove
// Changes jQuery's ajax setup defaults
define('jQuery.ajaxSetup.noLoader', ['jQuery', 'Utils'], function (jQuery)
{
	'use strict';

	// http://api.jquery.com/jQuery.ajaxSetup/
	jQuery.ajaxSetup({
		beforeSend: function (jqXhr, options)
		{
			// BTW: "!~" means "== -1"
			if (!~options.contentType.indexOf('charset'))
			{
				// If there's no charset, we set it to UTF-8
				jqXhr.setRequestHeader('Content-Type', options.contentType + '; charset=UTF-8');
			}

			// Add header so that suitescript code can know the current touchpoint
			jqXhr.setRequestHeader('X-SC-Touchpoint', SC.ENVIRONMENT.SCTouchpoint);
		}
	});

});
