define('Site.ProductDetails', [
    'Site.ProductDetails.SeoImprovements',
    'ProductDetails.Base.View.Tags',
    'ProductDetails.Information.Tabs'
], function SiteProductDetails(
    SeoImprovements
) {
        'use strict';

        return {
            mountToApp: function mountToApp(application) {
                SeoImprovements.install(application);
            }
        };
    });
