define('Facets.Browse.View.Tags', [
    'SC.Configuration',
    'FakeLogin.Utils',
    'Facets.Browse.View',
    'underscore'
], function FacetTags(
    Configuration,
    Utils,
    FacetsBrowseViewExtension,
    _
) {
    'use strict';

    function textCutter(text, n) {
        var short = text.substr(0, n);
        if (/^\S/.test(text.substr(n))) {
            return short.replace(/\s+\S*$/, '');
        }
        return short;
    }

    /* eslint-disable */
    //@class Facets.Browse.View.Extension @extends Facets.Browse.View
    _.extend(FacetsBrowseViewExtension.prototype, {
        events: _.extend(FacetsBrowseViewExtension.prototype.events || {}, {
            'click [data-target="fakeLogin"]': 'fakeLogin'
        }),

        fakeLogin: function fakeLogin(e) {
            e.preventDefault();
            e.stopPropagation();
            Utils.addFakeLogin();
        },

        getTitle: function () {

            var facets = this.options.translator.facets;
            var category = this.model.get('category');
            var title = category ? category.get('pagetitle') || _.pluck(this.getBreadcrumbPages(), 'text').join(' > ') : '';

            if (facets && facets.length) {
                title = title ? title + ' - ' : '';

                var buffer = []
                    , facet = null;

                for (var i = 0; i < facets.length; i++) {
                    facet = facets[i];
                    buffer.push(this.formatFacetTitle(facet));
                }

                title = title + this.application.getConfig('searchTitlePrefix', '') +
                    buffer.join(facet.config.titleSeparator || ', ') +
                    this.application.getConfig('searchTitleSuffix', '');
            }
            else if (this.translator.getOptionValue('keywords')) {
                title = _('Search results for "$(0)"').translate(
                    this.translator.getOptionValue('keywords')
                );
            }
            else {
                title = title || this.application.getConfig('defaultSearchTitle', '');
            }
            if (title.indexOf(Configuration.get('defaultSiteSearchName')) < 0) {
                title = Configuration.get('defaultSiteSearchName') ?
                    Configuration.get('defaultSiteSearchName') + ' ' + title : title;
            }
            this.setMetaTwitterTitle(title);

            return title;
        },
        /* eslint-enable */


        formatFacetTitle: _.wrap(FacetsBrowseViewExtension.prototype.formatFacetTitle, function wrap(fn) {
            return _.unescape(fn.apply(this, _.toArray(arguments).slice(1)));
        }),

        /* eslint-disable */
        getMetaDescription: function () {
            var useFacet = false;
            var category = this.model.get('category');
            var metaDescription = category && category.get('metadescription') || this.metaDescription || '';
            if (!metaDescription && category) {
                metaDescription = category.get('name')
            }
            var applied_facets = this.translator.cloneWithoutFacetId('category').facets;
            var narrowedBy = " Narrowed by: ";
            for (var i = 0; i < applied_facets.length; i++) {
                useFacet = true;
                var facet = applied_facets[i];

                if (i > 0) {
                    narrowedBy = narrowedBy + ", ";
                }
                narrowedBy = narrowedBy + facet.config.name + ": " + this.translator.getLabelForValue(facet.id, facet.value)
            }
            if (metaDescription === '') {
                metaDescription = this.getTitle();
            } else {
                metaDescription = Configuration.get('defaultSiteSearchName') ? Configuration.get('defaultSiteSearchName') + ' ' + metaDescription : metaDescription;
            }
            var finalText = textCutter(useFacet ? ((metaDescription + narrowedBy).trim()) : metaDescription, 156);

            return finalText;
        },
        /* eslint-enable */

        getContext: _.wrap(FacetsBrowseViewExtension.prototype.getContext, function getContext(fn) {
            var context = fn.apply(this, _.toArray(arguments).slice(1));
            var isBrand = false;

            try{
                isBrand = this.model.get('category').get('name') === 'Brands'
            }catch (e) {}

            _.extend(context, {
                isLoggedIn: Utils.isLoggedIn(),
                showCategoryBrand: isBrand
            });
            return context;
        })
    });
});
