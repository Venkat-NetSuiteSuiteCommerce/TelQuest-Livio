// Entry point for javascript creates a router to handle new routes and adds a view inside the Product Details Page
define('AwaLabs.CategoriesLeftNavigation', [
    'CategoriesLeftNavigation.View',
    'Facets.Browse.View'
], function AwaLabsCategoriesLeftNavigation(
    CategoriesLeftNavigationView,
    FacetsBrowseView
) {
    'use strict';

    FacetsBrowseView.prototype.childViews['Facets.CategorySidebar'] =  function categoriesLeftNavigation() {
        return new CategoriesLeftNavigationView({
            category: this.model.get('category').attributes
        });
    };
});
