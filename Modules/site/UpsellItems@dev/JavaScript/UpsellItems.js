define('UpsellItems', [
    'SC.Configuration',
    'underscore',
    'transaction_line_views_selected_upsell_option.tpl',
    'UpsellItems.ProductDetails.Full.View',
    'AddOnItems.Configuration',
    'UpsellItems.Transaction.Line.Views.Option.View',
    'UpsellItems.LiveOrder.Line.Model',
    'UpsellItems.ProductLine.Url',
    'UpsellItems.ProductDetails.QuickView.View',
    'UpsellItems.Product.Price',
    'UpsellItems.ProductDetails.OptionBingings'
], function UpsellItems(
    Configuration,
    _,
    transactionLineViewsSelectedUpsellOptionTpl
) {
    if (!Configuration.itemKeyMapping) {
        Configuration.itemKeyMapping = {};
    }

    _(Configuration.itemKeyMapping).extend({
        _upsellItems: function _upsellItems(item) {
            var upsellItemsField = Configuration.get('upsell.itemField');
            return JSON.parse(item.get(upsellItemsField) || '{}');
        },

        _upsellPrice: function _upsellPrice(item) {
            var upsellPricelevel = Configuration.get('upsell.pricelevel');
            return item.get(upsellPricelevel + '_formatted');
        },
        _upsellImage: function _upsellPrice(item) {
            var imageKeys = _.keys(item.get('itemimages_detail')) || '';
            var ret = imageKeys.length > 0 ? item.get('itemimages_detail')[imageKeys] : '';
            ret = (ret && ret.urls) ? _.first(ret.urls) : ret;
            return ret;
        },
        _upsellRate: function _upsellRate(item) {
            var upsellPricelevel = Configuration.get('upsell.pricelevel');
            return item.get(upsellPricelevel);
        }
    });

    Configuration.addOnOptions = Configuration.addOnOptions || [];

    Configuration.voidTemplates = [];
    Configuration.voidTemplates.push({
        cartOptionId: Configuration.get('upsell.itemOption'),
        url: 'upsell'
    });

    Configuration.addOnOptions.push(Configuration.get('upsell.itemOption'));

    Configuration.voidTemplates.push({
        cartOptionId: Configuration.get('upsell.selectedOption'),
        url: 'selectedUpsells',
        selected: transactionLineViewsSelectedUpsellOptionTpl
    });

    Configuration.addOnOptions.push(Configuration.get('upsell.selectedOption'));

    Configuration.ItemOptions.optionsConfiguration = Configuration.addAddOnOptions(Configuration.get('ItemOptions.optionsConfiguration', []));
});
