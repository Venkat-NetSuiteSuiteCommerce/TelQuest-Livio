/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ProductLine
define('ProductLine.Common.Image'
,	[
		'SC.Configuration'

	,	'underscore'
	,	'Utils'
	]
,	function (
		Configuration

	,	_
	,	Utils
	)
{
	'use strict';

	//@class ProductLine.Common.Image
	return {

		//@method filterImages Given the tree-like object returned by the Search API containing the item's images and a group of options,
		// filters the item images
		// @param {Object} item_images_detail
		// @param {Array<String>} image_option_filters
		// @return {Object} The same input parameters filtered based on the current selection of the line/product taking into account the image option filters
		filterImages: function filterImages (item_images_detail, image_option_filters)
		{
			var self = this
			,	images_container = item_images_detail
			,	selected_option_filter;

			_.each(image_option_filters, function (image_filter)
			{
				selected_option_filter = self.get('options').findWhere({cartOptionId: image_filter});

				//if the option/dimension has a value set
				if (selected_option_filter && selected_option_filter.get('value') && selected_option_filter.get('value').label)
				{
					var label = selected_option_filter.get('value').label.toLowerCase();

					_.each(images_container, function(value, key)
					{
						if (key.toLowerCase() === label)
						{
							images_container = value;
						}
					});
				}
			});

			return images_container;
		}

		//@method getThumbnail Gets the thumbnail for the model based on the current selection
		//@return {ImageContainer}
	,	getThumbnail: function getThumbnail ()
		{
			var item = this.get('item')
			,	item_images_detail = item.get('itemimages_detail') || {}
			,	image_filters = Configuration.get('productline.multiImageOption', [])
			,	images = []
			,	images_container = {};

			if (_.isEqual(item_images_detail, {}) && item.get('_matrixParent').get('internalid') && item.get('_matrixParent').get('itemimages_detail'))
			{
				item_images_detail = item.get('_matrixParent').get('itemimages_detail');
			}

			// If you generate a thumbnail position in the itemimages_detail it will be used
			if (item_images_detail.thumbnail)
			{
				images_container = this.filterImages(item_images_detail.thumbnail, image_filters);

				images = Utils.imageFlatten(images_container);

				return _.first(images) || item_images_detail.thumbnail;
			}
			else if (SC.ENVIRONMENT.siteType === 'STANDARD')
			{
				return item.getThumbnail();
			}
			else
			{
				item_images_detail = item_images_detail.media || item_images_detail;
				images_container = this.filterImages(item_images_detail, image_filters);
				images = Utils.imageFlatten(images_container);

				return images.length ?
					// If you using the advance images features it will grab the 1st one
					_.first(images) :
					// still nothing? image the not available
					{
						url: Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Configuration.get('imageNotAvailable'))
					,	altimagetext: item.get('_name')
					};
			}
		}
	};
});