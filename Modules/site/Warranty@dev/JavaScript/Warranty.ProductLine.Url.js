define('Warranty.ProductLine.Url', [
    'ProductLine.Common.Url',
    'underscore',
    'SC.Configuration'
], function WarrantyProductLineUrl(
    ProductLineCommonUrl,
    _,
    Configuration
) {
    'use strict';

    _.extend(ProductLineCommonUrl, {
        getFullLink: _.wrap(ProductLineCommonUrl.getFullLink, function getFullLink(fn) {
            var args = _.toArray(arguments).slice(1);
            var parametersToOverride = args && args.length ? args[0] : {};
            _.each(Configuration.get('warranty.fields'), function eachWarrantyField(warrantyField) {
                parametersToOverride[warrantyField.fieldId.replace('custitem', 'custcol')] = null;
            });
            parametersToOverride[Configuration.get('warranty.itemOptionAssociation')] = null;
            return fn.apply(this, args);
        })
    });
});
