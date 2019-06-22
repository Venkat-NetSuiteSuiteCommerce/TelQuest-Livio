/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module SocialSharing
// Provides standalone social sharing icons
define(
	'SocialSharing'
,	[
		'SC.Configuration'
	,	'PluginContainer'
	,	'Facets.Browse.View'

	,	'jQuery'
	,	'underscore'
	,	'Utils'
	]
,	function(
		Configuration
	,	PluginContainer
	,	BrowseView

	,	jQuery
	,	_
	,	Utils
	)
{
	'use strict';

	// @class SocialSharing Responsible of showing social sharing widgets in a page. It consists on plugin
	// containers and each plugin takes care of implementing a particular social network. There are two plugin
	// containers one for hooking into afterAppendView and other for afterAppendToDom
	// @extends ApplicationModule
	var SocialSharing = {

		// @method getPopupOptionsStringFromObject
		// {translates: "this", to: ""} to translates=this,to=
		getPopupOptionsStringFromObject: function (popup_options)
		{
			var popup_options_string = '';

			_.each(popup_options, function (value, name)
			{
				popup_options_string += ','+ name +'='+ value;
			});

			// the substring is to get rid of the leading coma
			return popup_options_string.substring(1);
		}

		// @method setMetaTagsByConfiguration
	,	setMetaTagsByConfiguration: function (self, meta_tag_configuration)
		{
			_.each(meta_tag_configuration, function (fn, name)
			{
				var content = fn(self);

				jQuery('<meta />', {
					name: name
				,	content: content || ''
				}).appendTo(jQuery('head'));
			});
		}

		// @method setLinTagsByConfiguration
	,	setLinkTagsByConfiguration: function (self, link_tag_configuration)
		{
			_.each(link_tag_configuration, function (fn, rel)
			{
				var href = fn(self);

				if (href)
				{
					jQuery('<link />', {
						rel: rel
					,	href: href
					}).appendTo(jQuery('head'));
				}
			});
		}

		// @method clearMetaTagsByConfiguration
	,	clearMetaTagsByConfiguration: function (meta_tag_configuration)
		{
			var meta_tag;

			_.each(meta_tag_configuration, function (fn, name)
			{
				meta_tag = jQuery('meta[name="' + name + '"]');
				meta_tag && meta_tag.remove();
			});
		}

		// @method clearLinkTagsByConfiguration
	,	clearLinkTagsByConfiguration: function (self, link_tag_configuration)
		{
			var link_tag;

			_.each(link_tag_configuration, function (fn, rel)
			{
				if (fn(self))
				{
					link_tag = jQuery('link[rel="' + rel + '"]');
					link_tag && link_tag.remove();
				}
			});
		}

		// @method setMetaTags Based on the meta tags config
	,	setMetaTags: function ()
		{
			var self = this
			,	application = this.getApplication()
			,	current_view = application.getLayout().currentView
			,	meta_tag_mapping_og = Configuration.metaTagMappingOg
			,	meta_tag_mapping_twitter_product_card = Configuration.metaTagMappingTwitterProductCard
			,	meta_tag_mapping_twitter_gallery_card = Configuration.metaTagMappingTwitterGalleryCard
			,	link_tag_google_plus_authorship = Configuration.linkTagGooglePlusAuthorship;

			// Clear meta tags if required
			this.clearMetaTagsByConfiguration(meta_tag_mapping_og);
			this.clearMetaTagsByConfiguration(meta_tag_mapping_twitter_product_card);
			this.clearMetaTagsByConfiguration(meta_tag_mapping_twitter_gallery_card);

			if (current_view instanceof BrowseView)
			{
				// Set meta tags for BrowseView
				this.setMetaTagsByConfiguration(self, meta_tag_mapping_twitter_gallery_card);
			}

			// In all pages clear/set Google Plus authorship
			this.clearLinkTagsByConfiguration(self, link_tag_google_plus_authorship);
			this.setLinkTagsByConfiguration(self, link_tag_google_plus_authorship);
		}

		// @property {PluginContainer} afterAppendView
	,	afterAppendView: new PluginContainer()

		// @property {PluginContainer} afterAppendToDom
	,	afterAppendToDom: new PluginContainer()

	,	mountToApp: function (application)
		{
			var self = this
			,	layout = application.getLayout();

			_.extend(layout, {
				getPopupOptionsStringFromObject: this.getPopupOptionsStringFromObject
			,	setMetaTags: this.setMetaTags
			,	clearLinkTagsByConfiguration: this.clearLinkTagsByConfiguration
			,	clearMetaTagsByConfiguration: this.clearMetaTagsByConfiguration
			,	setLinkTagsByConfiguration: this.setLinkTagsByConfiguration
			,	setMetaTagsByConfiguration: this.setMetaTagsByConfiguration
			});

			layout.on('afterAppendView', function ()
			{
				this.$el.find('[data-type="social-share-icons"]').empty();

				this.setMetaTags();

				if (!Utils.isPageGenerator())
				{
					self.afterAppendView.executeAll(application);
				}
			});

			layout.on('afterAppendToDom', function ()
			{
				if (!Utils.isPageGenerator())
				{
					self.afterAppendToDom.executeAll(application);
				}
			});
		}
	};

	return SocialSharing;
});
