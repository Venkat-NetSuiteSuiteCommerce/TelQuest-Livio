define('UpsellItems.View', [
    'Backbone',
    'UpsellItems.Collection',
    'upsell_items_upsell_option.tpl',
    'SC.Configuration'
], function UpsellItemsView(
    Backbone,
    UpsellItemsCollection,
    upsellItemsUpsellOptionTpl,
    Configuration
) {
    'use strict';

    return Backbone.View.extend({

        template: upsellItemsUpsellOptionTpl,

        initialize: function initialize() {
            var self = this;
            this.item = this.options.item;
            this.upsellItems = new UpsellItemsCollection({ itemsIds: this.model.get('items') });
            if (this.model.get('items') && this.model.get('items').length) {
                this.upsellItems.fetchItems().done(function doneFetchItems() {
                    self.item.upsells = self.item.upsells || {};
                    self.item.upsells[self.model.get('upsellId')] = self.upsellItems;
                    self.render();
                    self.options.parentView.renderChild('Product.Price');
                });
            }

        },

        events: {
            'click li[data-action="select-upsell"]': 'selectUpsellItem'
        },

        selectUpsellItem: function selectUpsellItem(e) {
            var target = this.$(e.currentTarget);
            var selectedUpsell = target.data('value');
            var upsellOption;
            var selectedUpsells;
            e.preventDefault();
            e.stopPropagation();
            upsellOption = this.item.getOption(Configuration.get('upsell.selectedOption'));
            selectedUpsells = (upsellOption && upsellOption.get('value') && JSON.parse(upsellOption.get('value').internalid || '{}')) || {};
            if (selectedUpsells) {
                if (selectedUpsell) {
                    selectedUpsells[this.model.get('upsellId')] = selectedUpsell.toString();
                } else if (selectedUpsells[this.model.get('upsellId')]) {
                    delete selectedUpsells[this.model.get('upsellId')];
                }

                this.item.setOption(Configuration.get('upsell.selectedOption'), JSON.stringify(selectedUpsells));
            }
        },

        getContext: function getContext() {
            var upsellOption = this.item.getOption(Configuration.get('upsell.selectedOption'));
            var selectedUpsells = (upsellOption && upsellOption.get('value') && upsellOption.get('value').internalid &&
                JSON.parse(upsellOption.get('value').internalid || '{}')) || {};
            var selectedUpsell = selectedUpsells && selectedUpsells[this.model.get('upsellId')];
            var selectedLabel;
            var opt;
            var upsellItems = [];

            if (this.upsellItems) {
                this.upsellItems.each(function eachCollection(upsellItem) {
                    opt = {
                        name: upsellItem.get('_name'),
                        price: upsellItem.get('_upsellPrice'),
                        upsellImage: upsellItem.get('_upsellImage'),
                        id: upsellItem.get('internalid'),
                        active: selectedUpsell && parseInt(selectedUpsell, 10) === upsellItem.get('internalid'),
                        basePrice: upsellItem.getPrice().price_formatted,
                        showCompare: upsellItem.getPrice().price > upsellItem.get('_upsellRate')
                    };
                    upsellItems.push(opt);
                    if (opt.active) {
                        selectedLabel = opt;
                    }
                });
            }
            return {
                label: this.model.get('name'),
                upsellId: this.model.get('upsellId'),
                hasItems: upsellItems.length > 0,
                items: upsellItems,
                emptyLabel: this.model.get('emptyField') || '--None--',
                showSelectedUpsell: !!selectedUpsell,
                selectedUpsell: selectedLabel || {}
            };
        }
    });
});
