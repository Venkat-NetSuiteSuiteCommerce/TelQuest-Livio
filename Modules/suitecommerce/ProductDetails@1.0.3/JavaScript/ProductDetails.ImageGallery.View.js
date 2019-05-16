/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductDetails
define(
	'ProductDetails.ImageGallery.View'
,	[
		'Backbone.CompositeView'
	,	'Utilities.ResizeImage'
	,	'SocialSharing.Flyout.Hover.View'

	,	'product_details_image_gallery.tpl'

	,	'Backbone'
	,	'underscore'
	,	'Utils'

	,	'jquery.zoom'
	,	'jQuery.bxSlider'
	]
,	function (
		BackboneCompositeView
	,	resizeImage
	,	SocialSharingFlyoutHoverView

	,	product_details_image_gallery_tpl

	,	Backbone
	,	_
	,	Utils
	)
{
	'use strict';

	// @class ProductDetails.ImageGallery.View @extends Backbone.View
	return Backbone.View.extend(
	{
		template: product_details_image_gallery_tpl

	,	initialize: function initialize ()
		{
			Backbone.View.prototype.initialize.apply(this, arguments);
			BackboneCompositeView.add(this);

			var self = this;

			this.images = this.model.getImages();

			this.model.on('change', function ()
			{
				var model_images = this.model.getImages();
				if (!_.isEqual(this.images, model_images))
				{
					this.images = model_images;
					this.render();
				}
			}, this);

			this.on('afterViewRender', function ()
			{
				self.initSlider();
				self.initZoom();
			});
		}

		// @method destroy
		// @returns {Void}
	,	destroy: function destroy ()
		{
			this.model.off('change', this.render, this);
			this.off('afterViewRender');
			this._destroy();
		}

		// @method initSlider Initialize the bxSlider
		// @return {Void}
	,	initSlider: function initSlider ()
		{
			var self = this;

			if (self.images.length > 1)
			{
				self.$slider = Utils.initBxSlider(self.$('[data-slider]'), {
						buildPager: _.bind(self.buildSliderPager, self)
					,	startSlide: 0
					,	adaptiveHeight: true
					,	touchEnabled: true
					,	nextText: '<a class="product-details-image-gallery-next-icon" data-action="next-image"></a>'
					,	prevText: '<a class="product-details-image-gallery-prev-icon" data-action="prev-image"></a>'
					, 	controls: true
				});

				self.$('[data-action="next-image"]').off();
				self.$('[data-action="prev-image"]').off();

				self.$('[data-action="next-image"]').click(_.bind(self.nextImageEventHandler, self));
				self.$('[data-action="prev-image"]').click(_.bind(self.previousImageEventHandler, self));
			}
		}

		//@method previousImageEventHandler Handle the clicking over the previous button to show the previous main image. It does it by triggering a cancelable event.
		//@return {Void}
	,	previousImageEventHandler: function previousImageEventHandler ()
		{
			var self = this
			,	current_index = self.$slider.getCurrentSlide()
			,	next_index = current_index === 0 ? self.$slider.getSlideCount() - 1 : current_index - 1;

			//IMPORTANT This event is used to notify the ProductDetails.Component that the images have changed
			//@event {ProductDetails.ImageGallery.ChangeEvent} 'afterChangeImage
			self.model.cancelableTrigger('beforeChangeImage', {currentIndex: current_index, nextIndex: next_index})
				.then(function ()
					{
						self.$slider.goToPrevSlide();
						self.model.cancelableTrigger('afterChangeImage', next_index);
					});
		}

		//@method nextImageEventHandler Handle the clicking over the next button to show the next main image. It does it by triggering a cancelable event
		//@return {Void}
	,	nextImageEventHandler: function nextImageEventHandler ()
		{
			var self = this
			,	current_index = self.$slider.getCurrentSlide()
			,	next_index = current_index === (self.$slider.getSlideCount() - 1) ? 0 : current_index + 1;

			//IMPORTANT This event is used to notify the ProductDetails.Component that the images have changed
			//@event {ProductDetails.ImageGallery.ChangeEvent} beforeChangeImage
			self.model.cancelableTrigger('beforeChangeImage'
				//@class ProductDetails.ImageGallery.ChangeEvent Image change event information container
			,	{
					//@property {Number} currentIndex
					currentIndex: current_index
					//@property {Number} nextIndex
				,	nextIndex: next_index
				}
				// @class ProductDetails.ImageGallery.View
				)
				.then(function ()
					{
						self.$slider.goToNextSlide();
						self.model.cancelableTrigger('afterChangeImage', next_index);
					});
		}

		//@property {ChildViews} childViews
	,	childViews: {
			'SocialSharing.Flyout.Hover': function ()
			{
				return new SocialSharingFlyoutHoverView({});
			}
		}

		// @method initZoom
		// @return {Void}
	,	initZoom: function ()
		{
			if (!SC.ENVIRONMENT.isTouchEnabled)
			{
				var images = this.images
				,	self = this;

				this.$('[data-zoom]').each(function (slide_index)
				{
					self.$(this).zoom({
						url: resizeImage(images[slide_index].url, 'zoom')
					,	callback: function()
						{
							var $this = self.$(this);

							if ($this.width() <= $this.closest('[data-view="Product.ImageGallery"]').width())
							{
								$this.remove();
							}

							return this;
						}
					});
				});
			}
		}

		// @method buildSliderPager
		// @param {Number} slide_index
		// @return {String}
	,	buildSliderPager: function (slide_index)
		{
			var image = this.images[slide_index];
			return '<img src="' + resizeImage(image.url, 'tinythumb') + '" alt="' + image.altimagetext + '">';
		}

		//@method getContext
		//@returns {ProductDetails.ImageGallery.View.Context}
	,	getContext: function ()
		{
			// @class ProductDetails.ImageGallery.View.Context
			return {
				// @property {String} imageResizeId
				imageResizeId: Utils.getViewportWidth() < 768 ? 'thumbnail' : 'main'
				//@property {Array<ImageContainer>} images
			,	images: this.images || []
				//@property {ImageContainer} firstImage
			,	firstImage: this.images[0] || {}
				// @property {Boolean} showImages
			,	showImages: this.images.length > 0
				// @property {Boolean} showImageSlider
			,	showImageSlider: this.images.length > 1
			};
			// @class ProductDetails.ImageGallery.View
		}
	});

});