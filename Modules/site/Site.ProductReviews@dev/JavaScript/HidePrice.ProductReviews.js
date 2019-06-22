define('HidePrice.ProductReviews', [
    'Facets.ItemCell.View',
    'ProductReviews.Form.View',
    'ProductReviews.FormConfirmation.View',
    'ProductReviews.FormPreview.View',
    'underscore'
], function HidePriceProductReviews(
    FacetsItemCellView,
    ProductReviewsFormView,
    ProductReviewsFormConfirmation,
    ProductReviewsFormPreview,
    _
) {
    'use strict';

    _.extend(ProductReviewsFormView.prototype.childViews, {
        'Facets.ItemCell': function FacetsItemCell() {
            return new FacetsItemCellView(
                {
                    hidePrice: true,
                    model: this.product.get('item'),
                    itemIsNavigable: false,
                    showStarRating: false
                });
        }
    });
    _.extend(ProductReviewsFormConfirmation.prototype.childViews, {
        'Facets.ItemCell': function FacetsItemCell() {
            return new FacetsItemCellView({
                hidePrice: true,
                model: this.product,
                itemIsNavigable: false
            });
        }
    });
    _.extend(ProductReviewsFormPreview.prototype.childViews, {
        'Facets.ItemCell': function FacetsItemCell() {
            return new FacetsItemCellView({
                hidePrice: true,
                model: this.product,
                itemIsNavigable: false
            });
        }
    });
});
