/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SocialSharing
define(
	'SocialSharing.Plugins.Pinterest.Hover'
,	[
		'SC.Configuration'
	,	'SocialSharing'
	,	'Backbone.View'

	,	'jQuery'
	,	'underscore'
	]
,	function(
		Configuration
	,	SocialSharing
	,	BackboneView

	,	jQuery
	,	_
	)
{
	'use strict';

	//@class SocialSharing.Pinterest.Hover @extends ApplicationModule
	var pinterestPluginHover = {

		// @method shareInPinterest
		// opens a new window to share the page in Pinterest
		// based on some configuration options
		shareInPinterest: function (url, image, description, popup_options)
		{
			var popup_options_string = this.getPopupOptionsStringFromObject(popup_options || Configuration.get('pinterest.popupOptions'))

			,	target_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent(image) + '&description=' + encodeURIComponent(description);

			window.open(target_url, _.uniqueId('window'), popup_options_string );
		}

		// @method shareInPinterestHoverEventListener
		// calls shareInPinterestHoverEventListener method passing the configuration options
	,	shareInPinterestHoverEventListener: function (e)
		{
			e.preventDefault();

			var image_size = Configuration.get('pinterest.imageSize')
			,	metaTagMappingOg = Configuration.get('metaTagMappingOg')
			,	url = metaTagMappingOg['og:url'](this)
			,	image = jQuery('a.bx-pager-link.active').find('img').attr('src') || jQuery('a.bx-pager-link').eq(0).find('img').attr('src') // selected image
			,	title = metaTagMappingOg['og:title'](this);

			if (!image)
			{
				image = jQuery('.product-details-image-gallery-detailed-image').find('img').attr('src');
			}

			image = this.getApplication().resizeImage(image.split('?')[0], image_size);

			this.shareInPinterest(url, image, title);
		}

	,	mountToApp: function (application)
		{
			if (Configuration.get('pinterest.enableHover'))
			{
				var layout = application.getLayout();

				// This are mostly related to the dom, or to events, so we add them in the layout
				_.extend(layout, {
					shareInPinterest: this.shareInPinterest
				});

				// extend Layout and add event listeners
				_.extend(layout.events, {
					'click [data-action="share-in-pinterest-hover"]': this.shareInPinterestHoverEventListener
				});

				//@class SocialSharing.Pinterest.Plugin @extends Plugin
				BackboneView.postRender.install({
					name: 'pinterestPluginHover'
				,	priority: 10
				,	execute: function ($el)
					{
						if (!$el.find('[data-action="share-in-pinterest-hover"]').length)
						{
							$el.find('[data-type="social-share-icons-hover"]').append('<a href="#" class="social-sharing-flyout-content-social-pinterest" data-action="share-in-pinterest-hover"><i class="social-sharing-flyout-content-social-pinterest-icon"></i> Pinit</a>');
						}
					}
				});
			}
		}
	};

	return pinterestPluginHover;
});
