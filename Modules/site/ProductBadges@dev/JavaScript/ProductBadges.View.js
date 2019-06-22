define('ProductBadges.View', [
    'Backbone',
    'product_badges.tpl',
    'SC.Configuration',
    'underscore'
], function ProductBadgesView(
    Backbone,
    productBadgesTpl,
    Configuration,
    _
) {
    'use strict';

    return Backbone.View.extend({
        template: productBadgesTpl,
        initialize: function initalize(options) {
            this.model = options.model;
        },
        getBadges: function getBadges() {
            var badges = [];
            var badgeConfig = Configuration.get('productBadges.badgesConfiguration');
            var appliedBadges = this.model.get('custitem_applied_badges') || '';
            appliedBadges = appliedBadges.split(', ');
            if (appliedBadges) {
                _.each(appliedBadges, function eachBadge(currentBadge) {
                    var productBadge = _.find(badgeConfig, { badge: currentBadge, active: true });
                    if (productBadge) {
                        badges.push(productBadge);
                    }
                });
            }
            return badges;
        },
        getContext: function getContext() {
            return {
                badges: this.getBadges()
            };
        }
    });
});
