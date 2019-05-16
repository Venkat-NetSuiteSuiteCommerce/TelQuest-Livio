define('Site.GlobalViews.RatingByStar.View', [
    'GlobalViews.RatingByStar.View',
    'underscore'
], function SiteGlobalViewsRatingByStarView(
    GlobalViewsRatingStarView,
    _
) {
    'use strict';

    GlobalViewsRatingStarView.prototype.getContext = _.wrap(GlobalViewsRatingStarView.prototype.getContext, function wrap(fn) {
        var originalRet = fn.apply(this, _.toArray(arguments));
        if (originalRet.rates) {
            _.each(originalRet.rates, function eachRate(rate) {
                rate.showLink = SC.ENVIRONMENT.jsEnvironment === 'browser' ? rate.showLink : false;
            });
        }
        return originalRet;
    });
});
