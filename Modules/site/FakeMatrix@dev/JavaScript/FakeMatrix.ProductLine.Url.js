define('FakeMatrix.ProductLine.Url', [
    'ProductLine.Common.Url',
    'underscore',
    'Utils',
    'PluginContainer',
    'SC.Configuration'
], function ProductLineFakeMatrixUrl(
    ProductLineCommonUrl,
    _,
    Utils,
    PluginContainer,
    Configuration
) {
    'use strict';

    _.extend(ProductLineCommonUrl, {
        getFullLink: function getFullLink(parametersToOverride) {
            var url;
            var linkAttributes;
            _.extend(parametersToOverride, this.get('item').get('_getChildSelectedOptions'));
            url = this.generateURL(parametersToOverride);
            linkAttributes = {
                href: url
            };
            if (SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED') {
                _.extend(linkAttributes, {
                    data: {
                        touchpoint: 'home',
                        hashtag: Configuration.get('currentTouchpoint') !== 'home' ? encodeURIComponent(url) : url
                    }
                });
            }
            return Utils.objectToAtrributes(linkAttributes);
        }
    });
});
