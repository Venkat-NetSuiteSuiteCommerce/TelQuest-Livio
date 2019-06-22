define('Site.ProductReviews.Center.View', [
    'ProductReviews.Center.View',
    'Backbone',
    'underscore'
], function ProductReviewsCenterView(
    ProductReviewsCenter,
    Backbone,
    _
) {
    'use strict';

    ProductReviewsCenter.prototype.getContext = _.wrap(ProductReviewsCenter.prototype.getContext, function wrap(fn) {
        var originalRet = fn.apply(this, _.toArray(arguments));
        originalRet.showNewReviewLink = SC.ENVIRONMENT.jsEnvironment === 'browser';
        return originalRet;
    });
});

