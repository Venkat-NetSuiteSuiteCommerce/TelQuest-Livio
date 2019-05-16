/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SocialSharing
define(
	'SocialSharing.Plugins.Twitter'
,	[
		'SC.Configuration'
	,	'SocialSharing'

	,	'underscore'
	]
,	function(
		Configuration
	,	SocialSharing

	,	_
	)
{
	/*jshint validthis:true*/
	'use strict';

	// @class SocialSharing.Twitter @extends ApplicationModule
	var twitterPlugin = {

		// @method shareInTwitter
		// opens a new window to share the page in Twitter
		// based on some configuration options
		// @param {String}url @param {String}description @param {String}via @param {Object}popup_options
		shareInTwitter: function (url, description, via, popup_options)
		{
			var popup_options_string = this.getPopupOptionsStringFromObject(popup_options || Configuration.get('twitter.popupOptions'))
			,	target_url = 'https://twitter.com/intent/tweet?original_referer='+ encodeURIComponent(url) +'&source=tweetbutton&text='+ encodeURIComponent(description) +'&url='+ encodeURIComponent(url) +'&via='+ encodeURIComponent(via);
			
			window.open(target_url, _.uniqueId('window'), popup_options_string);
		}
	
		// @method shareInTwitterEventListener
		// calls shareInTwitter method passing the configuration options
	,	shareInTwitterEventListener: function (e)
		{
			e.preventDefault();

			var metaTagMappingOg = Configuration.get('metaTagMappingOg')
			,	url = metaTagMappingOg['og:url'](this)
			,	title = metaTagMappingOg['og:title'](this)
			,	via = Configuration.get('twitter.via') ? Configuration.get('twitter.via').replace('@', '') : '';
			
			this.shareInTwitter(url, title, via);
		}

	,	mountToApp: function (application)
		{
			if (Configuration.get('twitter.enable'))
			{			
				var layout = application.getLayout();

				// This are mostly related to the dom, or to events, so we add them in the layout
				_.extend(layout, {
					shareInTwitter: this.shareInTwitter
				});

				// extend Layout and add event listeners
				_.extend(layout.events, {
					'click [data-action="share-in-twitter"]': this.shareInTwitterEventListener
				});


				// @class SocialSharing.Twitter.Plugin @extends Plugin
				SocialSharing.afterAppendView.install({
					name: 'twitterPlugin'
				,	priority: 10
				,	execute: function (application) 
					{
						var layout = application.getLayout();

						layout.$el.find('[data-type="social-share-icons"]').append('<a href="#" class="social-sharing-flyout-content-social-twitter" data-action="share-in-twitter"><i class="social-sharing-flyout-content-social-twitter-icon"></i> <span>Tweet</span></a>');
					}
				});
			}
		}
	};

	return twitterPlugin;
});
