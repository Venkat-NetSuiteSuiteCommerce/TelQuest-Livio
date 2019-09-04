define('CategoriesLeftNavigation.View', [
    'SC.Configuration',
    'Backbone',
    'categories_leftnavigation.tpl',
    'underscore'
], function CategoriesLeftNavigationView(
    Configuration,
    Backbone,
    categoriesLeftnavigationTpl,
    _
) {
    'use strict';

    return Backbone.View.extend({
        template: categoriesLeftnavigationTpl,
        initialize: function initialize(options) {
            var levelCategories = [];
            var self = this;
            var categoryPath;
            this.actualCategory = options.category;
            // We use the SC.CATEGORIES to get the internal ids for search.
            // Also we need to clone the object to avoid modify the original
            this.categories = JSON.parse(JSON.stringify(SC.CATEGORIES));

            if (!this.actualCategory) {
                return;
            }

            categoryPath = _.compact(this.actualCategory.idpath.split('|'));
            _.each(categoryPath, function eachCategoryPath(path, index) {
                var categories;

                if (index === 0) {
                    categories = self.categories;
                } else {
                    categories = levelCategories[index - 1].categories;
                }

                levelCategories.push(self.setOpenCategory(categories, path));
            });
        },

        setOpenCategory: function setOpenCategory(categories, id) {
            var levelCategory = _.findWhere(categories, { internalid: id });

            if (levelCategory) {
                levelCategory.isOpen = true;
            }

            return levelCategory;
        },

        getContext: function getContext() {
            return {
                categories: this.categories
            };
        }
    });
});
