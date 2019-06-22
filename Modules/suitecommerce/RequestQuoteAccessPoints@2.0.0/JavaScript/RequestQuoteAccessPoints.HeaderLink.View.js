/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module RequestQuoteAccessPoints
define('RequestQuoteAccessPoints.HeaderLink.View'
,	[
		'requestquote_accesspoints_headerlink.tpl'

	,	'Backbone'
	]
,	function (
		requestquote_accesspoints_headerlink_tpl

	,	Backbone
	)
{
	'use strict';

	//@class RequestQuoteAccessPoints.HeaderLink.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: requestquote_accesspoints_headerlink_tpl

		//@method getContext
		//@return {RequestQuoteAccessPoints.HeaderLink.View.Context}
	, 	getContext: function ()
		{
			//@class RequestQuoteAccessPoints.HeaderLink.View.Context
			return {
				//@property {Boolean} hasClass
				hasClass: !!this.options.className
				//@property {String} className
			,	className: this.options.className
			};
			//@class RequestQuoteAccessPoints.HeaderLink.View
		}
	});
});