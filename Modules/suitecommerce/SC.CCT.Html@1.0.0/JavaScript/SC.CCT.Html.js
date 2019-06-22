/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC.CCT.Html
define('SC.CCT.Html'
,	[
		'SC.CCT.Html.View'
	]
,	function (
		SCCCTHtmlView
	)
{
	'use strict';

	return {
		mountToApp: function mountToApp(application)
		{
			var component = application.getComponent('CMS');

			if (!component)
			{
				return;
			}

			component.registerCustomContentType({
				id: 'CMS'
			,	view: SCCCTHtmlView
			});
		}
	};
});
