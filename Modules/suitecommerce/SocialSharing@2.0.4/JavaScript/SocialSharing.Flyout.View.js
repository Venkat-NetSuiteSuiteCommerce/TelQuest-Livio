/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SocialSharing
define(
	'SocialSharing.Flyout.View'
,	[	'social_sharing_flyout.tpl'

	,	'Backbone'
	]
,	function(
		social_sharing_flyout_tpl

	,	Backbone
	)
{
	'use strict';

	// @class SocialSharing.Flyout.View @extends Backbone.View
	return Backbone.View.extend({

		template: social_sharing_flyout_tpl

		// @method getContext @returns {SocialSharing.Flyout.View.Context}
	,	getContext: function()
		{
			// @class SocialSharing.Flyout.View.Context
			return {
				// @property {SiteSearch.Model} model
				// model: this.model
			};
		}
	});
});
