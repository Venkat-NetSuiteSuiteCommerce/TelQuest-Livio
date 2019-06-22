define('FakeMatrix.ProductDetails.Router', [
    'ProductDetails.Router',
    'Product.Model',
    'ProductDetails.Full.View',
    'ProductDetails.QuickView.View',

    'Backbone',
    'AjaxRequestsKiller',
    'Utils',
    'underscore'
], function FakeMatrixProductDetailsRouter(
    ProductDetailsRouter,
    ProductModel,
    ProductDetailsFullView,
    ProductDetailsQuickView,

    Backbone,
    AjaxRequestsKiller,
    Utils,
    _
) {
    _.extend(ProductDetailsRouter.prototype, {
        productDetails: function productDetails(apiQuery, baseUrl, options) {
            var application = this.application;
            var product = new ProductModel();
            var ViewConstructor = this.getView();
            var item = product.get('item');
            var view;

            item.fetch({
                data: apiQuery,
                killerId: AjaxRequestsKiller.getKillerId(),
                pageGeneratorPreload: true
            }).then(
                // Success function
                function fetchItem(data, result, jqXhr) {
                    if (!item.get('custitem_display_sca')) {
                        return application.getLayout().notFound();
                    }
                    if (item.get('_isChild')) {
                        Backbone.history.navigate(item.get('_getParentUrl'), { trigger: true, replace: true });
                    } else if (!item.isNew()) {
                        // once the item is fully loaded we set its options
                        product.setOptionsFromURL(options);

                        product.set('source', options && options.source);

                        product.set('internalid', options && options.internalid);

                        if (apiQuery.id && item.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server') {
                            nsglobal.statusCode = 301;
                            nsglobal.location = product.generateURL();
                        }

                        if (data.corrections && data.corrections.length > 0) {
                            if (item.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server') {
                                nsglobal.statusCode = 301;
                                nsglobal.location = data.corrections[0].url + product.getQuery();
                            } else {
                                return Backbone.history.navigate('#' + data.corrections[0].url + product.getQuery(), { trigger: true });
                            }
                        }

                        view = new ViewConstructor({
                            model: product,
                            baseUrl: baseUrl,
                            application: application
                        });
                        // then we show the content
                        view.showContent();
                    } else if (jqXhr.status >= 500) {
                        application.getLayout().internalError();
                    } else if (jqXhr.responseJSON.errorCode !== 'ERR_USER_SESSION_TIMED_OUT') {
                        // We just show the 404 page
                        application.getLayout().notFound();
                    }

                    return true;
                }, function fetchError(jqXhr) {
                    // Error function
                    // this will stop the ErrorManagment module to process this error
                    // as we are taking care of it
                    try {
                        jqXhr.preventDefault = true;
                    } catch (e) {
                        console.log(e.message);
                    }

                    if (jqXhr.status >= 500) {
                        application.getLayout().internalError();
                    } else if (jqXhr.responseJSON.errorCode !== 'ERR_USER_SESSION_TIMED_OUT') {
                        // We just show the 404 page
                        application.getLayout().notFound();
                    }
                }
            );
        }
    });
});
