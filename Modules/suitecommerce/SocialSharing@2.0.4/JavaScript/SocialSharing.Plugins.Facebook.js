/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SocialSharing
define(
	'SocialSharing.Plugins.Facebook'
,	[
		'SC.Configuration'
	,	'SocialSharing'
	,	'UrlHelper'

	,	'Utils'
	,	'jQuery'
	,	'underscore'
	]
,	function(
		Configuration
	,	SocialSharing
	,	UrlHelper

	,	Utils
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class SocialSharing.Facebook @extends ApplicationModule
	var facebookPlugin = {

		shareInFacebookEventListener: function()
		{
			var url = window.location.href
			,	popup_options_string = this.getPopupOptionsStringFromObject(Configuration.get('facebook.popupOptions'))
			,	target_url = 'https://www.facebook.com/dialog/share?display=popup&app_id='+Configuration.get('facebook.appId')+'&href='+ encodeURIComponent(url)+'&redirect_uri=' + encodeURIComponent(_.addParamsToUrl(url,{closeFBPopup:1}));

			window.open(target_url, _.uniqueId('window'), popup_options_string);
		}

	,	mountToApp: function (application)
		{

			//This will close the popup window after the redirect occurs (after the user shares).
			UrlHelper.addTokenListener('closeFBPopup', function ()
  			{
  				window.close();
  			});

			if (Configuration.get('facebook.enable'))
			{
				var layout = application.getLayout();

				// This are mostly related to the dom, or to events, so we add them in the layout
				_.extend(layout.events, {
					'click [data-action="share-in-facebook"]': this.shareInFacebookEventListener
				});


				// @class SocialSharing.Facebook.Plugin this plugin is installed in both
				// SocialSharing.afterAppendView and SocialSharing.afterAppendToDom @extends Plugin
				var plugin = {
					name: 'facebookPlugin'
				,	priority: 10
				,	execute: function (application)
					{
						var layout = application.getLayout();

						if (!jQuery('[data-type="like-in-facebook"]').size())
						{
							layout.$el.find('[data-type="social-share-icons"]').append('<a href="#" class="social-sharing-flyout-content-social-facebook" data-action="share-in-facebook"><i class="social-sharing-flyout-content-social-facebook-icon"></i> <span>Share</span></a>');
						}
					}
				};

				SocialSharing.afterAppendView.install(plugin);

				SocialSharing.afterAppendToDom.install(plugin);
			}
		}
	};

	return facebookPlugin;
});
