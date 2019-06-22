define('AddOnItems.Configuration', [
    'underscore',
    'SC.Configuration',
    'item_views_option_void.tpl',
    'transaction_line_views_selected_option.tpl'
], function AddOnItemsConfiguration(
    _,
    Configuration,
    itemViewsOptionVoidTpl,
    selectedOptionTpl
) {
    'use strict';

    var AddOnConfig = {

        addAddOnOptions: function addAddOnOptions(pItemOptions) {
            var itemOptions = pItemOptions || [];

            _.each(Configuration.voidTemplates, function eachVoidTemplate(voidOption) {
                itemOptions.push({
                    cartOptionId: voidOption.cartOptionId,
                    label: 'void',
                    url: voidOption.url,
                    templates: {
                        selector: itemViewsOptionVoidTpl,
                        selected: voidOption.selected || itemViewsOptionVoidTpl
                    }
                });
            });
            _.each(Configuration.addOnItemOptions, function eachItemOption(itemOption) {
                itemOptions.push({
                    cartOptionId: itemOption.cartOptionId,
                    label: itemOption.label,
                    url: itemOption.url,
                    urlParameterName: itemOption.urlParameterName,
                    templates: {
                        selector: itemOption.templates.selector,
                        selected: itemOption.templates.selected || selectedOptionTpl
                    },
                    index: itemOption.index || 10
                });
            });

            return itemOptions;
        }
    };

    _.extend(Configuration, AddOnConfig);

    return AddOnConfig;
});
