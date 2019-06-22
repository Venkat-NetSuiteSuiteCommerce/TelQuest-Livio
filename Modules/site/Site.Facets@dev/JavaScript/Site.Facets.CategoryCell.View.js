define('Site.Facets.CategoryCell.View', [
    'Facets.CategoryCell.View',
    'underscore',
    'Handlebars'
],
function SiteFacetsCategoryCellView(
    FacetsCategoryCellView,
    _,
    Handlebars
) {
    'use strict';
    Handlebars.registerHelper('unescapeHTML', function unescapeHTML(text) {
        return new Handlebars.SafeString(_.unescape(text));
    });
    _.extend(FacetsCategoryCellView.prototype, {
        getContext: _.wrap(FacetsCategoryCellView.prototype.getContext, function(fn) {
            var originalRet = fn.apply(this, _.toArray(arguments).slice(1));

            originalRet.customDescription = this.model.get('custrecord_description_for_brands') || this.model.get('name')
            return originalRet;
        })
    });
});
