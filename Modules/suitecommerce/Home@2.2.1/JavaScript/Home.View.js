/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Home
define(
	'Home.View'
,	[
		'SC.Configuration'
	,	'Utilities.ResizeImage'

	,	'home.tpl'

	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration

	,	resizeImage
	,	home_tpl

	,	Backbone
	,	jQuery
	,	_
	,	Utils
	)
{
	'use strict';

	//@module Home.View @extends Backbone.View
	return Backbone.View.extend({

		template: home_tpl

	,	title: _('Welcome to the store').translate()

	,	page_header: _('Welcome to the store').translate()

	,	attributes: {
			'id': 'home-page'
		,	'class': 'home-page'
		}

	,	events:
		{
			'click [data-action=slide-carousel]': 'carouselSlide'
		}

	,	initialize: function ()
		{
			var self = this;
			this.windowWidth = jQuery(window).width();
			this.on('afterViewRender', function()
			{
				_.initBxSlider(self.$('[data-slider]'), {
					nextText: '<a class="home-gallery-next-icon"></a>'
				,	prevText: '<a class="home-gallery-prev-icon"></a>'
				});
			});

			var windowResizeHandler = _.throttle(function ()
			{
				if (_.getDeviceType(this.windowWidth) === _.getDeviceType(jQuery(window).width()))
				{
					return;
				}
				this.showContent();

				_.resetViewportWidth();

				this.windowWidth = jQuery(window).width();

			}, 1000);

			this._windowResizeHandler = _.bind(windowResizeHandler, this);

			jQuery(window).on('resize', this._windowResizeHandler);
		}

	,	destroy: function()
		{
			Backbone.View.prototype.destroy.apply(this, arguments);
			jQuery(window).off('resize', this._windowResizeHandler);
		}

		// @method getContext @return Home.View.Context
	,	getContext: function()
		{
			var carouselImages = _.map(Configuration.get('home.carouselImages', []), function(url)
			{
				return Utils.getAbsoluteUrlOfNonManagedResources(url);
			});

			var bottomBannerImages = _.map(Configuration.get('home.bottomBannerImages', []), function(url)
			{
				return Utils.getAbsoluteUrlOfNonManagedResources(url);
			});

			return {
				// @class Home.View.Context
				// @property {String} imageResizeId
				imageHomeSize: Utils.getViewportWidth() < 768 ? 'homeslider' : 'main'
				// @property {String} imageHomeSizeBottom
			,	imageHomeSizeBottom: Utils.getViewportWidth() < 768 ? 'homecell' : 'main'
				// @property {Array} carouselImages
			,	carouselImages: carouselImages
				// @property {Array} bottomBannerImages
    		,	bottomBannerImages: bottomBannerImages
    			// @class Home.View
			};
		}

	});



});
