define('FakeMatrix.Product.Model', [
    'Product.Model',
    'underscore'
], function FakeMatrixProductModel(
    ProductModel,
    _
) {
        _.extend(ProductModel.prototype, {
            getImages: _.wrap(ProductModel.prototype.getImages, function getImagesFn(fn) {
                var images = fn.apply(this, _.toArray(arguments).slice(1));
                var selectedChilds = this.getSelectedMatrixChilds();
                var item = this.get('item');
                var itemVideo = item.get('custitem_youtube_id') || '';
                var childImages = [];
                if (selectedChilds && selectedChilds.length > 0) {
                    _.each(selectedChilds, function eachChildImage(selectedChild) {
                        if (!_.isEmpty(selectedChild.get('itemimages_detail'))) {
                            childImages = _.union(childImages, selectedChild.getImages());
                        }
                    });
                }
                if (childImages.length) {
                    images = childImages;
                }
                if (images.length === 1 && images[0].url.indexOf('no_image_available') > -1 && itemVideo) {
                    // I want to show by default the video thumb instead of the no image.
                    images = [{
                        youtubeId: itemVideo,
                        altimagetext: item.get('_name'),
                        url: 'http://img.youtube.com/vi/' + itemVideo + '/0.jpg'
                    }];
                }
                else if (itemVideo) {
                    // If product has images and videos, then push it to the array
                    images.push({
                        youtubeId: itemVideo,
                        altimagetext: item.get('_name'),
                        url: 'http://img.youtube.com/vi/' + itemVideo + '/0.jpg'
                    });
                }
                return images;
            })
        });
    });
