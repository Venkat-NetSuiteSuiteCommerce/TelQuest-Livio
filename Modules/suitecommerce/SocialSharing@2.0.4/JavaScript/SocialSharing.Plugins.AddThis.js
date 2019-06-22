/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global addthis:true */

// @module SocialSharing
define(
	'SocialSharing.Plugins.AddThis'
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

	// @class SocialSharing.AddThis @extends ApplicationModule
	var addthisPlugin = {

		// @method refreshAddThisElements
		// re-writes the DOM of the AddThis elements
		refreshAddThisElements: function()
		{
			if (typeof addthis === 'undefined' || !jQuery('[data-type="share-in-add-this"]').size())
			{
				return;
			}

			var metaTagMappingOg = Configuration.get('metaTagMappingOg')
			,	innerHTML = '';

			_.each(Configuration.get('addThis.servicesToShow'), function (name, code)
			{
				innerHTML += '<a class="addthis_button_' + code + '">' + name + '</a>';
			});
			
			var share_options = {
				url: metaTagMappingOg['og:url'](this)
			,	title: metaTagMappingOg['og:title'](this)
			,	description: metaTagMappingOg['og:description'](this)
			};
			
			jQuery('[data-type="share-in-add-this"]').each(function ()
			{
				if (this)
				{
					var $this = jQuery(this);
					$this.html(innerHTML).addClass(Configuration.get('addThis.toolboxClass'));
					addthis.toolbox(this, Configuration.get('addThis.options'), share_options);
				}
			});
		}

	,	mountToApp: function (application)
		{
			if (Configuration.get('addThis.enable'))
			{
				var layout = application.getLayout();

				// This are mostly related to the dom, or to events, so we add them in the layout
				_.extend(layout, {
					refreshAddThisElements: this.refreshAddThisElements
				,	addthis_script_loaded: false
				});

				// @class SocialSharing.AddThis.Plugin @extends ApplicationModule
				var plugin = {
					name: 'addthisPlugin'
				,	priority: 10
				,	execute: function (application) 
					{
						var layout = application.getLayout();
						
						if (!jQuery('[data-type="share-in-add-this"]').size())
						{
							layout.$el.find('[data-type="social-share-icons"]').append('<div href="#" class="add-this-btn" data-type="share-in-add-this"></div>');
						}

						if (jQuery('[data-type="share-in-add-this"]').size())
						{
							if (!layout.addthis_script_loaded)
							{
								layout.addthis_script_loaded = true;
								var addthis_script_url = ('https:' === document.location.protocol ? 'https://' : 'http://') + 's7.addthis.com/js/300/addthis_widget.js#domready=1';
								// avoid on SEO and start addthis library
								(SC.ENVIRONMENT.jsEnvironment === 'browser') && jQuery.getScript(addthis_script_url, function ()
								{
									layout.refreshAddThisElements();
								});
							}
							else
							{
								// Then addthis plugins are called
								layout.refreshAddThisElements();			
							}
						}
					}
				};

				SocialSharing.afterAppendView.install(plugin);

				SocialSharing.afterAppendToDom.install(plugin);
			}
		}
	};

	return addthisPlugin;
});
