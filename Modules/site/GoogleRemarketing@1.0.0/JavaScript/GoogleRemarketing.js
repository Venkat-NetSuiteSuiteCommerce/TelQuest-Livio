/* Google Remarketing Module for SCA created by AwaLabs */
define("GoogleRemarketing",
    ['jQuery', 'Backbone', 'SC.Configuration','underscore', 'Tracker'],
    function GoogleRemarketing(jQuery, Backbone, Configuration, _, Tracker) {

        var GoogleRemarketing = {
            trackHome: function trackHome() {
                var data = {
                    ecomm_pagetype: "home"
                };
                this.activateRemarketingTag(data);
            },
            trackCart: function trackCart(order) {
                var productsIds = [],
                    productsPrice = [],
                    lines = order.get("lines").models;


                _.each(lines, function (item) {
                    try {
                        productsIds.push(item.get("item").get("internalid"));
                        productsPrice.push(item.get("item").getPrice().price.toFixed(2));
                    }catch (e) {}
                });

                var data = {
                    ecomm_pagetype: "cart",
                    ecomm_prodid: productsIds.join(','),
                    ecomm_pvalue: productsPrice.join(","),
                    ecomm_totalvalue: order.get('summary').total
                };

                this.activateRemarketingTag(data);
            },
            trackProduct: function trackProduct(model) {
                var item = model.get('item');
                var data = {};
                try{
                   data = {
                        ecomm_pagetype: "product",
                        ecomm_prodid: item.get("_sku"),
                        ecomm_pname: item.get("_name"),
                        ecomm_totalvalue: item.getPrice().price.toFixed(2)
                    };
                } catch (e) { }

                this.activateRemarketingTag(data);
            },
            trackCategory: function trackCategory() {
                var isSearch = _.parseUrlOptions(Backbone.history.fragment).keywords || "";
                var data = {
                    ecomm_pagetype: isSearch ? "searchresults" : "category",
                    ecomm_pcat: isSearch ? '' : Backbone.history.fragment.replaceAll('category/', '')

                };
                this.activateRemarketingTag(data);
            },
            trackOther: function trackOther() {
                var data = {
                    ecomm_pagetype: "other"
                };
                this.activateRemarketingTag(data);
            },
            trackTransaction: function trackTransaction(order) {

                var self = this,
                    productsIds = [],
                    productsPrice = [];

                order.get('products').each(function (product) {
                    productsIds.push(product.get("sku"));
                    productsPrice.push(product.get('rate'));
                });


                var data = {
                    ecomm_pagetype: "purchase",
                    ecomm_prodid: productsIds.join(','),
                    ecomm_pvalue: productsPrice.join(","),
                    ecomm_totalvalue: order.get('total')
                };

                _.delay(function () {
                    self.activateRemarketingTag(data);

                }, 300);

            },
            activateRemarketingTag: function activateRemarketingTag(data) {

                data = jQuery.param(data).replaceAll('&', ';').replaceAll('[]', '') + ';';

                var imageUrl = "//googleads.g.doubleclick.net/pagead/viewthroughconversion/" + window.google_conversion_id + "/?value=0&label=" + window.google_conversion_label + "&guid=ON&script=0&data=" + data;
                var img = document.createElement("img");
                img.onload = function () {
                    return null;
                };
                img.src = imageUrl;
            },
            mountToApp: function mountToApp(application) {
                if (SC.ENVIRONMENT.jsEnvironment === 'browser') {
                    window.google_conversion_id = Configuration.get('googleremarketing.conversionId');
                    window.google_custom_params = window.google_tag_params;
                    window.google_remarketing_only = true;
                    window.google_conversion_label = Configuration.get('googleremarketing.conversionLabel');

                    var self = this,
                        layout = application.getLayout();

                    Tracker.getInstance().trackers.push(GoogleRemarketing);

                    layout.on("afterAppendView", function afterAppendView(view) {

                        var tmpl = view.template.Name;

                        switch (tmpl) {
                            case "home":
                                self.trackHome();
                                break;
                            case "product_details_full":
                                self.trackProduct(view.model);
                                break;
                            case "category_browse":
                            case "facets_facet_browse":
                                self.trackCategory();
                                break;
                            case "cart_detailed":
                                self.trackCart(view.model);
                                break;
                            default:
                                self.trackOther();
                                break;
                        }
                    });
                }

            }
        };

        return GoogleRemarketing;
    });

//AUX Function
String.prototype.replaceAll = function replaceAll(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof(str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
};
