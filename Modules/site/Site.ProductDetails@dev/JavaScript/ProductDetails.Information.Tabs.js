define('ProductDetails.Information.Tabs', [
    'ProductDetails.Information.View',
    'SC.Configuration',
    'jQuery',
    'Utils',
    'underscore'
], function ProductDetailsInformationTabs(
    ProductDetailsInformationView,
    Configuration,
    jQuery,
    Utils,
    _
) {
    'use strict';

    _.extend(ProductDetailsInformationView.prototype, {
        computeDetailsArea: function computeDetailsArea() {
            var self = this;
            var details = [];
            var label;
            _.each(Configuration.get('productDetailsInformation', []), function eachItemInformation(itemInformation) {
                var content = '';
                if (itemInformation.contentFromKey) {
                    content = self.model.get('item').get(itemInformation.contentFromKey);
                    if (itemInformation.contentFromKey.match(/custitem_awa_tab[0-9]content/g)) {
                        label = itemInformation.contentFromKey.replace('content', 'label');
                        if (self.model.get('item').get(label)) {
                            itemInformation.name = self.model.get('item').get(label);
                        }
                    }
                    if (self.model.get('item').get('custitem_awa_show_child_info') && self.model.getSelectedMatrixChilds().length === 1) {
                        content = self.model.getSelectedMatrixChilds()[0].get(itemInformation.contentFromKey) || content;
                    }
                }
                if (content && Utils.trim(content)) {
                    // @class ProductDetails.Information.DataContainer
                    details.push({
                        // @property {String} name
                        name: itemInformation.name,
                        // @property {String} content Any string and event valid HTML is allowed
                        content: content,
                        // @property {String} itemprop
                        itemprop: itemInformation.itemprop
                    });
                    // @class ProductDetails.Information.View
                }
            });
            return details;
        }
    });
});

