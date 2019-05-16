/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module jQueryExtras

#jQuery.html

ONLY FOR PAGE GENERATOR. 

ReDefines jQuery html and appends functions to control how and what new content 
is added into the DOM. If in page generator we also override jQuery.html() and jQuery.append() so html 
output is minified. Also remove scripts - so content scripts don't appear in SEO output.

*/
define('jQuery.html', ['jQuery', 'Utils'], function (jQuery, utils)
{
	'use strict';

	return {
		mountToApp: function ()
		{			
			if (utils.isPageGenerator())
			{
				var jQuery_originalHtml = jQuery.fn.html;
				jQuery.fn.html = function (html)
				{
					if (typeof html === 'string')
					{
						html = utils.minifyMarkup(html);
						html = utils.removeScripts(html);
					}
					return jQuery_originalHtml.apply(this, [html]);
				};

				var jQuery_originalAppend = jQuery.fn.append;
				jQuery.fn.append = function (html)
				{
					if (typeof html === 'string')
					{
						html = utils.minifyMarkup(html);
						html = utils.removeScripts(html);
					}
					return jQuery_originalAppend.apply(this, [html]);
				};
			}
		}
	};
});
