define('UpsellItems.ProductLine.Url', [
    'ProductLine.Common.Url',
    'underscore',
    'SC.Configuration'
], function UpsellItemsProductLineUrl(
    ProductLineCommonUrl,
    _,
    Configuration
) {
    'use strict';

    _.extend(ProductLineCommonUrl, {
        getFullLink: _.wrap(ProductLineCommonUrl.getFullLink, function getFullLink(fn) {
            var args = _.toArray(arguments).slice(1);
            var parametersToOverride = args && args.length ? args[0] : {};
            parametersToOverride[Configuration.get('upsell.itemOption')] = null;
            parametersToOverride[Configuration.get('upsell.selectedOption')] = null;
            return fn.apply(this, args);
        })
    });
});
