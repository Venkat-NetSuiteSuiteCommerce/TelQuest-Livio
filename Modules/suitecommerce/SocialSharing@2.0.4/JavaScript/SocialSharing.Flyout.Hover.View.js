/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SocialSharing
define(
	'SocialSharing.Flyout.Hover.View'
,	[	'social_sharing_flyout_hover.tpl'

	,	'Backbone'
	]
,	function(
		social_sharing_flyout_hover_tpl

	,	Backbone
	)
{
	'use strict';

	// @class SocialSharing.Flyout.Hover.View @extends Backbone.View
	return Backbone.View.extend({

		template: social_sharing_flyout_hover_tpl

		// @method getContext @returns {SocialSharing.Flyout.Hover.View.Context}
	,	getContext: function()
		{
			// @class SocialSharing.Flyout.Hover.View.Context
			return {
			};
		}
	});
});
