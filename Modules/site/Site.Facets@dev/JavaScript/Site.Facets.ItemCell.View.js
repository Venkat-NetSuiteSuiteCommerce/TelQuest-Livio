define('Site.Facets.ItemCell.View', [
    'Facets.ItemCell.View',
    'GlobalViews.StarRating.View',
    'Utils',
    'underscore'
], function SiteFacets(
    FacetsItemCell,
    GlobalViewsStarRating,
    Utils,
    _
) {
    'use strict';

    FacetsItemCell.prototype.childViews['GlobalViews.StarRating'] = function generateNewChildView() {
        var ratingCount = this.model.get('_ratingsCount') || 0;
        var view;

        if (ratingCount >= 0) {
            view = new GlobalViewsStarRating({
                model: this.model,
                showRatingCount: false,
                queryOptions: Utils.parseUrlOptions(location.href)
            });

            return this.options.showStarRating === false ? null : view;
        }
        return false;
    };
});
