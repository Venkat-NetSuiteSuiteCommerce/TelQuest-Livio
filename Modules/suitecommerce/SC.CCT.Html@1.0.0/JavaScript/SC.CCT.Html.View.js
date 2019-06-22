/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC.CCT.Html
define('SC.CCT.Html.View'
,	[
		'CustomContentType.Base.View'

	,	'sc_cct_html.tpl'
	]
,	function (
		CustomContentTypeBaseView

	,	sc_cct_html_tpl
	)
{
	'use strict';

	//@class SC.CCT.Html.View @extend CustomContentType.Base.View
	return CustomContentTypeBaseView.extend({

		template: sc_cct_html_tpl

	,	getContext: function getContext()
		{
			// @class SC.CCT.Html.View.Context
			return {
				//@property {String} htmlString
				htmlString: this.settings.html_string
				//@property {Boolean} hasHtmlString
			,	hasHtmlString: !!this.settings.html_string
			};
			// @class SC.CCT.Html.View
		}
	});
});
