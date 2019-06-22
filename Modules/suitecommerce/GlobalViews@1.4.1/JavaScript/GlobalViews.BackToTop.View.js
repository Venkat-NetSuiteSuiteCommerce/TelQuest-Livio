/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module GlobalViews
define(
	'GlobalViews.BackToTop.View'
,	[

		'global_views_back_to_top.tpl'

	,	'Backbone'
	,	'jQuery'
	]
,	function(
		global_views_back_to_top_tpl

	,	Backbone
	,	jQuery
	)
{
	'use strict';

	// @class GlobalViews.BackToTop.View @extends Backbone.View
	return Backbone.View.extend({

		template: global_views_back_to_top_tpl

	,	events: {
			'click [data-action="back-to-top"]': 'backToTop'
		}
		
		// @method backToTop
	,	backToTop: function ()
		{
			jQuery('html, body').animate({scrollTop: '0px'}, 300);
		}
	});
});