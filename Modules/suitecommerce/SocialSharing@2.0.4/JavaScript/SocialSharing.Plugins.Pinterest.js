/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SocialSharing
define(
	'SocialSharing.Plugins.Pinterest'
,	[
		'SC.Configuration'
	,	'SocialSharing'

	,	'jQuery'
	,	'underscore'
	]
,	function(
		Configuration
	,	SocialSharing

	,	jQuery
	,	_
	)
{
	'use strict';

	//@class SocialSharing.Pinterest @extends ApplicationModule
	var pinterestPlugin = {

		// @method shareInPinterest
		// opens a new window to share the page in Pinterest
		// based on some configuration options
		shareInPinterest: function (url, image, description, popup_options)
		{
			var popup_options_string = this.getPopupOptionsStringFromObject(popup_options || Configuration.get('pinterest.popupOptions'))

			,	target_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent(image) + '&description=' + encodeURIComponent(description);
			
			window.open(target_url, _.uniqueId('window'), popup_options_string );
		}

		// @method shareInPinterestEventListener
		// calls shareInPinterest method passing the configuration options
	,	shareInPinterestEventListener: function (e)
		{
			e.preventDefault();
			
			var metaTagMappingOg = Configuration.get('metaTagMappingOg')
			,	url = metaTagMappingOg['og:url'](this)
			,	image = metaTagMappingOg['og:image'](this)
			,	title = metaTagMappingOg['og:title'](this);
			
			this.shareInPinterest(url, image, title);
		}

	,	mountToApp: function (application)
		{
			if (Configuration.get('pinterest.enableButton'))
			{
				var layout = application.getLayout();

				// This are mostly related to the dom, or to events, so we add them in the layout
				_.extend(layout, {
					shareInPinterest: this.shareInPinterest
				});
					
				// extend Layout and add event listeners
				_.extend(layout.events, {
					'click [data-action="share-in-pinterest"]': this.shareInPinterestEventListener
				});

				//@class SocialSharing.Pinterest.Plugin @extends Plugin
				SocialSharing.afterAppendView.install({
					name: 'pinterestPlugin'
				,	priority: 10
				,	execute: function (application) 
					{
						var layout = application.getLayout();
						
						layout.$el.find('[data-type="social-share-icons"]').append('<a href="#" class="social-sharing-flyout-content-social-pinterest" data-action="share-in-pinterest"><i class="social-sharing-flyout-content-social-pinterest-icon"></i> <span>Pinit</span></a>');
					}
				});
			}
		}
	};

	return pinterestPlugin;
});
